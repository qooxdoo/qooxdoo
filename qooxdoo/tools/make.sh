#!/bin/bash

cd `dirname $0`/..

tools/generate/make-source.sh
tools/generate/make-build.sh
