#!/usr/bin/env bash

SIZES="16 22 24 32 48 64 72 96 128"

echo ">>> Cleaning up old symlinks"
find themes/kde/use -type l | xargs rm -f

echo ">>> Symlinking identical images..."
for DIR in `find themes/kde/use -maxdepth 1 -mindepth 1 -type d ! -name .svn`
do
  THEMENAME=`basename $DIR`
  echo "  * $THEMENAME"

  for SIZE in $SIZES
  do
    for ITEM in `cat data/kde_normalize.dat`
    do
      NAME1=`echo $ITEM | cut -d"=" -f1`
      NAME2=`echo $ITEM | cut -d"=" -f2 | sed s:"=":"":g`

      if [ -r $DIR/${SIZE}x${SIZE}/$NAME1.png ]
      then
        if [ ! -r $DIR/${SIZE}x${SIZE}/$NAME2.png ]; then
          echo "    - Linking: $SIZE/$NAME1 -> $SIZE/$NAME2"
          ln -s $DIR/${SIZE}x${SIZE}/$NAME1.png $DIR/${SIZE}x${SIZE}/$NAME2.png
        fi
      fi

      if [ -r $DIR/${SIZE}x${SIZE}/$NAME2.png ]
      then
        if [ ! -r $DIR/${SIZE}x${SIZE}/$NAME1.png ]; then
          echo "    - Linking: $SIZE/$NAME2 -> $SIZE/$NAME1"
          ln -s $DIR/${SIZE}x${SIZE}/$NAME2.png $DIR/${SIZE}x${SIZE}/$NAME1.png
        fi
      fi
    done
  done
done
