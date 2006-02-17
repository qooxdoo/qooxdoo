#!/bin/bash

cd `dirname $0`/../../..

echo ">>> Generating XML Changelog"

mkdir -p build/docs/changelog
rm -f build/docs/changelog/*
tools/generate/distribution/internal/cvs2cl.pl --xml -f build/docs/changelog/changelog.xml

echo ">>> Generating HTML Changelog"
xsltproc -o build/docs/changelog/changelog.html tools/generate/distribution/internal/changelog_html.xsl build/docs/changelog/changelog.xml

echo ">>> Generating RSS Changelog"
xsltproc -o build/docs/changelog/changelog.rss tools/generate/distribution/internal/changelog_rss.xsl build/docs/changelog/changelog.xml

echo ">>> Syncing to homepage"

rsync -rlvzc --delete build/docs/changelog/* ${SCHLUNDUSER}@qooxdoo.oss.schlund.de:/kunden/homepages/21/d74480075/htdocs/qooxdoo/public/docs/changelog/

echo ">>> Done"
