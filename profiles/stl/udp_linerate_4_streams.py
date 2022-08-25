from trex_stl_lib.api import *
import argparse


class STLS1(object):

    def create_stream (self, src_addr, dst_addr, size, load):
        return STLStream( 
            packet = 
                    STLPktBuilder(
                        pkt = Ether()/IP(src=src_addr,dst=dst_addr)/
                                UDP(dport=12,sport=1025)/(size*'x')
                    ),
             mode = STLTXCont( percentage = load / 4 ))

    def get_streams (self, tunables, **kwargs):
        parser = argparse.ArgumentParser(description='Argparser for {}'.format(os.path.basename(__file__)), 
                                         formatter_class=argparse.ArgumentDefaultsHelpFormatter)
        parser.add_argument('--load',
                            type=int,
                            default=64,
                            help="""define how much to load the link.""")
        parser.add_argument('--size',
                            type=int,
                            default=64,
                            help="""define the packet's size in the stream.""")
        args = parser.parse_args(tunables)
        # create 1 stream 
        return [ 
            self.create_stream("16.0.0.1", "48.0.0.1", args.size, args.load),
            self.create_stream("16.0.0.2", "48.0.0.2", args.size, args.load),
            self.create_stream("16.0.0.3", "48.0.0.3", args.size, args.load),
            self.create_stream("16.0.0.4", "48.0.0.4", args.size, args.load),
        ]

# dynamic load - used for trex console or simulator
def register():
    return STLS1()
