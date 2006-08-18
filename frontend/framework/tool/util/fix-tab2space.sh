#!/usr/bin/env bash

cd `dirname $0`/../..

echo ">>> Converting tab to 2 spaces..."

for file in `find source tools -type f -name "*.css" -o -name "*.html" -o -name "*.xsl" -o -name "*.py" -o -name "*.js" -o -name "*.sh"`;
do
  echo "  - processing: $file"
  perl -pi -e 's/\t/  /g' $file
done

echo ">>> Done"
