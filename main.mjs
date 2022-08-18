#!/usr/bin/env node
'use strict';

// Make life easy
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { runSequenceFile } from './lib/runners/runSequence.mjs';

yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .command({
    command: 'run <sequence> [options]',
    describe: 'run a sequence file',
    builder: {
      // Debug mode
      debug: {
        describe: 'debug mode - very loud',
        type: 'boolean',
        alias: 'd',
      },
      // Ouput graph files
      graph: {
        describe: 'enable graph files',
        type: 'boolean',
        alias: 'g',
      },
      // Force acquire ports
      force: {
        describe: 'force acquire t-rex ports',
        type: 'boolean',
        alias: 'f',
      },
      // Override run name
      run: {
        describe: 'override run name',
        type: 'string',
        alias: 'r',
      },
    },
    handler: runSequenceFile,
  })
  .example([
    // eslint-disable-next-line prettier/prettier
    [
      '$0 run ./emix2.hjson --print 5\n\n', 
      'Run the emix2 sequence with human   readable output every 5 seconds.'
    ],
    // [
    //   '$0 run ./emix2.hjson --print 5    --live global_combined_bps\n',
    //   'Run the emix2 sequence with a live  bps graph updated every 5 seconds.',
    // ],
    [
      '$0 run ./emix2.hjson --graph      ./myrun/png --json ./myrun/json\n',
      'Run the emix2 sequence with minimal console output, saving graphs and   json data.',
    ],
  ])
  .showHelpOnFail(true)
  .demandCommand(1, '')
  .strict()
  .help().argv;
