#!/usr/bin/env bash

cd `dirname $0`/../..

tools/generate/make-source.sh
tools/generate/internal/syncfiles.sh
tools/generate/internal/patchdemos.sh
tools/generate-dev/build.py -c --source-directories source/script,source/themes --output-tokenized build/tokens --output-build build/script
