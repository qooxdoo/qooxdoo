#!/usr/bin/env bash

cd `dirname $0`/../../..

tools/make-realclean.sh
tools/generate/make-source.sh
tools/utils/fix-rights.sh

version=`grep version source/script/core/QxMain.js | cut -d'"' -f2`
dir="release/source"

basename="qooxdoo-${version}"
unixbasename="${basename}-unix"
dosbasename="${basename}-dos"

echo ">>> Building release $version"

echo ">>> Creating directories"
mkdir -p release/source/$unixbasename
mkdir -p release/source/$dosbasename
echo ">>> Done"

echo ">>> Syncing files..."
rsync -rl --delete --exclude=CVS --exclude=.cvsignore source/demo source/images $dir/$unixbasename
rsync -rl --delete --exclude=CVS --exclude=.cvsignore source/script $dir/$unixbasename
rsync -rl --delete --exclude=CVS --exclude=.cvsignore source/themes $dir/$unixbasename
rsync -l --delete --exclude=CVS --exclude=.cvsignore [A-Z]* $dir/$unixbasename
echo ">>> Done"

cd $dir

echo ">>> Generating DOS-Copy..."
rsync -rl $unixbasename/* $dosbasename
echo ">>> Done"

echo ">>> Converting to DOS..."
(find $dosbasename -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.xml" -o -name "*.xsl" | xargs unix2dos) > /dev/null
echo ">>> Done"

echo ">>> Creating .tar.bz2..."
tar cfj ../${basename}-source.tar.bz2 $unixbasename
echo ">>> Done"

echo ">>> Creating .tar.gz..."
tar cfz ../${basename}-source.tar.gz $unixbasename
echo ">>> Done"

echo ">>> Creating .zip..."
zip -qr9 ../${basename}-source.zip $dosbasename
echo ">>> Done"
