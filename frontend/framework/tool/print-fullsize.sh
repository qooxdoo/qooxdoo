#!/usr/bin/env bash

cd `dirname $0`/../..

bytes=0

for size in `find source/class/ -name "*.js" | xargs du -b | awk '{ print $1 }'`; 
do 
  bytes=$[$bytes+$size]; 
done;

kbytes=$[$bytes/1024]

echo ">>> qooxdoo source full size"
echo ">>> ${kbytes}KB"

