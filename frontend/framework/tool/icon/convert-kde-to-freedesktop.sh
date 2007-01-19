#!/bin/bash

OUTPUT=themes/freedesktop/use
CONVERT=./modules/kde-to-freedesktop.py

echo ">>> Converting themes..."
chmod +x $CONVERT
mkdir -p $OUTPUT
for DIR in `find themes/kde/use -maxdepth 1 -mindepth 1 -type d ! -name .svn`
do
  THEMENAME=`basename $DIR`
  echo "  * $THEMENAME"
  ${CONVERT} -i $DIR -o ${OUTPUT}/${THEMENAME}
done
