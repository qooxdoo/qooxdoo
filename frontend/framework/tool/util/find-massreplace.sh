#!/usr/bin/env bash

cd `dirname $0`/../..

h=`dd if=/dev/random count=1 2> /dev/null | md5sum | cut -d" " -f1`

echo "Current Hash: $h"

for file in `find source -name "*.js" -o -name "*.css"  -o -name "*.html"` tools/generate/internal/config.sh; do
  cp -f $file ${file}.${h}
  echo ">>> Patching: $file"
  cat ${file}.${h} | sed s:"$1":"$2":g > $file
  if [ "$?" != "0" ]; then
    echo "    - failed, recovering..."
    mv ${file}.${h} $file
  else
    rm -f ${file}.${h}
  fi
done

