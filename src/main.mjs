#!/usr/bin/env node
'use strict';

import { default as Trex } from 'jsrex';

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const session_id = 1234567890;
const force_acquire = true;

yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .command({
    command: 'run <profile> [options]',
    describe: 'run a profile',
    builder: {
      debug: {
        describe: 'debug mode',
        type: 'boolean',
      },
    },
    handler: runProfile,
  })
  .showHelpOnFail(true)
  .demandCommand(1, '')
  .strict()
  .help().argv;

function runProfile(argv) {
  console.log(argv);
  const profile = argv.profile;
  console.log(`About to run profile [${profile}]`);
}
