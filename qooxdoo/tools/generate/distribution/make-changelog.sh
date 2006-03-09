#!/usr/bin/env bash

cd `dirname $0`/../../..

echo ">>> Generating Changelog..."

if [ -r CHANGELOG ]; 
then
  cp -f CHANGELOG CHANGELOG.old
  tools/generate/distribution/internal/cvs2cl.pl --accum -f CHANGELOG
else
  tools/generate/distribution/internal/cvs2cl.pl -f CHANGELOG
fi

if [ $? = 0 ]; then
  rm -f CHANGELOG.*
fi

echo ">>> Done"
