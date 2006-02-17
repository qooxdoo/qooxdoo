#!/bin/bash

cd `dirname $0`/../..

p=`pwd`
cd source/script
err=0

echo ">>> Testing source files..."

for file in `find . -name "*.js"`;
do
  grep "#package(.*)" $file > /dev/null 2>&1
  if [ $? != 0 ]; then
    echo "  - Missing package: $file"
    err=$[$err+1]
  fi

  grep "All rights reserved" $file > /dev/null 2>&1 && grep "Schlund + Partner AG" $file > /dev/null 2>&1 && grep "LGPL 2.1" $file > /dev/null 2>&1
  if [ $? != 0 ]; then
    echo "  - Missing header : $file"
    err=$[$err+1]
  fi

  if [ `basename $file` != "QxObject.js" ];
  then
    grep "proto\.dispose" $file > /dev/null
    if [ $? == 0 ]; then
      grep "dispose\.call" $file > /dev/null
      if [ $? != 0 ]; then
        echo "  - Errornous Disposer: $file"
        err=$[$err+1]
      fi
    fi
  fi
done

cd $p

if [ $err -gt 0 ]; then
  echo ">>> Please correct the above erros!"
  exit 1
else
  echo ">>> No errors were found. Well done."
  exit 0
fi
