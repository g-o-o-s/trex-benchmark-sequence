'use strict';

import { loadJsonProfile } from './json.mjs';
import { loadJsProfile } from './js.mjs';
import { loadPythonProfile } from './python.mjs';

// Blocks until the sequence is finished
export async function loadProfile(testProfile, dirname, debug) {
  console.log(`About to run profile [${testProfile.name}]`);

  if (testProfile.file) {
    const extensionRegex = /.*(\.py|\.mjs|\.json)$/;
    const fileExtension = testProfile.file.match(extensionRegex)[1];
    if (debug) console.log(`File extension: ${fileExtension}`);

    switch (fileExtension) {
      case '.mjs':
        testProfile.json = await loadJsProfile(testProfile, dirname);
        break;
      case '.json':
        testProfile.json = await loadJsonProfile(testProfile, dirname);
        break;
      case '.py':
        testProfile.json = await loadPythonProfile(testProfile, dirname);
        break;
      default:
        throw new Error(`Unknown profile type: ${fileExtension}`);
    }
    if (typeof testProfile.json === Error) throw testProfile.json;
  } else if (testProfile.json) {
    // Profile already has json, no need to read in external
  } else {
    throw new Error(`No profile associated with sequence step ${testProfile.name}`);
  }

  if (typeof testProfile.json != 'object') throw new Error('Profile is not an object');
  if (testProfile.json === null || testProfile.json === '') throw new Error('Unknown error loading profile');

  return testProfile.json;
}
