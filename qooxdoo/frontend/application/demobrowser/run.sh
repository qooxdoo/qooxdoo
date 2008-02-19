#!/bin/bash

cd `dirname $0`

# Cleanup translation data from old generator
rm -rf source/class/demo

# Run new generator
../../tool/generator.py -c config.json -j $1 -v
