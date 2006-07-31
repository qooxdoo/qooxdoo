#!/usr/bin/env bash

cd `dirname $0`/../..

for file in `find source/script/qx/ -name "*.js"`; 
do 
  echo ">>> $file"; 
  tools/generate-dev/validator.py $file; 
  if [ $? != 0 ]; then
    break;
  fi
done
