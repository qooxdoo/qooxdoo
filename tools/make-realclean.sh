#!/bin/bash

cd `dirname $0`/..

echo ">>> Real cleaning up..."

rm  -f source/demo/demoinclude.js source/demo/demolayout.js
rm -rf public build release 
rm -rf tools/generate/internal/cache

echo ">>> Done"
