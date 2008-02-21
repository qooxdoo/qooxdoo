#!/bin/bash

JOB=$1

for class in `find source/class/demobrowser/demo -mindepth 2 -maxdepth 2 -name "*.js"`; do
  NAME=`echo $class | cut -d"/" -f3- | cut -d"." -f1 | sed s:"/":".":g`
  echo
  echo ">>> DEMO: $NAME..."
  cat demo.json | sed s:XXX:$NAME:g > temp.json
  ../../tool/generator.py -c temp.json -j $JOB || exit 1
  rm -f temp.json
done
