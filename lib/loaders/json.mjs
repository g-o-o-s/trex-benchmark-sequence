'use strict';

import { readFileSync } from 'fs';

export async function loadJsonProfile(testProfile, dirname) {
  try {
    const profile = readFileSync(`${dirname}/${testProfile.file}`).toString();
    return JSON.parse(profile);
  } catch (error) {
    return error;
  }
}
