#!/usr/bin/env node
'use strict';

import { default as Canvas } from 'canvas';
import { default as Chartjs } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { default as clog } from 'ee-log';
import { default as Hjson } from 'hjson';
import { default as child_process } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

console.log(`--- Logs begin at ${new Date().toUTCString()} ---`)

// path relative to repo root
const astfpyPath = 'pyastf/astf.py'

// node main.mjs foo.hjson
const testProfile = process.argv[2];

const config = Hjson.parse(readFileSync(`profiles/${testProfile}`).toString());

for (let i = 0; i < config.testProfiles.length; i++) {
  // whoami
  const prof = config.testProfiles[i];
  clog.info('Spawning profile', prof.name);
  clog.debug('Profile config', prof);

  // setup array for json output file
  const outputJson = [];

  // note the use of spawnSync here - this could be improved with like, locking and a worker pool and stuff
  const child = child_process.spawnSync(
    astfpyPath,
    [
      '-r', `${config.server}`,
      '-m', `${prof.mult}`,
      '-d', `${prof.duration}`,
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
  const graphTitle = `m:${prof.mult} d:${prof.duration} f:${prof.file}`;
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
            size: 36,
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
  const canvas = Canvas.createCanvas(2400,800)
  const canvasContext = canvas.getContext('2d')
  const graph = new Chartjs.Chart(
    canvasContext,
    graphConfig
  );

  // convert graph to base64 and set it up for being stuffed into a file
  const graphB64Data = graph.toBase64Image();
  const graphB64Image = graphB64Data.replace(/^data:image\/\w+;base64,/, '');

  // build our dirs
  const timestamp = Date.now();
  const filePath = `output/${config.dutName}/${config.runName}/${prof.name}`
  const fileName = `${prof.name}-mult_${prof.mult}-dur_${prof.duration}-${timestamp}`

  // create the output dir if required
  if (!existsSync(filePath)){
    mkdirSync(filePath, { recursive: true });
  }

  // and finally output our files
  writeFileSync(`${filePath}/${fileName}.png`, graphB64Image, {encoding: 'base64'});
  writeFileSync(`${filePath}/${fileName}.json`, JSON.stringify(outputJson));
  
  console.log(`Wrote output to ${filePath}/`)

  // GOTO 10
}
