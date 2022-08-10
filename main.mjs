#!/usr/bin/env node
'use strict';

import { default as Canvas } from 'canvas';
import { default as Chartjs } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { default as clog } from 'ee-log';
import { default as Hjson } from 'hjson';
import { default as child_process } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log(`--- Logs begin at ${new Date().toUTCString()} ---`)

// path relative to repo root
const astfpyPath = 'pyastf/astf.py'

const testProfile = process.argv[2];

const profiles = Hjson.parse(readFileSync(`profiles/${testProfile}`).toString());

for (let i = 0; i < profiles.length; i++) {
  const prof = profiles[i];
  clog.info('Spawning profile', prof.name);
  clog.debug('Profile config', prof);

  const outputJson = [];

  const child = child_process.spawnSync(
    astfpyPath,
    [
      '-r', `${prof.server}`,
      '-m', `${prof.mult}`,
      '-d', `${prof.duration}`,
      '-f', `trex-core/scripts/${prof.file}`,
      '-s', `${prof.sleep}`
    ],
    {
      stdio: ['ignore', 'pipe', 'inherit'],
    }
  );

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

  const stdout = child.stdout.toString().split('\n');
  for (let j = 0; j < stdout.length; j++) {
    var input = stdout[j].toString();
    if (input != '') {
      input = JSON.parse(input);
      outputJson.push(input);

      const timestamp = new Date(input.timestamp);
      const hours = timestamp.getHours();
      const minutes = "0" + timestamp.getMinutes();
      const seconds = "0" + timestamp.getSeconds();
      const displayTime = `${hours}:${minutes}:${seconds}`;
    
      const tx_bps = input.stats.global.tx_bps / 1000000;
      const rx_bps = input.stats.global.rx_bps / 1000000;
      const rx_drop_bps = input.stats.global.rx_drop_bps / 1000000;
    
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

  const graphTitle = `m:${prof.mult} d:${prof.duration} f:${prof.file}`;

  const config = {
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
  const canvas = Canvas.createCanvas(2400,800)
  const ctx = canvas.getContext('2d')
    const myChart = new Chartjs.Chart(
    ctx,
    config
  );

  const b64Data = myChart.toBase64Image();
  const b64Image = b64Data.replace(/^data:image\/\w+;base64,/, '');

  const timestamp = Date.now();
  writeFileSync(`output/graph/${prof.name}-mult_${prof.mult}-dur_${prof.duration}-sleep_${prof.sleep}-${timestamp}.png`, b64Image, {encoding: 'base64'});
  writeFileSync(`output/json/${prof.name}-mult_${prof.mult}-dur_${prof.duration}-sleep_${prof.sleep}-${timestamp}.json`, JSON.stringify(outputJson));
}
