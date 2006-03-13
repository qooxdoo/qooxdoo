#!/usr/bin/env bash

cd `dirname $0`/../../..

echo ">>> Generating Changelog..."

chdir="build/docs/changelog"
mkdir -p $chdir

echo "  * XML..."
rm -f $chdir/changelog.xml
svn log --xml --verbose > $chdir/changelog.xml

echo "  * Text..."
xsltproc tools/generate/distribution/internal/svn2cl.xsl $chdir/changelog.xml > CHANGELOG
cp -f CHANGELOG $chdir/changelog.txt

echo ">>> Fixing file rights"
find build/docs/changelog/ -type f | xargs chmod 644
echo ">>> Done"
