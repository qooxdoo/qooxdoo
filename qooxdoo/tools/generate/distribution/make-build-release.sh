#!/bin/bash

cd `dirname $0`/../../..

#tools/generate/make-source.sh
#tools/generate/make-docs.sh
#tools/generate/distribution/make-changelog.sh

version=`grep version source/script/core/QxMain.js | cut -d'"' -f2`
basename="qooxdoo-${version}"

mkdir -p release/build/$basename

rsync -rlv --delete build/demo build/docs build/images release/build/$basename
rsync -rlv --delete --exclude=*.js build/themes release/build/$basename
rsync -rlv --delete build/script/qooxdoo.js* release/build/$basename/script
rsync -lv --delete --exclude=CVS --exclude=.cvsignore [A-Z]* release/build/$basename

cd release/build

echo ">>> Creating .tar.bz2..."
tar cfj ../${basename}-build.tar.bz2 $basename
echo ">>> Done"

echo ">>> Creating .tar.gz..."
tar cfz ../${basename}-build.tar.gz $basename
echo ">>> Done"

echo ">>> Creating .zip..."
zip -qr9 ../${basename}-build.zip $basename
echo ">>> Done"
