#!/bin/bash

cd `dirname $0`/../..

find . -type d | xargs chmod 755
find . -name "*.py" -o -name "*.sh" | xargs chmod -v 755
find . -name "*.js" -o -name "*.html" -o -name "*.png" -o -name "*.gif" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.css" -o -name "*.xsl" -o -name "*.xml" | xargs chmod -v 644
