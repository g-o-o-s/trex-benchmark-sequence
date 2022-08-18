'use strict';

import { loadProfile } from '../loaders/loader.mjs';
import { runProfile } from './runProfile.mjs';
import { drawGraphs } from '../graphs/generateGraphs.mjs';

// Internals
import { readFileSync } from 'fs';
import { default as Hjson } from 'hjson';

// Excellent logging library
import { default as clog } from 'ee-log';

// Gonna need these later
import { URL } from 'url';
const dirname = new URL('../..', import.meta.url).pathname; // Will contain trailing slash

// Uint32 ?
const session_id = 1234567890;

// Read in and run a test sequence file
export async function runSequenceFile(argv) {
  const initTime = new Date();
  console.log(dirname);
  const debug = argv.debug || false;

  // Determine our sequence file
  const sequenceFile = argv.sequence;
  console.log(`About to run sequence [${sequenceFile}]`);
  // Read in sequence file
  const sequence = Hjson.parse(readFileSync(sequenceFile).toString());

  // Allow override of the run name
  sequence.runName = argv.run || sequence.runName;

  // For loop to run them in line
  for (let i = 0; i < sequence.testProfiles.length; i++) {
    const stepInitTime = new Date();

    // eslint-disable-next-line security/detect-object-injection
    const step = sequence.testProfiles[i];

    step.argv = argv;
    step.initTime = initTime;
    step.stepInitTime = stepInitTime;
    step.server = step.server || sequence.server;
    step.dutName = step.dutName || sequence.dutName;
    step.runName = step.runName || sequence.runName;
    step.description = step.description || sequence.description;
    step.sampleInterval = step.sampleInterval || sequence.sampleInterval;
    step.duration = step.duration || sequence.duration;
    step.latencyRate = step.latencyRate || sequence.latencyRate;
    step.session_id = session_id || 1234567890;
    step.force_acquire = argv.force || false;

    // Load the actual profile json
    if (!step.json) {
      console.log('Loading profile from disk');
      // eslint-disable-next-line security/detect-object-injection
      step.json = await loadProfile(sequence.testProfiles[i], dirname, debug);
    }

    // eslint-disable-next-line security/detect-object-injection
    if (debug) clog.debug(step);

    // Now that we have the profile JSON loaded/confirmed, run the profile
    const data = await runProfile(step, debug);

    step.data = data;

    if (argv.graph) {
      console.log('Generating graphs');
      // Generate graphs
      await drawGraphs(step);
    }
  }
}
