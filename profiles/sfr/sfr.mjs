'use strict';

import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class Profile {
  constructor() {
    this.profile_id = profile_id;
    this.profile = profile;
  }
}

export const profile_id = 'sfr';
export const profile = readFileSync(`${__dirname}/json/sfr.json`);
