#!/usr/bin/env bash

cd `dirname $0`/../../..

mkdir -p build/docs/changelog
rm -f build/docs/changelog/*
tools/generate/distribution/make-changelog.sh

echo ">>> Syncing to homepage"
rsync -rlvzcp --delete build/docs/changelog/* ${SCHLUNDUSER}@qooxdoo.oss.schlund.de:/kunden/homepages/21/d74480075/htdocs/qooxdoo/public/docs/changelog/
echo ">>> Done"
