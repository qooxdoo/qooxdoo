#!/bin/bash

cd `dirname $0`/../../..

tools/generate/make-source.sh
tools/generate/make-docs.sh
tools/generate/distribution/make-changelog.sh

mkdir -p release

version=`grep version source/script/core/QxMain.js | cut -d'"' -f2`
basename="qooxdoo-${version}"

rsync -rlv --delete --delete-excluded build/demo build/docs build/images release/$basename
rsync -rlv --delete --delete-excluded --exclude=*.js build/themes release/$basename
rsync -rlv --delete --delete-excluded build/script/qooxdoo.js* release/$basename/script
rsync -rlv --delete --exclude=CVS --exclude=.cvsignore [A-Z]* release/$basename

cd release

echo ">>> Creating .tar.bz2..."
tar cfj ${basename}.tar.bz2 $basename
echo ">>> Done"

echo ">>> Creating .tar.gz..."
tar cfz ${basename}.tar.gz $basename
echo ">>> Done"

echo ">>> Creating .zip..."
zip -qr9 ${basename}.zip $basename
echo ">>> Done"
