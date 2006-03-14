#!/usr/bin/env bash

cd `dirname $0`/../../..

echo ">>> Generating Changelog..."

chdir="`pwd`/build/docs/changelog"
mkdir -p $chdir

echo "  * XML..."
rm -f $chdir/changelog.xml
oldpwd=`pwd`

# going to root dir to include all branches and tags
cd ../..
svn log --xml --verbose > $chdir/changelog.xml
cd $oldpwd

echo "  * Text..."
xsltproc tools/generate/distribution/internal/svn2cl.xsl $chdir/changelog.xml > CHANGELOG
cp -f CHANGELOG $chdir/changelog.txt

echo ">>> Fixing file rights"
find build/docs/changelog/ -type f | xargs chmod 644
echo ">>> Done"
