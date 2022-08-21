'use strict';

// The main event
import { default as Trex } from 'jsrex';

import { sleep } from '../misc/sleep.mjs';

// Setup our connection to Trex
const trex = new Trex({
  server: 'tcp://trex.straylight.goosga.ng:4501', // Default 127.0.0.1:4501
  debug: false, // Default false
  user: 'goos', // Default uuid.v4()
  manage_api_h: true, // Default true - Have the library manage the api_h variable for us
  manage_port_handler: true, // Default true - Have the lib manage the handler var (from acquire()) for us
});

export async function runAstfProfile(testProfile) {
  var statsInterval = null;
  var sleepDurationTimeout = null;
  // First setup a handler for SIGINT
  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down');
    if (sleepDurationTimeout != null) {
      clearTimeout(sleepDurationTimeout);
      // Stop traffic from the
      trex.stop({
        profile_id: testProfile.name,
      });
    }
    // Release ports
    await trex.release();
    if (statsInterval != null) clearInterval(statsInterval);
  });

  const data = [];
  console.log('Connecting to T-Rex');
  await trex.connect();
  await sleep(1000);

  let response = null;

  // Acquire ports
  console.log('Attempting to acquire ports');
  response = await trex.acquire({ session_id: testProfile.session_id, force: testProfile.force_acquire });
  if (response.error) {
    console.error(JSON.stringify(response.error, null, 2));
    return;
  }
  console.log(`Ports acquired, Session Handler: ${response.result.handler}`);
  console.log(`Port IDs: [0: ${response.result.ports['0']}] [1: ${response.result.ports['1']}]`);
  await sleep(1000);

  //
  // Upload the profile
  console.log('Uploading profile');
  // Clear existing profile
  await trex.profile_clear({
    profile_id: testProfile.name,
  });
  await sleep(1000);

  // Chunk and upload profile
  await trex.astf_load_profile(JSON.stringify(testProfile.json), testProfile.name);
  await sleep(1000);

  //
  // List profiles
  response = await trex.get_profile_list();
  console.log(`Available profiles: ${JSON.stringify(response.result)}`);
  await sleep(1000);

  //
  // Start sampling data
  console.log('Sampling data');
  statsInterval = setInterval(async () => {
    const response = await trex.get_global_stats();
    const stats = {
      timestamp: Date.now(),
      stats: response.result,
    };
    data.push(stats);
  }, testProfile.sampleInterval);
  await sleep(testProfile.warmup * 1000);

  console.log('Starting traffic');
  await trex.start({
    duration: -1, // We're handling the stopping of traffic
    mult: testProfile.mult || 1,
    nc: testProfile.nc || false,
    ipv6: testProfile.ipv6 || false,
    latency: testProfile.latencyRate || 0,
    profile_id: testProfile.name,
  });

  // Let it run for the duration
  sleepDurationTimeout = await sleep(testProfile.duration * 1000);

  console.log('Stopping traffic');
  await trex.stop({
    profile_id: testProfile.name,
  });

  // Sleep for cooldown
  await sleep(testProfile.cooldown * 1000);

  // Stop sampling stats
  clearInterval(statsInterval);

  console.log('Releasing ports');
  await trex.release();

  return data;
}
