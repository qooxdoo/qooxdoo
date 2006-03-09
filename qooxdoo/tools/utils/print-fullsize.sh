#!/usr/bin/env bash

cd `dirname $0`/../..

kbytes=`LANG="C" du -c source/script/*/Qx*.js --apparent-size -k | grep total | cut -f1`
bytes=`LANG="C" du -c source/script/*/Qx*.js --apparent-size -b | grep total | cut -f1`

echo ">>> qooxdoo source full size"
echo ">>> ${kbytes}kb ($bytes)"

