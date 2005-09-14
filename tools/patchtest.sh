#!/bin/bash

cd `dirname $0`/..

echo ">>> Syncing files..."
mkdir -p public/test
rsync -av --exclude=CVS source/test public

mkdir -p public/images
rsync -av --exclude=CVS source/images public/

mkdir -p public/style
rsync -av --exclude=CVS --exclude=*.css source/style public/

echo ">>> Patching files..."
for file in `find source/test/ -name "*.html"`; 
do
  dfile=`echo $file | sed s:source:public:g`
  name=`basename $file | cut -d"." -f1 | sed s:"_":" ":g`

  mkdir -p `dirname $dfile`
  cat $file | sed s:"../../../tools/script/includer.js":"../../script/qooxdoo.js":g | sed s/"qooxdoo demo release"/"qooxdoo demo release: ${name}"/g > $dfile
done

echo ">>> Done"
