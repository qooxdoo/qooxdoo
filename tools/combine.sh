#!/bin/bash

cd `dirname $0`/..
source tools/config.sh

rm -f public/script/qooxdoo.js
mkdir -p public/script
dold=""

for file in $L; do
  d=`dirname $file`
  if [ "$dold" != "$d" ]; then
    echo ">>> Current Source: public/script/$d"
  fi
  
  echo "  - File: `basename $file`.js [js]"
  rest=`grep -v "Copyright" public/script/${file}.js`
  echo -n $rest >> public/script/qooxdoo.js
  
  dold="$d"
done

gzip -9 -c public/script/qooxdoo.js > public/script/qooxdoo.js.gz

echo "-------------------------------------------------------------------"
echo "  - Final Size: `du public/script/qooxdoo.js`"
echo "       gzipped: `du public/script/qooxdoo.js.gz`"
echo "-------------------------------------------------------------------"
echo "  - Done"
echo "-------------------------------------------------------------------"
  
