#!/usr/bin/env bash

echo ">>> Indexing themes..."
mkdir -p temp
echo -n "" > temp/fd_content_all.txt
COUNT=0
for DIR in `find themes/freedesktop/use -maxdepth 1 -mindepth 1 -type d ! -name .svn`
do
  THEMENAME=`basename $DIR`
  echo "  - $THEMENAME"
  find $DIR -name "*.png" | cut -d"/" -f5- >> temp/fd_content_all.txt
  COUNT=$[$COUNT+1]
done

echo ">>> Normalizing..."
cat temp/fd_content_all.txt | sort | uniq -c | grep "${COUNT} " | cut -d" " -f8 > data/qooxdoo_whitelist.dat

echo ">>> Result..."
wc -l data/qooxdoo_whitelist.dat
