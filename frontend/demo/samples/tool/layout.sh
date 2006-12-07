#!/usr/bin/env bash

BASE="tool/layout.js.in"
DIST="$1"
SCAN="$2"
TITLE="$3"

mkdir -p `dirname $DIST`

cat $BASE > $DIST

exastr=""
for file in $SCAN/example/*.html ;
do
  if [ `basename $file` != "index.html" ]; then
    exastr="$exastr `basename $file`";
  fi
done
echo "var exastr = \"$widstr\";" >> $DIST

perfstr=""
for file in $SCAN/performance/*.html ;
do
  if [ `basename $file` != "index.html" ]; then
    perfstr="$perfstr `basename $file`";
  fi
done
echo "var perfstr = \"$perfstr\";" >> $DIST

teststr=""
for file in $SCAN/test/*.html ;
do
  if [ `basename $file` != "index.html" ]; then
    teststr="$teststr `basename $file`";
  fi
done
echo "var teststr = \"$teststr\";" >> $DIST

echo "showTestFiles();" >> $DIST

echo "})();" >> $DIST
