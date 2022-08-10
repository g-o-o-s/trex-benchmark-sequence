# trex-benchmark-sequence

## What the hell?

This is a lil blob to make running repeatable benchmarks and generating consistent graphs easier with Cisco T-Rex.

## How use?

- Clone this repo
- git submodule pull
- `./t-rex-64 -i --astf -c 2` on your t-rex appliance/server
- edit/create hjson configs
- `node main.mjs myprofile`
- ???
- GRAPHS

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
