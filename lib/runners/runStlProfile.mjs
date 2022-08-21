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

export async function runStlProfile(testProfile) {
  // No-op for now
  return [];
}
