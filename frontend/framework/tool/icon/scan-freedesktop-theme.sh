#!/usr/bin/env bash

echo ">>> Indexing..."

BASE=`dirname $0`
THEMEBASE=$BASE/data/theme_
WHITELIST="16x16 22x22 24x24 32x32 48x48 64x64 128x128 scaleable"
CATS="actions animations apps categories devices emblems emotes intl mimetypes places status"

for DIR in $@; do
  DNAME=`basename $DIR`

  echo "  - $DNAME"
  rm -f ${THEMEBASE}${DNAME}.dat

  for SUB in $WHITELIST; do
    echo "    + $SUB"

    for CAT in $CATS
    do
      if [ -r $DIR/$SUB/$CAT ]; then
        for FILE in `find $DIR/$SUB/$CAT -mindepth 1 -maxdepth 1 -name "*.png" -o -name "*.svg"`; do
          FNAME=`basename $FILE | cut -d"." -f1`
          echo "$CAT/$FNAME" >> ${THEMEBASE}${DNAME}.dat
        done
      fi
    done
  done

  if [ -r ${THEMEBASE}${DNAME}.dat ]; then
    cat ${THEMEBASE}${DNAME}.dat | sort | uniq > ${THEMEBASE}${DNAME}.tmp
    rm -f ${THEMEBASE}${DNAME}.dat
    mv ${THEMEBASE}${DNAME}.tmp ${THEMEBASE}${DNAME}.dat
  fi
done
