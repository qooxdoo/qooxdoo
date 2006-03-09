#!/usr/bin/env bash

cd `dirname $0`/../../..

echo ">>> Patching files..."
mkdir -p build/demo
rsync -rl --exclude=CVS --exclude=.cvsignore source/demo --exclude=demoinclude.js* build

prevfile=""
for file in `find source/demo/ -name "*.html"`;
do
  dfile=`echo $file | sed s:source:build:g`
  name=`basename $file | cut -d"." -f1 | sed s:"_":" ":g`

  mkdir -p `dirname $dfile`
  cat $file | \
  sed s:"../demoinclude.js":"../../script/qooxdoo.js":g | \
  sed s/"qooxdoo demo"/"${name} @ qooxdoo :: demo"/g \
  > $dfile
done
echo ">>> Done"
