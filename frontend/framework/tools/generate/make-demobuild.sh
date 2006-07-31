#!/usr/bin/env bash

echo
echo "  GENERATION OF DEMO BUILD DATA:"
echo "----------------------------------------------------------------------------"
echo "  * Syncing files..."

mkdir -p build/demo
rsync --recursive --links --delete --include=*.html --exclude=*.in --exclude=.svn --exclude=qx.js source/demo/* build/demo
