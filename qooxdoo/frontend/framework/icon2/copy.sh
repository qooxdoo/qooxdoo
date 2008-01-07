#!/bin/bash

SOURCE="$1"

if [ "$SOURCE" = "" ]; then
  echo ">>> Please define a source directory"
  exit 1
fi

DIRS=`./dirs.sh $SOURCE`
FILES=`cat common.dat`
BASE=build/`basename $1`

for FILE in $FILES; do
  SCALABLE=""
  echo ">>> Processing $FILE..."

  for DIR in $DIRS; do
    echo $DIR | grep "scalable" > /dev/null
    if [ "$?" == "0" ]; then
      SCALABLE=$DIR
      continue
    fi
    
    FROM=${DIR}/${FILE}.png
    SIZE=`basename $DIR | cut -dx -f1`
    TODIR=`dirname $BASE/$SIZE/$FILE`

    mkdir -p $TODIR || exit 1
    
    if [ -r $FROM ]; then
      cp -f $FROM $TODIR || exit 1
      continue
    fi
    
    if [ "$SCALABLE" != "" ]; then
      SVG=$SCALABLE/${FILE}.svg
      SVGZ=$SCALABLE/${FILE}.svgz
      FROM=`basename ${FILE}`.png
      
      if [ -r $SVG ]; then
        rsvg-convert -w $SIZE -h $SIZE -o $FROM $SVG || exit 1
        mv $FROM $TODIR || exit 1
        continue
      elif [ -r $SVGZ ]; then
        gzcat $SVGZ > temp.svg
        rsvg-convert -w $SIZE -h $SIZE -o $FROM temp.svg || exit 1
        rm -f temp.svg || exit 1
        mv $FROM $TODIR || exit 1
        continue
      fi
    fi

    echo "  - Missing image for ${SIZE}px!"
  done
done
