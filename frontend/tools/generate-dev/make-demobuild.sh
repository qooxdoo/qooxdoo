#!/usr/bin/env bash

echo
echo "  GENERATION OF DEMO BUILD DATA:"
echo "----------------------------------------------------------------------------"
echo "  * Syncing files..."

mkdir -p build/demo
rsync --recursive --links --include=*.html --exclude=.svn --delete --exclude=qx.js source/demo/* build/demo
