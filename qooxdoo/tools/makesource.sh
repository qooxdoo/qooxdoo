#!/bin/bash

cd `dirname $0`/..
cd tools

cat script/includer.js.in > script/includer.js
grep -v \"\" config.sh | sed s:"L=\"\$L ":"inc(\"":g | sed s:"\"$":"\");":g | sed s:"\# ":"// ":g >> script/includer.js

cat script/layout.js.in > script/layout.js

devstr=""
for file in ../source/test/developer/*.html ; do devstr="$devstr `basename $file`"; done
echo "var devstr = \"$devstr\";" >> script/layout.js

usrstr=""
for file in ../source/test/user/*.html ; do usrstr="$usrstr `basename $file`"; done
echo "var usrstr = \"$usrstr\";" >> script/layout.js

echo "showTestFiles();" >> script/layout.js

sync
