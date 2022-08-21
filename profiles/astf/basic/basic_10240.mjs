'use strict';

// This is a very very basic example
// The only requirement is that your default export is an object matching the structure of the undocumented json spec

import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = readFileSync(`${__dirname}/buffers/01.buf`);

const profile = {
  buf_list: [data, data],
  ip_gen_dist_list: [
    {
      ip_start: '16.0.0.0',
      ip_end: '16.0.0.255',
      distribution: 'seq',
      dir: 'c',
      ip_offset: '1.0.0.0',
    },
    {
      ip_start: '48.0.0.0',
      ip_end: '48.0.255.255',
      distribution: 'seq',
      dir: 's',
      ip_offset: '1.0.0.0',
    },
  ],
  program_list: [
    {
      commands: [
        {
          name: 'tx',
          buf_index: 0,
        },
        {
          name: 'rx',
          min_bytes: 10240,
        },
      ],
    },
    {
      commands: [
        {
          name: 'rx',
          min_bytes: 10240,
        },
        {
          id: 0,
          name: 'set_var',
          val: 4294967290, // We handle when traffic ends ourselves
        },
        {
          name: 'tx',
          buf_index: 1,
        },
        {
          id: 0,
          offset: -1,
          name: 'jmp_nz',
        },
        {
          name: 'tx_mode',
          flags: 0,
        },
        {
          name: 'tx',
          buf_index: 1,
        },
      ],
    },
  ],
  c_glob_info: {
    tcp: {
      mss: 1460,
      initwnd: 2,
      no_delay: 0,
      no_delay_counter: 2920,
      rxbufsize: 32768,
      txbufsize: 32768,
    },
  },
  s_glob_info: {
    tcp: {
      mss: 1460,
      initwnd: 2,
      no_delay: 0,
      no_delay_counter: 2920,
      rxbufsize: 32768,
      txbufsize: 32768,
    },
  },
  templates: [
    {
      client_template: {
        program_index: 0,
        ip_gen: {
          dist_client: {
            index: 0,
          },
          dist_server: {
            index: 1,
          },
        },
        cluster: {},
        port: 80,
        cps: 200000,
        limit: 1400000,
      },
      server_template: {
        program_index: 1,
        assoc: [
          {
            port: 80,
          },
        ],
      },
    },
    {
      client_template: {
        program_index: 0,
        ip_gen: {
          dist_client: {
            index: 0,
          },
          dist_server: {
            index: 1,
          },
        },
        cluster: {},
        port: 81,
        cps: 200000,
        limit: 1400000,
      },
      server_template: {
        program_index: 1,
        assoc: [
          {
            port: 81,
          },
        ],
      },
    },
    {
      client_template: {
        program_index: 0,
        ip_gen: {
          dist_client: {
            index: 0,
          },
          dist_server: {
            index: 1,
          },
        },
        cluster: {},
        port: 82,
        cps: 200000,
        limit: 1400000,
      },
      server_template: {
        program_index: 1,
        assoc: [
          {
            port: 82,
          },
        ],
      },
    },
    {
      client_template: {
        program_index: 0,
        ip_gen: {
          dist_client: {
            index: 0,
          },
          dist_server: {
            index: 1,
          },
        },
        cluster: {},
        port: 83,
        cps: 200000,
        limit: 1400000,
      },
      server_template: {
        program_index: 1,
        assoc: [
          {
            port: 83,
          },
        ],
      },
    },
    {
      client_template: {
        program_index: 0,
        ip_gen: {
          dist_client: {
            index: 0,
          },
          dist_server: {
            index: 1,
          },
        },
        cluster: {},
        port: 84,
        cps: 200000,
        limit: 1400000,
      },
      server_template: {
        program_index: 1,
        assoc: [
          {
            port: 84,
          },
        ],
      },
    },
  ],
  tg_names: [],
};

export default profile;
