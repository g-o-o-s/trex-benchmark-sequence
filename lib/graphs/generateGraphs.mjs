/* eslint-disable security/detect-object-injection */
'use strict';

import { writeFileSync, existsSync, mkdirSync } from 'fs';

import { drawGraph as bpsDrawGraph, bpsData } from './bps.mjs';
import { drawGraph as ppsDrawGraph, ppsData } from './pps.mjs';
import { drawGraph as flowsDrawGraph, flowsData } from './flows.mjs';

export async function drawGraphs(testProfile) {
  const data = testProfile.data;
  // Chew data into arrays
  data.forEach((snapshot) => {
    if (snapshot.timestamp && snapshot.stats) {
      bpsData.tx_bps.push({
        x: snapshot.timestamp,
        y: snapshot.stats.m_tx_bps / 1000000,
      });
      bpsData.rx_bps.push({
        x: snapshot.timestamp,
        y: snapshot.stats.m_rx_bps / 1000000,
      });
      bpsData.rx_drop_bps.push({
        x: snapshot.timestamp,
        y: snapshot.stats.m_rx_drop_bps / 1000000,
      });

      ppsData.tx_pps.push({
        x: snapshot.timestamp,
        y: snapshot.stats.m_tx_pps,
      });
      ppsData.rx_pps.push({
        x: snapshot.timestamp,
        y: snapshot.stats.m_rx_pps,
      });
      ppsData.delta.push({
        x: snapshot.timestamp,
        y: Math.abs(snapshot.stats.m_tx_pps - snapshot.stats.m_rx_pps),
      });

      flowsData.tx_cps.push({
        x: snapshot.timestamp,
        y: snapshot.stats.m_tx_cps,
      });
      flowsData.active_flows.push({
        x: snapshot.timestamp,
        y: snapshot.stats.m_active_flows,
      });
    }
  });

  // Build our dirs
  const pathTime = testProfile.initTime
    .toJSON()
    .replaceAll(':', '-')
    .substring(0, 19);

  const filenameTime = testProfile.stepInitTime.toJSON().replaceAll(':', '-');
  const filePath = `./output/${testProfile.dutName}/${testProfile.runName}/${pathTime}/${testProfile.name}/`;

  const fileName = `mult${testProfile.mult}-dur${testProfile.duration}-${filenameTime}`;

  // Create the output dir if required
  if (!existsSync(filePath)) {
    mkdirSync(filePath, { recursive: true });
  }

  // Setup title
  const graphTitle = `dut:${testProfile.dutName} seq:${testProfile.sequenceName} prof:${testProfile.name} run:${testProfile.runName} mult:${testProfile.mult} dur:${testProfile.duration}`;

  // Cook the toast
  const bpsGraphB64Image = bpsDrawGraph(bpsData, graphTitle);
  const ppsGraphB64Image = ppsDrawGraph(ppsData, graphTitle);
  const flowsGraphB64Image = flowsDrawGraph(flowsData, graphTitle);

  // And finally output our files
  writeFileSync(`${filePath}/${fileName}-bits.png`, bpsGraphB64Image, { encoding: 'base64' });
  writeFileSync(`${filePath}/${fileName}-packets.png`, ppsGraphB64Image, { encoding: 'base64' });
  writeFileSync(`${filePath}/${fileName}-flows.png`, flowsGraphB64Image, { encoding: 'base64' });
  writeFileSync(`${filePath}/${fileName}-data.json`, JSON.stringify(data, null, 2));
  writeFileSync(`${filePath}/${fileName}-profile.json`, JSON.stringify(testProfile.json, null, 2));
  writeFileSync(`${filePath}/${fileName}-sequence.json`, testProfile.sequence); // Stringified earlier for us in runSequenceFile()
}
