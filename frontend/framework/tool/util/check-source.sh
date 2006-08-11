#!/usr/bin/env bash

cd `dirname $0`/../..

p=`pwd`
cd source/script
err=0

echo ">>> Testing source files..."

for file in `find . -name "*.js"`;
do
  lerr=0
  ltxt=""
  pkgerr=0
  copyerr=0
  classerr=0
  disposeerr=0

  grep "#package(.*)" $file > /dev/null 2>&1
  if [ $? != 0 ]; then
    lerr=$[$lerr+1]
    pkgerr=1
  fi

  grep "All rights reserved" $file > /dev/null 2>&1 && grep "Schlund + Partner AG" $file > /dev/null 2>&1 && grep "LGPL 2.1" $file > /dev/null 2>&1
  if [ $? != 0 ]; then
    lerr=$[$lerr+1]
    copyerr=1
  fi

  grep "qx.OO.defineClass(" $file > /dev/null 2>&1
  if [ $? != 0 ]; then
    lerr=$[$lerr+1]
    classerr=1
  fi

  if [ `basename $file` != "QxObject.js" ];
  then
    grep "proto\.dispose" $file > /dev/null
    if [ $? == 0 ]; then
      grep "dispose\.call" $file > /dev/null
      if [ $? != 0 ]; then
        lerr=$[$lerr+1]
        disposeerr=1
      fi
    fi
  fi

  if [ $lerr -gt 0 ]; then
    echo " * `echo $file | cut -d/ -f2-`"

    if [ $pkgerr = 1 ]; then
      echo "   - Missing package information"
    fi

    if [ $copyerr = 1 ]; then
      echo "   - Missing header"
    fi

    if [ $classerr = 1 ]; then
      echo "   - Missing defineClass call"
    fi

    if [ $disposeerr = 1 ]; then
      echo "   - Errornous superClass disposer call"
    fi

    echo -en $ltxt
  fi

  err=$[$err+$lerr]
done

cd $p

if [ $err -gt 0 ]; then
  echo ">>> Please correct the above erros!"
  exit 1
else
  echo ">>> No errors were found. Well done."
  exit 0
fi
