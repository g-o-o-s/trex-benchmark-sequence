# trex-benchmark-sequence

## What the hell?

This is a lil blob to make running repeatable benchmarks and generating consistent graphs easier with Cisco T-Rex.

## How use?

- git clone --recursive https://github.com/g-o-o-s/trex-benchmark-sequence
- go get some coffee. trex-core is big
- npm install (written with node 16.x)
- `./t-rex-64 -i --astf -c 2` on your t-rex appliance/server
- edit/create hjson configs
- `node main.mjs loopback/emix2_short`
- ???
- GRAPHS

## But how do I setup a t-rex server?
You'll need a system (vm probably works too, but lower perf of course) with at least 3 nics \
Put the 1st nic on your lab/mgmt/whatever network \
Physically loopback the other 2

copy-pasteables (as root):
```
mkdir -p /opt/trex
cd /opt/trex
wget --no-cache https://trex-tgn.cisco.com/trex/release/v2.99.tar.gz
tar -xzvf v2.99.tar.gz
cd v.299

  -> list interfaces
./dpdk_setup_ports.py -s

./dpdk_setup_ports.py -i
  -> select MAC/Layer2 mode, select your two loopbacked nics

./t-rex-64 -i --astf
```
[see here for more info on install](https://trex-tgn.cisco.com/trex/doc/trex_manual.html#_download_and_installation)

## Help?

Maybe. Do a google first, open an issue second.

## Why?

I was only able to find one mention on the entire internet about generating graphs from t-rex. \
iirc it was an old Cisco Live thing where they were like "yeah lol we linked the mq to elk and used grafana"

So. I want graphs. So here we are.

## Why nodejs?

Because I suck at python and wanted to use a lang I'm comfy with. \
This is basically lab equipment, not production code. \
Feel free to rewrite this in python if you want.
