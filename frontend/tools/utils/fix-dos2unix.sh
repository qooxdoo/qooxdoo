#!/usr/bin/env bash

cd `dirname $0`/../..

for file in `find source tools -type f -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.sh" -o -name "*.xml" -o -name "*.xsl"`; do
  dos2unix $file
done
