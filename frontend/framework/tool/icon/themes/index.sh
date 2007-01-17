#!/usr/bin/env bash

echo ">>> Indexing..."

WHITELIST="16x16 22x22 24x24 32x32 48x48 64x64 128x128 scaleable"
CATS="actions animations apps categories devices emblems emotes intl mimetypes places status"

for DIR in `find . -maxdepth 1 -mindepth 1 -type d`; do
  DNAME=`basename $DIR`
  echo "  - $DNAME"
  rm -f data/theme_${DNAME}.dat

  for SUB in $WHITELIST; do
    echo "    + $SUB"

    for CAT in $CATS; do
      if [ -r $DIR/$SUB/$CAT ]; then
        for FILE in `find $DIR/$SUB/$CAT -mindepth 1 -maxdepth 1 -name "*.png" -o -name "*.svg"`; do
          FNAME=`basename $FILE | cut -d"." -f1`
          echo "$CAT/$FNAME" >> data/theme_${DNAME}.dat
        done
      fi
    done
  done

  cat data/theme_${DNAME}.dat | sort | uniq > data/theme_${DNAME}.tmp
  rm data/theme_${DNAME}.dat
  mv data/theme_${DNAME}.tmp data/theme_${DNAME}.dat
done
