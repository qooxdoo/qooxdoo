#!/bin/bash

echo ">>> Indexing themes..."
mkdir -p temp
echo -n "" > temp/fd_content_all.txt
COUNT=0
for DIR in `find themes/fd -maxdepth 1 -mindepth 1 -type d ! -name archives -a ! -name .svn`
do
  THEMENAME=`basename $DIR`
  echo "  - $THEMENAME"
  find $DIR -name "*.png" -o -name "*.svg" | cut -d"/" -f4- >> temp/fd_content_all.txt
  COUNT=$[$COUNT+1]
done

cat temp/fd_content_all.txt | sort | uniq -c | grep "${COUNT} " | cut -d" " -f8 > data/qooxdoo_whitelist.dat
