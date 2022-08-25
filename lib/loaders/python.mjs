'use strict';

import { default as pty } from 'node-pty';
import { default as child_process } from 'child_process';
import { default as readline } from 'readline';

import { default as clog } from 'ee-log';

export async function loadPythonProfile(testProfile, dirname) {
  var json = null;
  switch (testProfile.type) {
    case 'astf':
      json = await load_astf_profile(testProfile, dirname);
      return json;
    case 'stl':
      json = await load_stl_profile(testProfile, dirname);
      return json;
    default:
      throw new Error('Unknown test profile type: ' + testProfile.type);
  }
}

function load_astf_profile(testProfile, dirname) {
  return new Promise((resolve, reject) => {
    const astf_sim_path = `${dirname}/v2.99/astf-sim`;
    const argsArray = [
      '-f',
      `${dirname}/${testProfile.file}`,
      '--json',
      testProfile.tuneables ? `-t ${testProfile.tuneables}` : '',
    ];
    const convertorChild = pty.spawn(astf_sim_path, argsArray, {
      handleFlowControl: true,
      cwd: `${dirname}/v2.99`,
    });

    const stdout = [];
    convertorChild.on('data', (raw) => {
      const string = raw.toString();
      const stringArray = string.split('\n');
      for (let i = 0; i < stringArray.length; i++) {
        // eslint-disable-next-line security/detect-object-injection
        stdout.push(stringArray[i]);
      }
    });

    convertorChild.on('exit', () => {
      try {
        const profile = JSON.parse(stdout.join(''));
        return resolve(profile);
      } catch (err) {
        throw new Error('Failed to parse simulator json output');
      }
    });
  });
}

function load_stl_profile(testProfile, dirname) {
  return new Promise((resolve, reject) => {
    const stl_sim_path = `${dirname}/v2.99/stl-sim`;
    const argsArray = [
      '-f',
      `${dirname}/${testProfile.file}`,
      '--json',
      testProfile.tuneables ? `-t ${testProfile.tuneables}` : '',
    ];
    const convertorChild = pty.spawn(stl_sim_path, argsArray, {
      handleFlowControl: true,
      cwd: `${dirname}/v2.99`,
    });

    const stdout = [];
    convertorChild.onData((raw) => {
      const string = raw.toString();
      const stringArray = string.split('\n');
      for (let i = 0; i < stringArray.length; i++) {
        // eslint-disable-next-line security/detect-object-injection
        stdout.push(stringArray[i]);
      }
    });

    convertorChild.onExit(() => {
      try {
        const profile = JSON.parse(stdout.join(''));
        return resolve(profile);
      } catch (err) {
        throw new Error('Failed to parse simulator json output');
      }
    });
  });
}
