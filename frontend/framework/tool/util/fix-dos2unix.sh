#!/usr/bin/env bash

cd `dirname $0`/../../..

for file in `find framework/source api/source demo/source skeleton/source/*/source -type f -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.sh" -o -name "*.xml" -o -name "*.xsl" -o -name Makefile`; do
  dos2unix $file
done
