#!/bin/bash

cd `dirname $0`/..
cd tools

cat includebase.js.in > script/includer.js
grep -v \"\" config.sh | sed s:"L=\"\$L ":"inc(\"":g | sed s:"\"$":"\");":g | sed s:"\# ":"// ":g >> script/includer.js


sync
