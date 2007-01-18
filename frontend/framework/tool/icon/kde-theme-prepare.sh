#!/bin/bash

BASESIZE="16x16"

echo ">>> Indexing themes..."
mkdir -p temp
echo "" > temp/content_all.txt
COUNT=0
for DIR in `find themes/kde -maxdepth 1 -mindepth 1 -type d ! -name archives -a ! -name .svn`
do
  THEMENAME=`basename $DIR`
  echo "  - $THEMENAME"
  find $DIR -name "*.png" -o -name "*.svg" | cut -d"/" -f4- >> temp/content_all.txt
  COUNT=$[$COUNT+1]
done

echo ">>> Building common list..."
cat temp/content_all.txt | sort | uniq -c | grep "$COUNT " | cut -d" " -f8 | cut -d"." -f1 > temp/content_common.txt

echo ">>> Building list for base size..."
grep $BASESIZE temp/content_common.txt | cut -d"/" -f2- | sort | uniq > temp/content_common_base.txt

echo ">>> Preparing replacement map..."
cat data/freedesktop_kde.dat | cut -s -d"=" -f2 | cut -d" " -f2 | sort | uniq > temp/content_assigned.txt

echo ">>> Finding differences..."
diff temp/content_common_base.txt temp/content_assigned.txt > temp/content_assigned_diff.txt

echo ">>> Unassigned images..."
grep "^<" temp/content_assigned_diff.txt | cut -d" " -f2-

echo ">>> Unavailable images (hopefully empty)..."
grep "^>" temp/content_assigned_diff.txt | cut -d" " -f2-
