#!/usr/bin/env bash

cd `dirname $0`/../../..

tools/generate/make-source.sh
tools/generate/make-docs.sh
tools/utils/fix-rights.sh

version=`grep version source/script/core/QxMain.js | cut -d'"' -f2`
dir="release/build"

basename="qooxdoo-${version}"
unixbasename="${basename}-unix"
dosbasename="${basename}-dos"

echo ">>> Building release $version"

echo ">>> Creating directories"
mkdir -p release/build/$unixbasename
mkdir -p release/build/$dosbasename
echo ">>> Done"

echo ">>> Syncing files..."
rsync -rl --delete build/demo build/docs build/images $dir/$unixbasename
rsync -rl --delete --exclude=*.js build/themes $dir/$unixbasename
rsync -rl --delete build/script/qooxdoo.js* $dir/$unixbasename/script
rsync -l --delete --exclude=.svn [A-Z]* $dir/$unixbasename
echo ">>> Done"

cd $dir

echo ">>> Generating DOS-Copy..."
rsync -rl $unixbasename/* $dosbasename
echo ">>> Done"

echo ">>> Converting to DOS..."
(find $dosbasename -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.xml" -o -name "*.xsl" | xargs unix2dos) > /dev/null 2>&1
echo ">>> Done"

echo ">>> Creating .tar.bz2..."
tar cfj ../${basename}-build.tar.bz2 $unixbasename
echo ">>> Done"

echo ">>> Creating .tar.gz..."
tar cfz ../${basename}-build.tar.gz $unixbasename
echo ">>> Done"

echo ">>> Creating .zip..."
zip -qr9 ../${basename}-build.zip $dosbasename
echo ">>> Done"
