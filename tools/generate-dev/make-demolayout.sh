#!/usr/bin/env bash

cd `dirname $0`/../..

echo ">>> Creating layout script..."

cat source/demo/demolayout.js.in > source/demo/demolayout.js

showstr=""
for file in source/demo/showcase/*.html ;
do
  if [ `basename $file` != "index.html" ]; then
    showstr="$showstr `basename $file`";
  fi
done
echo "var showstr = \"$showstr\";" >> source/demo/demolayout.js

exastr=""
for file in source/demo/example/*.html ;
do
  if [ `basename $file` != "index.html" ]; then
    exastr="$exastr `basename $file`";
  fi
done
echo "var exastr = \"$exastr\";" >> source/demo/demolayout.js

perfstr=""
for file in source/demo/performance/*.html ;
do
  if [ `basename $file` != "index.html" ]; then
    perfstr="$perfstr `basename $file`";
  fi
done
echo "var perfstr = \"$perfstr\";" >> source/demo/demolayout.js

teststr=""
for file in source/demo/test/*.html ;
do
  if [ `basename $file` != "index.html" ]; then
    teststr="$teststr `basename $file`";
  fi
done
echo "var teststr = \"$teststr\";" >> source/demo/demolayout.js

echo "showTestFiles();" >> source/demo/demolayout.js

echo "})();" >> source/demo/demolayout.js

