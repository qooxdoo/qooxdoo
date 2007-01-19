#!/bin/bash

OUTPUT=themes/freedesktop
CONVERT=./modules/kde-to-freedesktop.py

echo ">>> Converting themes..."
chmod +x $CONVERT
mkdir -p $OUTPUT
for DIR in `find themes/kde -maxdepth 1 -mindepth 1 -type d ! -name archives -a ! -name incomplete -a ! -name .svn`
do
  THEMENAME=`basename $DIR`
  echo "  - $THEMENAME"
  ${CONVERT} -i $DIR -o ${OUTPUT}/${THEMENAME}
done
