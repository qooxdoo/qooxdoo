#!/bin/bash

cd `dirname $0`/..

chmod a+rx tools/*.sh
tools/makedocs.sh

rm -rf build/*
mkdir -p build/distribution/public
mkdir -p build/distribution/tools

echo "[A-1/1] >>> Syncing full distribution"
rsync -a --exclude=CVS --exclude=.* --exclude=*.in --exclude=Thumbs.db --exclude=*.xml public/docs build/distribution/public
rsync -a --exclude=CVS --exclude=.* --exclude=*.in --exclude=Thumbs.db public/images build/distribution/public
rsync -a --exclude=CVS --exclude=.* --exclude=*.in --exclude=Thumbs.db public/script build/distribution/public
rsync -a --exclude=CVS --exclude=.* --exclude=*.in --exclude=Thumbs.db public/style build/distribution/public
rsync -a --exclude=CVS --exclude=.* --exclude=*.in --exclude=Thumbs.db public/test build/distribution/public
rsync -a --exclude=CVS --exclude=.* --exclude=*.in --exclude=Thumbs.db --exclude=*.pl --exclude=*.py* --exclude=*.sh --exclude=*.xsl tools build/distribution

echo "[B-1/4] >>> Building ALL-WITH-DOCS Snapshot"
mkdir -p build/snapshots/allwithdocs
rsync -a build/distribution/public build/snapshots/allwithdocs/
rsync -a build/distribution/tools build/snapshots/allwithdocs/

echo "[B-2/4] >>> Building ALL Snapshot"
mkdir -p build/snapshots/all
rsync -a build/distribution/public/images build/snapshots/all/public/
rsync -a build/distribution/public/script build/snapshots/all/public/
rsync -a build/distribution/public/style build/snapshots/all/public/
rsync -a build/distribution/public/test build/snapshots/all/public/
rsync -a build/distribution/tools build/snapshots/all/

echo "[B-3/4] >>> Building DEVELOPER Snapshot"
mkdir -p build/snapshots/developer
rsync -a build/distribution/public/images build/snapshots/developer/public/
rsync -a build/distribution/public/script/qooxdoo.js* build/snapshots/developer/public/script/
rsync -a build/distribution/public/style build/snapshots/developer/public/
rsync -a build/distribution/public/test/developer build/snapshots/developer/public/test/
rsync -a build/distribution/tools build/snapshots/developer/

echo "[B-4/4] >>> Building USER Snapshot"
mkdir -p build/snapshots/user
rsync -a build/distribution/public/images build/snapshots/user/public/
rsync -a build/distribution/public/script/qooxdoo.js* build/snapshots/user/public/script/
rsync -a build/distribution/public/style build/snapshots/user/public/
rsync -a build/distribution/public/test/user build/snapshots/user/public/test/
rsync -a build/distribution/tools build/snapshots/user/

if [ "$1" != "noarch" ]; then
mkdir -p build/archives

echo "[C-1/4] >>> Building ALL-WITH-DOCS Archives"
cd build/snapshots/allwithdocs
zip -qr9 ../../archives/qooxdoo-allwithdocs.zip public tools
tar cfj ../../archives/qooxdoo-allwithdocs.tar.bz2 public tools
tar cfz ../../archives/qooxdoo-allwithdocs.tar.gz public tools
7za a -bd ../../archives/qooxdoo-allwithdocs.7z public tools 2> /dev/null
cd ../../../

echo "[C-2/4] >>> Building ALL Archives"
cd build/snapshots/all
zip -qr9 ../../archives/qooxdoo-all.zip public tools
tar cfj ../../archives/qooxdoo-all.tar.bz2 public tools
tar cfz ../../archives/qooxdoo-all.tar.gz public tools
7za a -bd ../../archives/qooxdoo-all.7z public tools 2> /dev/null
cd ../../../

echo "[C-3/4] >>> Building DEVELOPER Archives"
cd build/snapshots/developer
zip -qr9 ../../archives/qooxdoo-developer.zip public tools
tar cfj ../../archives/qooxdoo-developer.tar.bz2 public tools
tar cfz ../../archives/qooxdoo-developer.tar.gz public tools
7za a -bd ../../archives/qooxdoo-developer.7z public tools 2> /dev/null
cd ../../../

echo "[C-4/4] >>> Building USER Archives"
cd build/snapshots/user
zip -qr9 ../../archives/qooxdoo-user.zip public tools
tar cfj ../../archives/qooxdoo-user.tar.bz2 public tools
tar cfz ../../archives/qooxdoo-user.tar.gz public tools
7za a -bd ../../archives/qooxdoo-user.7z public tools 2> /dev/null
cd ../../../

fi

