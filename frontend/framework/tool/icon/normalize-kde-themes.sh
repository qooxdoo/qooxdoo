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

      FILE1=$DIR/${SIZE}x${SIZE}/$NAME1.png
      FILE2=$DIR/${SIZE}x${SIZE}/$NAME2.png

      if [ -r ${FILE1} ]
      then
        if [ ! -r ${FILE2} -a ! -L ${FILE2} ]; then
          echo "    - Linking: $SIZE/$NAME1 -> $SIZE/$NAME2"
          mkdir -p `dirname ${FILE2}`
          ln -s ${FILE1} ${FILE2}
        fi
      fi

      if [ -r ${FILE2} ]
      then
        if [ ! -r ${FILE1} -a ! -L ${FILE1} ]; then
          echo "    - Linking: $SIZE/$NAME2 -> $SIZE/$NAME1"
          mkdir -p `dirname ${FILE1}`
          ln -s ${FILE2} ${FILE1}
        fi
      fi
    done
  done
done
