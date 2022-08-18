'use strict';

import { default as child_process } from 'child_process';

export async function loadPythonProfile(testProfile, dirname) {
  // Path to pyastf-json-convertor
  const pyastf_convertor_execpath = `${dirname}/pyastf-json-convertor/convertor.py`;
  // Spawn convertor.py
  const argsArray = [`${dirname}/${testProfile.file}`];
  const convertorChild = child_process.spawnSync(pyastf_convertor_execpath, argsArray, {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  // Process stdout
  const stdout = convertorChild.stdout.toString();
  return JSON.parse(stdout);
}
