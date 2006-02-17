#!/bin/bash

cd `dirname $0`/../..

for file in `find source tools -type f -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.sh" -o -name "*.xsl" -o -name "*.xml"`; do
  grep -E '\s+$' $file > /dev/null
  if [ "$?" == "0" ]; then
    echo "Patching ${file}..."
    cp $file /tmp/trimright.txt
    cat /tmp/trimright.txt | sed s:"\\s+$":"":g > $file
  fi
done
