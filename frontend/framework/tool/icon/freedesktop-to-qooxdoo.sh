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
    SOURCE=${INPUT}/${THEME}/${ITEM}
    TARGET=${OUTPUT}/${THEME}/${ITEM}
    TARGETDIR=`dirname $TARGET`
    SIZE=`echo $ITEM | cut -d"x" -f1`
    SUBPATH=`echo $ITEM | cut -d"/" -f2`

    if [ -r ${INPUT}/${THEME}/${ITEM} ]
    then
      if [ ! -r $TARGETDIR ]; then
        mkdir -p $TARGETDIR
      fi
      cp ${INPUT}/${THEME}/${ITEM} ${OUTPUT}/${THEME}/${SIZE}/${SUBPATH}
    else
      echo "    - Missing icon: $ITEM (Malformed whitelist!)"
    fi
  done
done
