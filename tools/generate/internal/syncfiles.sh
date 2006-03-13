#!/usr/bin/env bash

cd `dirname $0`/../../..

echo ">>> Syncing files..."
mkdir -p build/images
rsync -rl --exclude=.svn --exclude=Thumbs.db source/images build/

mkdir -p build/themes
rsync -rl --exclude=.svn --exclude=*.js --exclude=Thumbs.db source/themes build/
echo ">>> Done"
