#!/bin/bash

INPUT=themes/freedesktop/use
OUTPUT=themes/qooxdoo/use

echo ">>> Cleanup..."
rm -rf themes/qooxdoo/*

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

    if [ -r ${INPUT}/${THEME}/${ITEM} ]
    then
      if [ ! -r $TARGETDIR ]; then
        mkdir -p $TARGETDIR
      fi
      cp ${INPUT}/${THEME}/${ITEM} ${OUTPUT}/${THEME}/${ITEM}
    else
      echo "    - Missing icon: $ITEM (Malformed whitelist!)"
    fi
  done
done
