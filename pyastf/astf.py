#!/usr/bin/python2

from trex.astf.api import *

import argparse
import os
import sys
import json
import datetime
import time

class JsonOutput:
  def __init__(self, timestamp, stats):
    self.timestamp = timestamp
    self.stats = stats

def astf_test(server, mult, duration, profile_path, sleeptime):

  # load ASTF profile
  if not profile_path:
      sys.stderr.write("Profile required\n")
      sys.exit(1)

  # create client
  c = ASTFClient(server = server)

  # connect to server
  c.connect()
  # take all the ports
  c.reset()

  c.load_profile(profile_path)
  # clear the stats before injecting
  c.clear_stats()

  c.start(mult = mult, duration = duration)

  while c.is_traffic_active():
      stats = c.get_stats()

      timestamp = time.mktime(datetime.datetime.now().timetuple()) * 1000
      readableTime = datetime.datetime.fromtimestamp(timestamp / 1000)
      readableTime = readableTime.strftime('%H:%M:%S')

      tx_bps = sizeof_fmt(stats['global']['tx_bps'])
      rx_bps = sizeof_fmt(stats['global']['rx_bps'])
      tx_pps = round(stats['global']['tx_pps'] / 1000, 2)
      rx_pps = round(stats['global']['rx_pps'] / 1000, 2)
      rx_drop_bps = sizeof_fmt(stats['global']['rx_drop_bps'])

      humanReadable = "[%s] bps: [%s / %s] pps: [%dK / %dK] drop: [ %s ]\n" % (readableTime, tx_bps, rx_bps, tx_pps, rx_pps, rx_drop_bps)

      sys.stderr.write(humanReadable)
      print(json.dumps(JsonOutput(timestamp, stats), default=vars))
      time.sleep(sleeptime)

  if c.get_warnings():
      sys.stderr.write('\n\n*** test had warnings ****\n\n')
      for w in c.get_warnings():
          sys.stderr.write(w)
          c.disconnect()
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
                        default = 100,
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
astf_test(args.server, args.mult, args.duration, args.file, args.sleeptime)
