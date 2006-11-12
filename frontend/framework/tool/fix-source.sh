#!/usr/bin/env bash

cd `dirname $0`/../../..

for file in `find framework/source api/source demo/source skeleton/source/*/source -type f -name "*.css" -o -name "*.html" -o -name "*.xsl" -o -name "*.py" -o -name "*.js" -o -name "*.sh"`; do
  dos2unix $file > /dev/null 2>&1 && sed -i 's/\t/  /g' $file
done
