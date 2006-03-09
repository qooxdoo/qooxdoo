#!/usr/bin/env bash

cd `dirname $0`/../..

echo ">>> Fixing directory rights..."
find . -type d | xargs chmod 755

echo ">>> Fixing script rights..."
find . -name "*.py" -o -name "*.sh" | xargs chmod 755

echo ">>> Fixing file rights..."
find . -name "*.js" -o -name "*.html" -o -name "*.png" -o -name "*.gif" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.css" -o -name "*.xsl" -o -name "*.xml" | xargs chmod 644

echo ">>> Done"
