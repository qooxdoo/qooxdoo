#!/bin/bash

cd `dirname $0`/..

tools/compress.sh
tools/combine.sh
tools/patchtest.sh

find public -type d | xargs chmod a+rx
find public ! -type d | xargs chmod a+r
find tools -name "*.js" | xargs chmod a+r

sync
