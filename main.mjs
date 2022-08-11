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

import { default as bpsGraph } from './lib/graphs/bps.mjs';
import { default as ppsGraph } from './lib/graphs/pps.mjs';
import { default as flowsGraph } from './lib/graphs/flows.mjs';
import { default as summaryStats } from './lib/humanreadable/summaryStats.mjs';

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

for (let i = 0; i < config.testProfiles.length; i++) {
  // # 10

  // sleep for 5 seconds to allow previous runs to fully exit
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
    const summaryStatsData = {
      tx_bps: [],
      rx_bps: [],
      tx_pps: [],
      rx_pps: [],
      rx_drop_bps: [],
      active_flows: [],
      tx_cps: [],
    };

    const bpsData = {
      tx_bps: [],
      rx_bps: [],
      rx_drop_bps: [],
    };

    const ppsData = {
      tx_pps: [],
      rx_pps: [],
    };

    const flowsData = {
      tx_cps: [],
      active_flows: [],
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

          // push data for our summary stats at the end
          summaryStatsData.tx_bps.push(input.stats.global.tx_bps);
          summaryStatsData.rx_bps.push(input.stats.global.rx_bps);
          summaryStatsData.tx_pps.push(input.stats.global.tx_pps);
          summaryStatsData.rx_pps.push(input.stats.global.rx_pps);
          summaryStatsData.rx_drop_bps.push(input.stats.global.rx_drop_bps);
          summaryStatsData.active_flows.push(input.stats.global.active_flows);
          summaryStatsData.tx_cps.push(input.stats.global.tx_cps);

          bpsData.tx_bps.push({
            x: timestamp,
            y: tx_bps
          });

          bpsData.rx_bps.push({
            x: timestamp,
            y: rx_bps
          });

          bpsData.rx_drop_bps.push({
            x: timestamp,
            y: rx_drop_bps
          });

          ppsData.tx_pps.push({
            x: timestamp,
            y: tx_pps
          });
          ppsData.rx_pps.push({
            x: timestamp,
            y: rx_pps
          });

          flowsData.tx_cps.push({
            x: timestamp,
            y: tx_cps
          });
          flowsData.active_flows.push({
            x: timestamp,
            y: active_flows
          });

        } catch (error) {
          clog.error(error);
          break;
        }
      }
    }

    // Print summary stats
    summaryStats.printSummaryStats(summaryStats);

    // setup graph title and config
    const graphTitle = `dut:${config.dutName} run:${config.runName} name:${prof.name} mult:${prof.mult} dur:${config.duration} prof:${prof.file}`;

    const bpsGraphB64Image = bpsGraph.drawGraph(bpsData, graphTitle, config, prof);
    const ppsGraphB64Image = ppsGraph.drawGraph(ppsData, graphTitle, config, prof);
    const flowsGraphB64Image = flowsGraph.drawGraph(flowsData, graphTitle, config, prof);

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
