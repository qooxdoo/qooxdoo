#!/bin/bash

cd `dirname $0`/..
for file in `find source tools -type f -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.sh"`; do
  dos2unix $file
done

find tools -name "*.sh" | xargs chmod 775
