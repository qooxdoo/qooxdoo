#!/bin/bash

SOURCE=$1
DIRS=`./dirs.sh $SOURCE`
BASE=`basename $SOURCE`
TEMP=$BASE.tmp
TARGET=$BASE.dat
ALIASES=`cat data/alias.dat`

echo ">>> Aliasing $BASE"

rm -f ${TEMP}
for DIR in $DIRS; do
  if [ -r $DIR ]; then
    # find $DIR -type l | xargs rm -f
    for ENTRY in $ALIASES; do
      echo $ENTRY
    done

    for WRONG in `find $DIR ! -type l -name "*_*"`; do
      echo "Wrong: $WRONG"
    done
  fi
done

cat ${TEMP} | sed s:${SOURCE}/::g | cut -d"/" -f2- | cut -d"." -f1 | sort | uniq > $TARGET
rm -f ${TEMP}

echo ">>> Fixed $TARGET"
