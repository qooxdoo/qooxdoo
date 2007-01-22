#!/usr/bin/env bash

INPUT=themes/freedesktop/use
OUTPUT=themes/qooxdoo/use

echo ">>> Cleanup..."
rm -rf ${OUTPUT}/*

echo ">>> Converting themes..."
for DIR in `find ${INPUT} -maxdepth 1 -mindepth 1 -type d ! -name .svn`
do
  THEME=`basename $DIR`
  echo "  - $THEME"

  for ITEM in `cat data/qooxdoo_whitelist.dat`
  do
    SIZE=`echo $ITEM | cut -d"x" -f1`
    SUBPATH=`echo $ITEM | cut -d"/" -f2-`

    SOURCE=${INPUT}/${THEME}/${ITEM}
    TARGET=${OUTPUT}/${THEME}/${SIZE}/${SUBPATH}
    TARGETDIR=`dirname $TARGET`

    if [ -r ${SOURCE} ]
    then
      if [ ! -r $TARGETDIR ]; then
        mkdir -p $TARGETDIR
      fi
      cp -fv ${SOURCE} ${TARGET}
    else
      echo "    - Missing icon: $ITEM (Malformed whitelist!)"
    fi
  done
done
