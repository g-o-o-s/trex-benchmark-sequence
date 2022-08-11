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


const initTime = new Date();

console.log(`--- Logs begin at ${initTime.toUTCString()} ---`);

// path relative to repo root
const astfpyPath = 'pyastf/astf.py';

// node main.mjs foo.hjson
const testProfile = process.argv[2];

const config = Hjson.parse(readFileSync(`profiles/${testProfile}.hjson`).toString());

const filePath = `./output/${config.dutName}/${config.runName}/${initTime.toJSON().replaceAll(':', '-').substring(0, 19)}/`
// create the output dir if required
if (!existsSync(filePath)){
  mkdirSync(filePath, { recursive: true });
}
writeFileSync(`${filePath}/profile.json`, JSON.stringify(config, null, 2));

const color1 = '216, 17, 89';
const color2 = '143, 45, 86';
const color3 = '33, 131, 128';
const color4 = '251, 177, 60';
const color5 = '115, 210, 222';

for (let i = 0; i < config.testProfiles.length; i++) {
  // # 10

  await new Promise(r => setTimeout(r, 5000));

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
      tx_pps: [],
      rx_pps: [],
      rx_drop_bps: [],
      active_flows: [],
      tx_cps: [],
    };

    // setup datasets for graph
    const bpsData = {
      datasets: [
        {
          label: 'tx_bps',
          borderColor: `rgb(${color1})`,
          backgroundColor: `rgba(${color1}, 0.1)`,
          fill: 'origin',
          yAxisID: 'yRight',
          data: [],
        },
        {
          label: 'rx_bps',
          borderColor: `rgb(${color3})`,
          backgroundColor: `rgba(${color3}, 0.1)`,
          fill: 'origin',
          yAxisID: 'yRight',
          data: [],
        },
        {
          label: 'rx_drop_bps',
          borderColor: `rgb(${color4})`,
          backgroundColor: `rgba(${color4}, 0.1)`,
          fill: 'origin',
          yAxisID: 'yRight',
          data: [],
        }
      ]
    };

    const ppsData = {
      datasets: [
        {
          label: 'tx_pps',
          borderColor: `rgb(${color1})`,
          backgroundColor: `rgba(${color1}, 0.1)`,
          fill: 'origin',
          yAxisID: 'yRight',
          data: [],
        },
        {
          label: 'rx_pps',
          borderColor: `rgb(${color3})`,
          backgroundColor: `rgba(${color3}, 0.1)`,
          fill: 'origin',
          yAxisID: 'yRight',
          data: [],
        },
      ]
    };

    const flowsData = {
      datasets: [
        {
          label: 'tx_cps',
          borderColor: `rgb(${color1})`,
          backgroundColor: `rgba(${color1}, 0.1)`,
          fill: 'origin',
          yAxisID: 'yLeft',
          data: [],
        },
        {
          label: 'active_flows',
          borderColor: `rgb(${color3})`,
          backgroundColor: `rgba(${color3}, 0.1)`,
          fill: 'origin',
          yAxisID: 'yRight',
          data: [],
        }
      ]
    };

    // note the use of spawnSync here - this could be improved with like, locking and a worker pool and stuff
    const argsArray = [
      '-r', config.server,
      '-m', prof.mult,
      '-d', config.duration,
      '-f', prof.file,
      '-s', config.sleep,
      '-l', config.latencyRate
    ];

    if (typeof prof.tuneables === undefined || prof.tuneables === '') {
      argsArray.push(`-t "${prof.tuneables}"`)
    }

    const child = child_process.spawnSync(
      astfpyPath,
      argsArray,
      {
        stdio: ['ignore', 'pipe', 'inherit'],
      }
    );

    // process stdout
    const stdout = child.stdout.toString().split('\n');

    for (let j = 0; j < stdout.length; j++) {
      var input = stdout[j].toString();

      // yes this happens even though the python callee never outputs a blank line...
      if (input != '') {
        try {
          input = JSON.parse(input);
          outputJson.push(input);

          // this is all for the human readable
          const timestamp = new Date(input.timestamp);

          const tx_bps = input.stats.global.tx_bps / 1000000;
          const rx_bps = input.stats.global.rx_bps / 1000000;
          const tx_pps = input.stats.global.tx_pps;
          const rx_pps = input.stats.global.rx_pps;
          const rx_drop_bps = input.stats.global.rx_drop_bps / 1000000;
          const active_flows = input.stats.global.active_flows;
          const tx_cps = input.stats.global.tx_cps;

          // push data for our summary stats at the end
          summaryStats.tx_bps.push(tx_bps);
          summaryStats.rx_bps.push(rx_bps);
          summaryStats.tx_pps.push(tx_pps);
          summaryStats.rx_pps.push(rx_pps);
          summaryStats.rx_drop_bps.push(rx_drop_bps);
          summaryStats.active_flows.push(active_flows);
          summaryStats.tx_cps.push(tx_cps);

          // and here we push data for the graph
          bpsData.datasets[0].data.push({
            x: timestamp,
            y: tx_bps
          });
          bpsData.datasets[1].data.push({
            x: timestamp,
            y: rx_bps
          });
          bpsData.datasets[2].data.push({
            x: timestamp,
            y: rx_drop_bps
          });

          ppsData.datasets[0].data.push({
            x: timestamp,
            y: tx_pps
          });
          ppsData.datasets[1].data.push({
            x: timestamp,
            y: rx_pps
          });

          flowsData.datasets[0].data.push({
            x: timestamp,
            y: tx_cps
          });
          flowsData.datasets[1].data.push({
            x: timestamp,
            y: active_flows
          });

        } catch (error) {
          clog.error(error);
          break;
        }
      }
    }

    // setup graph title and config
    const graphTitle = `dut:${config.dutName} run:${config.runName} name:${prof.name} mult:${prof.mult} dur:${config.duration} prof:${prof.file}`;

    const bpsGraphConfig = {
      type: 'line',
      data: bpsData,
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
          yRight: {
            id: 'yRight',
            position: 'right',
            ticks: {
              font: {
                family: "monospace",
                size: 24,
              }
            },
            type: 'linear',
            title: {
              text: 'Mbps',
              display: true,
              font: {
                family: "monospace",
                size: 30,
              }
            },
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
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

    const ppsGraphConfig = {
      type: 'line',
      data: ppsData,
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
          yRight: {
            id: 'yRight',
            position: 'right',
            ticks: {
              font: {
                family: "monospace",
                size: 24,
              }
            },
            type: 'linear',
            title: {
              text: 'Packets / Second',
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

    const flowsGraphConfig = {
      type: 'line',
      data: flowsData,
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
          yLeft: {
            id: 'yLeft',
            position: 'left',
            ticks: {
              font: {
                family: "monospace",
                size: 24,
              }
            },
            type: 'linear',
            title: {
              text: 'Connections / Second',
              display: true,
              font: {
                family: "monospace",
                size: 30,
              }
            }
          },
          yRight: {
            id: 'yRight',
            position: 'right',
            ticks: {
              font: {
                family: "monospace",
                size: 24,
              }
            },
            type: 'linear',
            title: {
              text: 'Active Flows',
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
    const bpsCanvas = Canvas.createCanvas(2400,800);
    const bpsCanvasContext = bpsCanvas.getContext('2d');
    const bpsGraph = new Chartjs.Chart(
      bpsCanvasContext,
      bpsGraphConfig
    );

    const ppsCanvas = Canvas.createCanvas(2400,800);
    const ppsCanvasContext = ppsCanvas.getContext('2d');
    const ppsGraph = new Chartjs.Chart(
      ppsCanvasContext,
      ppsGraphConfig
    );

    const flowsCanvas = Canvas.createCanvas(2400,800);
    const flowsCanvasContext = flowsCanvas.getContext('2d');
    const flowsGraph = new Chartjs.Chart(
      flowsCanvasContext,
      flowsGraphConfig
    );

    // convert graph to base64 and set it up for being stuffed into a file
    const bpsGraphB64Data = bpsGraph.toBase64Image();
    const bpsGraphB64Image = bpsGraphB64Data.replace(/^data:image\/\w+;base64,/, '');

    const ppsGraphB64Data = ppsGraph.toBase64Image();
    const ppsGraphB64Image = ppsGraphB64Data.replace(/^data:image\/\w+;base64,/, '');

    const flowsGraphB64Data = flowsGraph.toBase64Image();
    const flowsGraphB64Image = flowsGraphB64Data.replace(/^data:image\/\w+;base64,/, '');

    // some basic analysis
    summaryStats.tx_bps = filterOutliers(summaryStats.tx_bps);
    summaryStats.rx_bps = filterOutliers(summaryStats.rx_bps);
    summaryStats.tx_pps = filterOutliers(summaryStats.tx_pps);
    summaryStats.rx_pps = filterOutliers(summaryStats.rx_pps);
    summaryStats.rx_drop_bps = filterOutliers(summaryStats.rx_drop_bps);
    summaryStats.active_flows = filterOutliers(summaryStats.active_flows);
    summaryStats.tx_cps = filterOutliers(summaryStats.tx_cps);

    summaryStats.tx_bps_stddev = arr_stddev(summaryStats.tx_bps);
    summaryStats.rx_bps_stddev = arr_stddev(summaryStats.rx_bps);
    summaryStats.tx_pps_stddev = arr_stddev(summaryStats.tx_pps);
    summaryStats.rx_pps_stddev = arr_stddev(summaryStats.rx_pps);
    summaryStats.rx_drop_bps_stddev = arr_stddev(summaryStats.rx_drop_bps);
    summaryStats.active_flows_stddev = arr_stddev(summaryStats.active_flows);
    summaryStats.tx_cps_stddev = arr_stddev(summaryStats.tx_cps);

    summaryStats.tx_bps_mean = arr_mean(summaryStats.tx_bps);
    summaryStats.rx_bps_mean = arr_mean(summaryStats.rx_bps);
    summaryStats.tx_pps_mean = arr_mean(summaryStats.tx_pps);
    summaryStats.rx_pps_mean = arr_mean(summaryStats.rx_pps);
    summaryStats.rx_drop_bps_mean = arr_mean(summaryStats.rx_drop_bps);
    summaryStats.active_flows_mean = arr_mean(summaryStats.active_flows);
    summaryStats.tx_cps_mean = arr_mean(summaryStats.tx_cps);

    summaryStats.tx_bps_max = Math.max(...summaryStats.tx_bps);
    summaryStats.rx_bps_max = Math.max(...summaryStats.rx_bps);
    summaryStats.tx_pps_max = Math.max(...summaryStats.tx_pps);
    summaryStats.rx_pps_max = Math.max(...summaryStats.rx_pps);
    summaryStats.rx_drop_bps_max = Math.max(...summaryStats.rx_drop_bps);
    summaryStats.active_flows_max = Math.max(...summaryStats.active_flows);
    summaryStats.tx_cps_max = Math.max(...summaryStats.tx_cps);

    summaryStats.tx_bps_min = Math.min(...summaryStats.tx_bps);
    summaryStats.rx_bps_min = Math.min(...summaryStats.rx_bps);
    summaryStats.tx_pps_min = Math.min(...summaryStats.tx_pps);
    summaryStats.rx_pps_min = Math.min(...summaryStats.rx_pps);
    summaryStats.rx_drop_bps_min = Math.min(...summaryStats.rx_drop_bps);
    summaryStats.active_flows_min = Math.min(...summaryStats.active_flows);
    summaryStats.tx_cps_min = Math.min(...summaryStats.tx_cps);

    // i love formatting text for output, don't you?
    console.log('');
    console.log('All datasets have had outliers trimmed for this summary display.');

    console.log('');
    console.log('averages:');
    console.log(`tx_bps: ${summaryStats.tx_bps_mean}`);
    console.log(`rx_bps: ${summaryStats.rx_bps_mean}`);
    console.log(`tx_pps: ${summaryStats.tx_pps_mean}`);
    console.log(`rx_pps: ${summaryStats.rx_pps_mean}`);
    console.log(`rx_drop_bps: ${summaryStats.rx_drop_bps_mean}`);
    console.log(`active_flows: ${summaryStats.active_flows_mean}`);
    console.log(`tx_cps: ${summaryStats.tx_cps_mean}`);

    console.log('');
    console.log('stddevs:');
    console.log(`tx_bps: ${summaryStats.tx_bps_stddev}`);
    console.log(`rx_bps: ${summaryStats.rx_bps_stddev}`);
    console.log(`tx_pps: ${summaryStats.tx_pps_stddev}`);
    console.log(`rx_pps: ${summaryStats.rx_pps_stddev}`);
    console.log(`rx_drop_bps: ${summaryStats.rx_drop_bps_stddev}`);
    console.log(`active_flows: ${summaryStats.active_flows_stddev}`);
    console.log(`tx_cps: ${summaryStats.tx_cps_stddev}`);

    console.log('');
    console.log('max:');
    console.log(`tx_bps: ${summaryStats.tx_bps_max}`);
    console.log(`rx_bps: ${summaryStats.rx_bps_max}`);
    console.log(`tx_pps: ${summaryStats.tx_pps_max}`);
    console.log(`rx_pps: ${summaryStats.rx_pps_max}`);
    console.log(`rx_drop_bps: ${summaryStats.rx_drop_bps_max}`);
    console.log(`active_flows: ${summaryStats.active_flows_max}`);
    console.log(`tx_cps: ${summaryStats.tx_cps_max}`);

    console.log('');
    console.log('min:');
    console.log(`tx_bps: ${summaryStats.tx_bps_min}`);
    console.log(`rx_bps: ${summaryStats.rx_bps_min}`);
    console.log(`tx_pps: ${summaryStats.tx_pps_min}`);
    console.log(`rx_pps: ${summaryStats.rx_pps_min}`);
    console.log(`rx_drop_bps: ${summaryStats.rx_drop_bps_min}`);
    console.log(`active_flows: ${summaryStats.active_flows_min}`);
    console.log(`tx_cps: ${summaryStats.tx_cps_min}`);

    console.log('');

    const finishTime = new Date();
    const expectedFinishTime = new Date(startTime.getTime() + (1000 * config.duration));

    console.log(`Expected run time: ${config.duration}s`);
    console.log(`Run start time: ${startTime.toUTCString()}`);
    console.log(`Run end time: ${finishTime.toUTCString()}`);
    console.log(`Total run time: ${prettyms(finishTime.getTime() - startTime.getTime())}`);

    var diff = (expectedFinishTime.getTime() - finishTime.getTime());
    var sign = diff < 0 ? -1 : 1;
    console.log(
      sign === -1 ? "Over by" : "Under by",
      prettyms(diff)
    );

    console.log('');

    // build our dirs
    const filePath = `./output/${config.dutName}/${config.runName}/${initTime.toJSON().replaceAll(':', '-').substring(0, 19)}/${prof.name}/`
    const fileName = `${config.dutName}-${config.runName}-${prof.name}-mult_${prof.mult}-dur_${config.duration}-${startTime.toJSON().replaceAll(':', '-')}`

    // create the output dir if required
    if (!existsSync(filePath)){
      mkdirSync(filePath, { recursive: true });
    }

    // and finally output our files
    writeFileSync(`${filePath}/${fileName}-bits.png`, bpsGraphB64Image, {encoding: 'base64'});
    writeFileSync(`${filePath}/${fileName}-packets.png`, ppsGraphB64Image, {encoding: 'base64'});
    writeFileSync(`${filePath}/${fileName}-flows.png`, flowsGraphB64Image, {encoding: 'base64'});
    writeFileSync(`${filePath}/${fileName}.json`, JSON.stringify(outputJson, null, 2));

    prof.sleep = config.sleep;
    prof.duration = config.duration;
    writeFileSync(`${filePath}/${fileName}-profile.json`, JSON.stringify(prof, null, 2));

    // tell user where we wrote our png/json
    console.log(`Wrote output to ${filePath}`);

    console.log('');

    console.log(`--- Finished run ${prof.name} at ${finishTime.toUTCString()} ---`);

  } else {
    // profile is disabled
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
