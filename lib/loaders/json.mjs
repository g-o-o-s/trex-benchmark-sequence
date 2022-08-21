'use strict';

import { readFileSync } from 'fs';

export async function loadJsonProfile(testProfile, dirname) {
  try {
    const profile = readFileSync(`${dirname}/${testProfile.file}`);
    const parsed = JSON.parse(profile);
    return parsed;
  } catch (error) {
    return error;
  }
}
