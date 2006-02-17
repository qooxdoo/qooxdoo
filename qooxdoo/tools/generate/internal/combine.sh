#!/bin/bash

cd `dirname $0`/../../..
source tools/generate/internal/config.sh

mkdir -p build/script
cp -f tools/generate/internal/header.txt build/script/qooxdoo.js
dold=""
stamp=`date +"%Z-%Y%m%d-%I%M%p"`

for file in $L; do
  d=`dirname $file`
  if [ "$dold" != "$d" ]; then
    echo ">>> Current Source: build/$d"
  fi
  
  echo "  - File: `basename $file`.js [js]"
  rest=`grep -v "Copyright" build/${file}.js`
  echo -n $rest >> build/script/qooxdoo.js
  
  dold="$d"
done

gzip -9 -c build/script/qooxdoo.js > build/script/qooxdoo.js.gz

echo "-------------------------------------------------------------------"
echo "  - Final Size: `du build/script/qooxdoo.js`"
echo "       gzipped: `du build/script/qooxdoo.js.gz`"
echo "-------------------------------------------------------------------"
echo "  - Done"
echo "-------------------------------------------------------------------"
  
