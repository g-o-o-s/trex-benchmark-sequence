#!/usr/bin/env node
'use strict';

import { default as Trex } from 'jsrex';

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const session_id = 1234567890;
const force_acquire = true;

const initTime = new Date();
console.log(`--- Logs begin at ${initTime.toUTCString()} ---`);

yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .command({
    command: 'run <sequence> [options]',
    describe: 'run a sequence',
    builder: {
      debug: {
        describe: 'debug mode',
        type: 'boolean',
      },
    },
    handler: runSequence,
  })
  .showHelpOnFail(true)
  .demandCommand(1, '')
  .strict()
  .help().argv;

function runSequence(argv) {
  console.log(argv);
  const sequence = argv.sequence;
  console.log(`About to run sequence [${sequence}]`);
  // Read in sequence

  // for loop

  // 
}
