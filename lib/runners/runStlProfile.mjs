'use strict';

// The main event
import { default as Trex } from 'jsrex';

import { sleep } from '../misc/sleep.mjs';

import { default as clog } from 'ee-log';

// Setup our connection to Trex
const trex = new Trex({
  server: 'tcp://trex.straylight.goosga.ng:4501', // Default 127.0.0.1:4501
  debug: false, // Default false
  user: 'goos', // Default uuid.v4()
  api_name: 'STL',
  api_major: 5,
  api_minor: 1,
});

export async function runStlProfile(testProfile) {
  var statsInterval = null;

  let response = null;

  const data = [];

  console.log('Connecting to T-Rex');
  await trex.connect();
  await sleep(1000);

  // Acquire ports
  console.log('Attempting to acquire ports');
  response = await trex.acquire({ session_id: testProfile.session_id, force: testProfile.force_acquire });
  if (response.error) {
    console.error(JSON.stringify(response.error, null, 2));
    return;
  }
  console.log(`Ports acquired, Session Handler: ${response.result}`);
  await sleep(1000);

  //
  // Upload the profile
  console.log('Uploading streams');
  // Clear existing profile
  await trex.profile_clear({
    profile_id: testProfile.name,
  });
  await sleep(1000);

  // For a STL profile, testProfile.json should be an array of stream objects
  for (let i = 0; i < testProfile.json.length; i++) {
    // eslint-disable-next-line security/detect-object-injection
    const stream = testProfile.json[i];
    stream.next_stream_id = -1;
    response = await trex.add_stream({
      profile_id: testProfile.name,
      stream: stream,
    });
  }

  //
  // List profiles
  response = await trex.get_profile_list();
  console.log(`Available profiles: ${JSON.stringify(response.result)}`);

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
  await trex.start_traffic({
    duration: -1,
    profile_id: testProfile.name,
    multiplier: testProfile.mult,
  });

  // Let it run for the duration
  await sleep(testProfile.duration * 1000);

  console.log('Stopping traffic');
  await trex.stop_traffic({
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
