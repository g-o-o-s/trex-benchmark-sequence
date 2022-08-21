'use strict';

import { loadProfile } from '../loaders/loader.mjs';
import { runAstfProfile } from './runAstfProfile.mjs';
import { runStlProfile } from './runStlProfile.mjs';
import { drawGraphs } from '../graphs/generateGraphs.mjs';

// Internals
import { readFileSync } from 'fs';
import { default as Hjson } from 'hjson';

// Gonna need these later
import { URL } from 'url';
const dirname = new URL('../..', import.meta.url).pathname; // Will contain trailing slash

// Uint32 ?
const session_id = 1234567890;

// Read in and run a test sequence file
export async function runSequenceFile(argv) {
  const initTime = new Date();
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
    // eslint-disable-next-line security/detect-object-injection
    const step = sequence.testProfiles[i];

    // Is the profile enabled?
    if (!step.enabled) {
      console.log(`Step [${step.name}] is disabled, skipping`);
      continue; // Skip the disabled profile
    }

    const stepInitTime = new Date();

    // Most of this is to allow individual profiles to override sequence globals
    step.argv = argv;
    step.type = step.type || 'astf'; // Default to astf profiles
    step.initTime = initTime;
    step.stepInitTime = stepInitTime;
    step.sequence = JSON.stringify(sequence, null, 2);
    step.sequenceName = sequenceFile.split('/')[sequenceFile.split('/').length - 1];
    step.warmup = step.warmup || sequence.warmup;
    step.cooldown = step.cooldown || sequence.cooldown;
    step.server = step.server || sequence.server;
    step.dutName = step.dutName || sequence.dutName;
    step.runName = step.runName || sequence.runName;
    step.description = step.description || sequence.description;
    step.sampleInterval = step.sampleInterval || sequence.sampleInterval;
    step.duration = step.duration || sequence.duration;
    step.latencyRate = step.latencyRate || sequence.latencyRate;
    step.session_id = session_id || 1234567890;
    step.force_acquire = argv.force || false;

    // Load the profile json if it isn't specified in the sequence file
    if (!step.json) {
      console.log('Loading profile from disk');
      // eslint-disable-next-line security/detect-object-injection
      step.json = await loadProfile(sequence.testProfiles[i], dirname, debug);
    }

    // Now that we have the profile JSON loaded/confirmed, run the profile
    var data = null;
    switch (step.type) {
      case 'astf':
        data = await runAstfProfile(step, debug);
        break;
      case 'stl':
        data = await runStlProfile(step, debug);
        break;
      default:
        console.log(`Unknown profile type "${step.type}" for step ${step.name}, skipping step`);
        continue;
    }

    step.data = data;

    if (argv.graph) {
      console.log('Generating graphs');
      // Generate graphs
      await drawGraphs(step);
    }
  }
}
