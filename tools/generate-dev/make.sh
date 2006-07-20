#!/usr/bin/env bash

cd `dirname $0`/../..

tools/generate/make-source.sh
tools/generate/internal/syncfiles.sh
tools/generate/internal/patchdemos.sh
tools/generate-dev/build.py -c -s source/script -s source/themes --compile-output-directory build/script
