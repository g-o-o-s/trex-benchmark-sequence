'use strict';

import { default as Canvas } from 'canvas';
import { default as Chartjs } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { default as clog } from 'ee-log';
import { default as Hjson } from 'hjson';
import { default as child_process } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { default as prettyMilliseconds } from 'pretty-ms';

import { drawGraph as bpsDrawGraph, bpsData } from './lib/graphs/bps.mjs';
import { drawGraph as ppsDrawGraph, ppsData } from './lib/graphs/pps.mjs';
import { drawGraph as flowsDrawGraph, flowsData} from './lib/graphs/flows.mjs';
import { printSummaryStats, summaryStatsData } from './lib/humanreadable/summaryStats.mjs';

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
            y: input.stats.global.tx_bps / 1000000
          });

          bpsData.rx_bps.push({
            x: timestamp,
            y: input.stats.global.rx_bps / 1000000
          });

          bpsData.rx_drop_bps.push({
            x: timestamp,
            y: input.stats.global.rx_drop_bps / 1000000
          });

          ppsData.tx_pps.push({
            x: timestamp,
            y: input.stats.global.tx_pps
          });
          ppsData.rx_pps.push({
            x: timestamp,
            y: input.stats.global.rx_pps
          });

          flowsData.tx_cps.push({
            x: timestamp,
            y: input.stats.global.tx_cps
          });
          flowsData.active_flows.push({
            x: timestamp,
            y: input.stats.global.active_flows
          });

        } catch (error) {
          clog.error(error);
          break;
        }
      }
    }

    // Print summary stats
    printSummaryStats(summaryStatsData);

    // setup graph title and config
    const graphTitle = `dut:${config.dutName} run:${config.runName} name:${prof.name} mult:${prof.mult} dur:${config.duration} prof:${prof.file}`;

    const bpsGraphB64Image = bpsDrawGraph(bpsData, graphTitle, config, prof);
    const ppsGraphB64Image = ppsDrawGraph(ppsData, graphTitle, config, prof);
    const flowsGraphB64Image = flowsDrawGraph(flowsData, graphTitle, config, prof);

    console.log('');

    const finishTime = new Date();
    const expectedFinishTime = new Date(startTime.getTime() + (1000 * config.duration));

    console.log(`Expected run time: ${config.duration}s`);
    console.log(`Run start time: ${startTime.toUTCString()}`);
    console.log(`Run end time: ${finishTime.toUTCString()}`);
    console.log(`Total run time: ${prettyMilliseconds(finishTime.getTime() - startTime.getTime())}`);

    var diff = (expectedFinishTime.getTime() - finishTime.getTime());
    var sign = diff < 0 ? -1 : 1;
    console.log(
      sign === -1 ? "Over by" : "Under by",
      prettyMilliseconds(diff)
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
