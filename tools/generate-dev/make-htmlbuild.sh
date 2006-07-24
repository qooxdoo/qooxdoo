#!/usr/bin/env bash

echo
echo "  GENERATING HTML BUILD:"
echo "----------------------------------------------------------------------------"
echo "  * Syncing HTML files..."

mkdir -p build/demo
rsync -rl --include=*.html --exclude=.svn --delete --exclude=qx.js source/demo/* build/demo
