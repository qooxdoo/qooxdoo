#!/bin/bash

cd `dirname $0`/../../..

tools/make-realclean.sh
tools/generate/make-source.sh
tools/generate/distribution/make-changelog.sh

version=`grep version source/script/core/QxMain.js | cut -d'"' -f2`
basename="qooxdoo-${version}"

mkdir -p release/source/$basename
rsync -rlv --delete --exclude=CVS --exclude=.cvsignore source/demo source/images release/source/$basename
rsync -rlv --delete --exclude=CVS --exclude=.cvsignore source/script release/source/$basename
rsync -rlv --delete --exclude=CVS --exclude=.cvsignore source/themes release/source/$basename
rsync -lv --delete --exclude=CVS --exclude=.cvsignore [A-Z]* release/source/$basename

cd release/source

echo ">>> Creating .tar.bz2..."
tar cfj ../${basename}-source.tar.bz2 $basename
echo ">>> Done"

echo ">>> Creating .tar.gz..."
tar cfz ../${basename}-source.tar.gz $basename
echo ">>> Done"

echo ">>> Creating .zip..."
zip -qr9 ../${basename}-source.zip $basename
echo ">>> Done"
