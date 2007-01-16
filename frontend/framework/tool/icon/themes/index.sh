#!/usr/bin/env bash

echo ">>> Indexing..."

WHITELIST="16x16 22x22 24x24 32x32 scaleable"
CATS="actions animations apps categories devices emblems emotes intl mimetypes places status"

for DIR in `find . -maxdepth 1 -mindepth 1 -type d`; do
  DNAME=`basename $DIR`
  echo "  - $DNAME"
  rm -f ${DNAME}.dat

  for SUB in $WHITELIST; do
    echo "    + $SUB"

    for CAT in $CATS; do
      if [ -r $DIR/$SUB/$CAT ]; then
        for FILE in `find $DIR/$SUB/$CAT -mindepth 1 -maxdepth 1 -name "*.png" -o -name "*.svg"`; do
          FNAME=`basename $FILE | cut -d"." -f1`
          echo "$CAT/$FNAME" >> ${DNAME}.dat
        done        
      fi
    done
  done

  cat ${DNAME}.dat | sort | uniq > ${DNAME}.tmp
  rm ${DNAME}.dat
  mv ${DNAME}.tmp ${DNAME}.dat
done
