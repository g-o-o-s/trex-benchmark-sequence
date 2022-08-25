#!/usr/bin/python2

from trex.astf.api import *

import argparse
import os
import sys
import json
import datetime
import time

sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 0)

class JsonOutput:
  def __init__(self, timestamp, stats):
    self.timestamp = timestamp
    self.stats = stats

def astf_test(server, mult, duration, profile_path, sleeptime, latency_pps, tuneables):
    if not profile_path:
        sys.stderr.write("Profile required\n")
        sys.exit(1)

    # create client
    c = ASTFClient(server = server)
  
    # connect to server
    c.connect()

    # take all the ports
    c.reset()

    # load ASTF profile
    if not tuneables:
        c.load_profile(profile_path)
    else:
        c.load_profile(profile_path, dict(map(lambda s: s.split("="), tuneables.split(","))))

    # clear the stats before injecting
    c.clear_stats()

    c.start(mult = mult, duration = duration, nc = False, block = True, latency_pps = latency_pps)
  
  
    """
    def start(self, mult = 1, duration = -1, nc = False, block = True, latency_pps = 0, ipv6 = False, pid_input = DEFAULT_PROFILE_ID, client_mask = 0xffffffff, e_duration = 0, t_duration = 0, dump_interval = 0):
        Start the traffic on loaded profile. Procedure is async.
        :parameters:
            mult: int
                Multiply total CPS of profile by this value.
            duration: float
                Start new flows for this duration.
                Negative value means infinite
            nc: bool
                Do not wait for flows to close at end of duration.
            block: bool
                Wait for traffic to be started (operation is async).
            latency_pps: uint32_t
                Rate of latency packets. Zero value means disable.
            ipv6: bool
                Convert traffic to IPv6.
            client_mask: uint32_t
                Bitmask of enabled client ports.
            pid_input: string
                Input profile ID
            e_duration: float
                Maximum time to wait for one flow to be established.
                Stop the flow generation when this time is over. Stop immediately with nc.
                Disabled by default. Enabled by positive values.
            t_duration: float
                Maximum time to wait for all the flow to terminate gracefully after duration.
                Stop immediately (overrides nc pararmeter) when this time is over.
                Disabled by default. Enabled by non-zero values.
            dump_interval: float
                Interval time for periodic dump of TCP flow information: RTT, CWND, etc.
                TCP flow dump enabled by non-zero values.
        :raises:
            + :exc:`TRexError`
    """
  
    while c.is_traffic_active():
        stats = c.get_stats()
        timestamp = time.mktime(datetime.datetime.now().timetuple()) * 1000
        print(json.dumps(JsonOutput(timestamp, stats), default=vars))
        time.sleep(sleeptime)
  
    if c.get_warnings():
        c.disconnect()
        sys.stderr.write('\n\n*** test had warnings ****\n\n')
        for w in c.get_warnings():
            sys.stderr.write(w)
        sys.exit(1)
  
    c.disconnect()
    sys.exit(0)


def parse_args():
    parser = argparse.ArgumentParser(description = 'TRex ASTF Runner')
    parser.add_argument('-r',
                        dest = 'server',
                        help='remote TRex address',
                        default='127.0.0.1',
                        type = str)
    parser.add_argument('-m',
                        dest = 'mult',
                        help='multiplier of traffic, see ASTF help for more info',
                        default = 1,
                        type = int)
    parser.add_argument('-f',
                        dest = 'file',
                        help='profile path to send. Required',
                        type = str)
    parser.add_argument('-d',
                        default = 10,
                        dest = 'duration',
                        help='duration of traffic, default is 10 sec',
                        type = float)
    parser.add_argument('-s',
                        default = 0.5,
                        dest = 'sleeptime',
                        help='sleep between samples, default is 0.5 sec',
                        type = float)
    parser.add_argument('-l',
                        default = 0,
                        dest = 'latency_pps',
                        help='interval latency packets',
                        type = int)
    parser.add_argument('-t',
                        default = '',
                        dest = 'tuneables',
                        help='tuneables',
                        type = str)

    return parser.parse_args()

# https://stackoverflow.com/questions/1094841/get-human-readable-version-of-file-size
# modified
def sizeof_fmt(num, use_kibibyte=True):
    base, suffix = [(1000.,''),(1024.,'ib')][use_kibibyte]
    for x in [''] + map(lambda x: x+suffix, list('kMGTP')):
        if -base < num < base:
            return "%3.1f %s" % (num, x)
        num /= base
    return "%3.1f %s" % (num, x)

args = parse_args()
astf_test(args.server, args.mult, args.duration, args.file, args.sleeptime, args.latency_pps, args.tuneables)
