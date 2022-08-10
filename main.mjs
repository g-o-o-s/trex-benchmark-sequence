#!/usr/bin/env node
'use strict';

import { default as Canvas } from 'canvas';
import { default as Chartjs } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { default as clog } from 'ee-log';
import { default as Hjson } from 'hjson';
import { default as child_process } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { default as prettyms } from 'pretty-ms';

console.log(`--- Logs begin at ${new Date().toUTCString()} ---`);

// path relative to repo root
const astfpyPath = 'pyastf/astf.py';

// node main.mjs foo.hjson
const testProfile = process.argv[2];

const config = Hjson.parse(readFileSync(`profiles/${testProfile}.hjson`).toString());

for (let i = 0; i < config.testProfiles.length; i++) {
  // # 10

  // whoami
  const prof = config.testProfiles[i];

  // Is the profile enabled?
  if (prof.enabled === true) {

    const startTime = new Date();
    console.log(`--- Starting run ${prof.name} at ${startTime.toUTCString()} ---`);
  
    // setup array for json output file
    const outputJson = [];
  
    // object of arrays for final human readable stats
    const summaryStats = {
      tx_bps: [],
      rx_bps: [],
      rx_drop_bps: [],
    };
  
    // note the use of spawnSync here - this could be improved with like, locking and a worker pool and stuff
    const child = child_process.spawnSync(
      astfpyPath,
      [
        '-r', `${config.server}`,
        '-m', `${prof.mult}`,
        '-d', `${config.duration}`,
        '-f', `${prof.file}`,
        '-s', `${config.sleep}`
      ],
      {
        stdio: ['ignore', 'pipe', 'inherit'],
      }
    );
  
    // setup datasets for graph
    const data = {
      datasets: [{
        label: 'tx_bps',
        borderColor: "rgb(88, 107, 164)",
        backgroundColor: "rgba(88, 107, 164, 0.2)",
        fill: 1,
        tension: 0.1,
        data: [],
      },
      {
        label: 'rx_bps',
        borderColor: "rgb(245, 221, 144)",
        backgroundColor: "rgba(245, 221, 144, 0.2)",
        fill: 2,
        tension: 0.1,
        data: [],
      },
      {
        label: 'rx_drop_bps',
        borderColor: "rgb(247, 108, 94)",
        backgroundColor:"rgba(247, 108, 94, 0.2)",
        fill: 'origin',
        tension: 0.1,
        data: [],
      }]
    };
  
    // process stdout
    const stdout = child.stdout.toString().split('\n');
    for (let j = 0; j < stdout.length; j++) {
      var input = stdout[j].toString();
  
      // yes this happens even though the python callee never outputs a blank line...
      if (input != '') {
        input = JSON.parse(input);
        outputJson.push(input);
  
        // this is all for the human readable
        const timestamp = new Date(input.timestamp);
        const hours = timestamp.getHours();
        const minutes = "0" + timestamp.getMinutes();
        const seconds = "0" + timestamp.getSeconds();
        const displayTime = `${hours}:${minutes}:${seconds}`;
      
        const tx_bps = input.stats.global.tx_bps / 1000000;
        const rx_bps = input.stats.global.rx_bps / 1000000;
        const rx_drop_bps = input.stats.global.rx_drop_bps / 1000000;
  
        // push data for our summary stats at the end
        summaryStats.tx_bps.push(tx_bps);
        summaryStats.rx_bps.push(rx_bps);
        summaryStats.rx_drop_bps.push(rx_drop_bps);
  
        // and here we push data for the graph
        data.datasets[0].data.push({
          x: timestamp,
          y: tx_bps
        });
        data.datasets[1].data.push({
          x: timestamp,
          y: rx_bps
        });
        data.datasets[2].data.push({
          x: timestamp,
          y: rx_drop_bps
        });
      }
    }
  
    // setup graph title and config
    const graphTitle = `dut:${config.dutName} run:${config.runName} name:${prof.name} mult:${prof.mult} dur:${config.duration} prof:${prof.file}`;
    const graphConfig = {
      type: 'line',
      data: data,
      options: {
        plugins: {
          title: {
            display: true,
            text: graphTitle,
            font: {
              family: "monospace",
              size: 30,
            }
          },
          legend: {
            position: 'top',
            align: 'left',
            labels: {
              boxWidth: 18,
              boxHeight: 18,
              font: {
                family: "monospace",
                size: 28,
              }
            }
          }
        },
        elements: {
          point: {
            radius: 0,
          },
        },
        scales: {
          x: {
            ticks: {
              font: {
                family: "monospace",
                size: 20,
              },
            },
            type: 'timeseries',
            time: {
              displayFormats: {
                millisecond: 'hh:mm:ss'
              },
              unit: 'millisecond',
              stepSize: 4000,
            },
          },
          y: {
            ticks: {
              font: {
                family: "monospace",
                size: 26,
              }
            },
            position: 'right',
            type: 'linear',
            suggestedMin: '100',
            title: {
              text: 'Mbps',
              display: true,
              font: {
                family: "monospace",
                size: 30,
              }
            }
          }
        }
      },
      layout: {
        padding: {
          top: 20,
          right: 20,
          left: 20,
          bottom: 20
        }
      },
    };
  
    // do the graph
    const canvas = Canvas.createCanvas(2400,800);
    const canvasContext = canvas.getContext('2d');
    const graph = new Chartjs.Chart(
      canvasContext,
      graphConfig
    );
  
    // convert graph to base64 and set it up for being stuffed into a file
    const graphB64Data = graph.toBase64Image();
    const graphB64Image = graphB64Data.replace(/^data:image\/\w+;base64,/, '');
  
    // some basic analysis
    summaryStats.tx_bps = filterOutliers(summaryStats.tx_bps);
    summaryStats.rx_bps = filterOutliers(summaryStats.rx_bps);
    summaryStats.rx_drop_bps = filterOutliers(summaryStats.rx_drop_bps)
  
    summaryStats.tx_bps_stddev = arr_stddev(summaryStats.tx_bps);
    summaryStats.rx_bps_stddev = arr_stddev(summaryStats.rx_bps);
    summaryStats.rx_drop_bps_stddev = arr_stddev(summaryStats.rx_drop_bps);
  
    summaryStats.tx_bps_mean = arr_mean(summaryStats.tx_bps);
    summaryStats.rx_bps_mean = arr_mean(summaryStats.rx_bps);
    summaryStats.rx_drop_bps_mean = arr_mean(summaryStats.rx_drop_bps);
  
    summaryStats.tx_bps_max = Math.max(...summaryStats.tx_bps);
    summaryStats.rx_bps_max = Math.max(...summaryStats.rx_bps);
    summaryStats.rx_drop_bps_max = Math.max(...summaryStats.rx_drop_bps);
  
    summaryStats.tx_bps_min = Math.min(...summaryStats.tx_bps);
    summaryStats.rx_bps_min = Math.min(...summaryStats.rx_bps);
    summaryStats.rx_drop_bps_min = Math.min(...summaryStats.rx_drop_bps);
  
    // i love formatting text for output, don't you?
    console.log('');
    console.log('All datasets have had outliers trimmed for this summary display.');
  
    console.log('');
    console.log('averages:');
    console.log(`tx_bps: ${summaryStats.tx_bps_mean}`);
    console.log(`rx_bps: ${summaryStats.rx_bps_mean}`);
    console.log(`rx_drop_bps: ${summaryStats.rx_drop_bps_mean}`);
  
    console.log('');
    console.log('stddevs:');
    console.log(`tx_bps: ${summaryStats.tx_bps_stddev}`);
    console.log(`rx_bps: ${summaryStats.rx_bps_stddev}`);
    console.log(`rx_drop_bps: ${summaryStats.rx_drop_bps_stddev}`);
  
    console.log('');
    console.log('max:');
    console.log(`tx_bps: ${summaryStats.tx_bps_max}`);
    console.log(`rx_bps: ${summaryStats.rx_bps_max}`);
    console.log(`rx_drop_bps: ${summaryStats.rx_drop_bps_max}`);
  
    console.log('');
    console.log('min:');
    console.log(`tx_bps: ${summaryStats.tx_bps_min}`);
    console.log(`rx_bps: ${summaryStats.rx_bps_min}`);
    console.log(`rx_drop_bps: ${summaryStats.rx_drop_bps_min}`);
  
    console.log('');
  
    const finishTime = new Date();
    const expectedFinishTime = new Date(startTime.getTime() + (1000 * config.duration));
  
    console.log(`Expected run time: ${config.duration}s`);
    console.log(`Run start time: ${startTime.toUTCString()}`);
    console.log(`Run end time: ${finishTime.toUTCString()}`);
    
    var diff = (finishTime.getTime() - expectedFinishTime.getTime());
    var sign = diff < 0 ? -1 : 1;
    console.log(
      sign === 1 ? "Over by" : "Under by",
      prettyms(diff)
    );
  
    console.log('');
  
    // build our dirs
    const filePath = `./output/${config.dutName}/${config.runName}/${startTime.toJSON().replaceAll(':', '-')}/${prof.name}/`
    const fileName = `${prof.name}-mult_${prof.mult}-dur_${config.duration}-${startTime.toJSON().replaceAll(':', '-')}`
  
    // create the output dir if required
    if (!existsSync(filePath)){
      mkdirSync(filePath, { recursive: true });
    }
  
    // and finally output our files
    writeFileSync(`${filePath}/${fileName}.png`, graphB64Image, {encoding: 'base64'});
    writeFileSync(`${filePath}/${fileName}.json`, JSON.stringify(outputJson, null, 2));
  
    // tell user where we wrote our png/json
    console.log(`Wrote output to ${filePath}`);
  
    console.log('');
  
    console.log(`--- Finished run ${prof.name} at ${finishTime.toUTCString()} ---`);
  
  } else {
    console.log(`--- ${prof.name} disabled, skipping ---`);
  }

  // GOTO 10
}

// stole these from various stackoverflow threads
function arr_stddev(arr) {
  // Creating the mean with Array.reduce
  let mean = arr.reduce((acc, curr)=>{
    return acc + curr;
  }, 0) / arr.length;
   
  // Assigning (value - mean) ^ 2 to every array item
  arr = arr.map((k)=>{
    return (k - mean) ** 2;
  })
   
  // Calculating the sum of updated array
 let sum = arr.reduce((acc, curr)=> acc + curr, 0);
  
 // Calculating the variance
 let variance = sum / arr.length;
  
 // Returning the Standered deviation
 return Math.sqrt(sum / arr.length);
}

function arr_mean(arr) {
  const total = arr.reduce((acc, c) => acc + c, 0);
  const mean = total / arr.length;
  return mean;
}

// Clear outliers from our datasets - only used in human readable display
function filterOutliers(someArray) {  

  // Copy the values, rather than operating on references to existing values
  var values = someArray.concat();

  // Then sort
  values.sort( function(a, b) {
          return a - b;
       });

  /* Then find a generous IQR. This is generous because if (values.length / 4) 
   * is not an int, then really you should average the two elements on either 
   * side to find q1.
   */     
  var q1 = values[Math.floor((values.length / 4))];
  // Likewise for q3. 
  var q3 = values[Math.ceil((values.length * (3 / 4)))];
  var iqr = q3 - q1;

  // Then find min and max values
  var maxValue = q3 + iqr*1.5;
  var minValue = q1 - iqr*1.5;

  // Then filter anything beyond or beneath these values.
  var filteredValues = values.filter(function(x) {
      return (x <= maxValue) && (x >= minValue);
  });

  // Then return
  return filteredValues;
}
