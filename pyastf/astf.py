#!/bin/python

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

def astf_test(server, mult, duration, profile_path, outputPath):

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

  statsArray = []

  while c.is_traffic_active():
      stats = c.get_stats()

      timestamp = time.mktime(datetime.datetime.now().timetuple()) * 1000

      statsArray.append(JsonOutput(timestamp, stats))

      readableTime = datetime.datetime.fromtimestamp(timestamp / 1000)
      readableTime = readableTime.strftime('%H:%M:%S')
      tx_bps = sizeof_fmt(stats['global']['tx_bps'])
      tx_pps = sizeof_fmt(stats['global']['tx_pps'], False)

      toPrint = "[%s] (total) tx_bps: %s; (total) tx_pps: %s\n" % (readableTime, tx_bps, tx_pps)

      sys.stderr.write(toPrint)

      time.sleep(0.5)

  outputFile = open(outputPath, "w")
  outputFile.write(json.dumps(statsArray, default=vars))

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
    parser.add_argument('-s',
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
    parser.add_argument('-o',
                        dest = 'outputPath',
                        help='JSON output file. Required',
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
astf_test(args.server, args.mult, args.duration, args.file, args.outputPath)
