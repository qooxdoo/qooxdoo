#!/bin/bash

cd `dirname $0`/..

mkdir -p public/script
mkdir -p .cache/script

python tools/compile.py --sourcepath source/script --publicpath public/script --cachepath ".cache/script" --docpath public/docs/script --prefix docs --job doc

mkdir -p public/script
mkdir -p .cache/script

python tools/compile.py --sourcepath source/style --publicpath public/style --cachepath ".cache/style" --docpath public/docs/style --prefix docs --job doc

tools/combine.sh
tools/patchtest.sh

find public -type d | xargs chmod a+rx
find public ! -type d | xargs chmod a+r

sync
