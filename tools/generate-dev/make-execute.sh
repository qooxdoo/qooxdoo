#!/usr/bin/env bash

cd `dirname $0`/../..

tools/generate-dev/build.py --source-directories source/script,source/themes --output-tokenized build/tokens --output-build build/script $*
