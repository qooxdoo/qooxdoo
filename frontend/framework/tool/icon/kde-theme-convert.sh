#!/bin/bash

OUTPUT=themes/converted
CONVERT=./kde-to-freedesktop.py

echo ">>> Converting themes..."
mkdir -p temp
echo "" > temp/content_all.txt
COUNT=0

chmod +x $CONVERT
for DIR in `find themes/kde -maxdepth 1 -mindepth 1 -type d ! -name archives -a ! -name .svn`
do
  THEMENAME=`basename $DIR`
  echo "  - $THEMENAME"
  ${CONVERT} -i $DIR -o ${OUTPUT}/${THEMENAME}
done
