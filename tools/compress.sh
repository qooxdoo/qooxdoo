#!/bin/bash

cd `dirname $0`/..

mkdir -p public/script
mkdir -p .cache/script

python tools/compile.py --sourcepath source/script --publicpath public/script --cachepath ".cache/script" --docpath public/script --prefix docs --job compress

mkdir -p public/style
mkdir -p .cache/style

python tools/compile.py --sourcepath source/style --publicpath public/style --cachepath ".cache/style" --docpath public/style --prefix docs --job compress
