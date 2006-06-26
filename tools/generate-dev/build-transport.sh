#!/usr/bin/env bash
python ./tools/generate-dev/build.py --output-build build-transport/script -i qx.io.remote.Rpc --output-tokenized build-transport -c
mv build-transport/script/qooxdoo.js build-transport/script/transport.js
