#!/bin/bash

cd `dirname $0`/..

echo ">>> Cleaning up..."

rm  -f source/demo/demoinclude.js source/demo/demolayout.js
rm -rf build/demo build/script build/themes
rm -rf tools/generate/internal/cache

echo ">>> Done"
