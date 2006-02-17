#!/bin/bash

cd `dirname $0`/../../..

echo ">>> Syncing files..."
mkdir -p build/images
rsync -rlv --exclude=CVS --exclude=.cvsignore --exclude=Thumbs.db source/images build/

mkdir -p build/themes
rsync -rlv --exclude=CVS --exclude=.cvsignore --exclude=*.js --exclude=Thumbs.db source/themes build/
echo ">>> Done"
