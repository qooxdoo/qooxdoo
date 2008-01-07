#!/bin/bash

SOURCE=$1
DIRS=`./dirs.sh $SOURCE`
BASE=`basename $SOURCE`
TEMP=$BASE.tmp
TARGET=$BASE.dat

echo ">>> Indexing $BASE"

rm -f ${TEMP}
for DIR in $DIRS; do
  if [ -r $DIR ]; then
    find $DIR -mindepth 2 -maxdepth 2 -name "*.png" -o -name "*.svgz" -o -name "*.svg" >> ${TEMP}
  fi
done  
  
cat ${TEMP} | sed s:${SOURCE}/::g | cut -d"/" -f2- | cut -d"." -f1 | sort | uniq > $TARGET
rm -f ${TEMP}

echo ">>> Created $TARGET"
