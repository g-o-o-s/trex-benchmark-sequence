'use strict';

// This is a very very basic example
// The only requirement is that your default export is a string of json matching the structure of the undocumented json spec

import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const profile = readFileSync(`${__dirname}/json/sfr.json`).toString();
export default profile;
