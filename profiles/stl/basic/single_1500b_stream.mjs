'use strict';

const stream = [
  {
    flags: 0,
    action_count: 0,
    enabled: true,
    self_start: true,
    start_paused: false,
    isg: 0,
    core_id: -1,
    mode: {
      rate: {
        type: 'pps',
        value: 28,
      },
      type: 'continuous',
    },
    packet: {
      binary: 'AAAAAQAAAAAAAgAACABFAAAuAAEAAEAROr0QAAABMAAAAQA1ADUAGoMSeHh4eHh4eHh4eHh4eHh4eHh4',
      meta: '',
    },
    vm: {
      instructions: [
        {
          type: 'flow_var',
          name: 'src',
          size: 4,
          op: 'inc',
          next_var: null,
          split_to_cores: true,
          init_value: 268435457,
          min_value: 268435457,
          max_value: 268435710,
          step: 1,
        },
        {
          type: 'flow_var',
          name: 'dst',
          size: 4,
          op: 'inc',
          next_var: null,
          split_to_cores: true,
          init_value: 805306369,
          min_value: 805306369,
          max_value: 805306622,
          step: 1,
        },
        {
          type: 'write_flow_var',
          name: 'src',
          pkt_offset: 26,
          add_value: 0,
          is_big_endian: true,
        },
        {
          type: 'write_flow_var',
          name: 'dst',
          pkt_offset: 30,
          add_value: 0,
          is_big_endian: true,
        },
        {
          type: 'fix_checksum_ipv4',
          pkt_offset: 14,
        },
      ],
    },
    flow_stats: {
      enabled: false,
    },
  },
  {
    flags: 0,
    action_count: 0,
    enabled: true,
    self_start: true,
    start_paused: false,
    isg: 0.1,
    core_id: -1,
    mode: {
      rate: {
        type: 'pps',
        value: 16,
      },
      type: 'continuous',
    },
    packet: {
      binary:
        'AAAAAQAAAAAAAgAACABFAAJAAAEAAEAROKsQAAABMAAAAQA1ADUCLMo5eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHg=',
      meta: '',
    },
    vm: {
      instructions: [
        {
          type: 'flow_var',
          name: 'src',
          size: 4,
          op: 'inc',
          next_var: null,
          split_to_cores: true,
          init_value: 268435457,
          min_value: 268435457,
          max_value: 268435710,
          step: 1,
        },
        {
          type: 'flow_var',
          name: 'dst',
          size: 4,
          op: 'inc',
          next_var: null,
          split_to_cores: true,
          init_value: 805306369,
          min_value: 805306369,
          max_value: 805306622,
          step: 1,
        },
        {
          type: 'write_flow_var',
          name: 'src',
          pkt_offset: 26,
          add_value: 0,
          is_big_endian: true,
        },
        {
          type: 'write_flow_var',
          name: 'dst',
          pkt_offset: 30,
          add_value: 0,
          is_big_endian: true,
        },
        {
          type: 'fix_checksum_ipv4',
          pkt_offset: 14,
        },
      ],
    },
    flow_stats: {
      enabled: false,
    },
  },
  {
    flags: 0,
    action_count: 0,
    enabled: true,
    self_start: true,
    start_paused: false,
    isg: 0.2,
    core_id: -1,
    mode: {
      rate: {
        type: 'pps',
        value: 4,
      },
      type: 'continuous',
    },
    packet: {
      binary:
        'AAAAAQAAAAAAAgAACABFAAXcAAEAAEARNQ8QAAABMAAAAQA1ADUFyFmYeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHg=',
      meta: '',
    },
    vm: {
      instructions: [
        {
          type: 'flow_var',
          name: 'src',
          size: 4,
          op: 'inc',
          next_var: null,
          split_to_cores: true,
          init_value: 268435457,
          min_value: 268435457,
          max_value: 268435710,
          step: 1,
        },
        {
          type: 'flow_var',
          name: 'dst',
          size: 4,
          op: 'inc',
          next_var: null,
          split_to_cores: true,
          init_value: 805306369,
          min_value: 805306369,
          max_value: 805306622,
          step: 1,
        },
        {
          type: 'write_flow_var',
          name: 'src',
          pkt_offset: 26,
          add_value: 0,
          is_big_endian: true,
        },
        {
          type: 'write_flow_var',
          name: 'dst',
          pkt_offset: 30,
          add_value: 0,
          is_big_endian: true,
        },
        {
          type: 'fix_checksum_ipv4',
          pkt_offset: 14,
        },
      ],
    },
    flow_stats: {
      enabled: false,
    },
  },
];

export default stream;
