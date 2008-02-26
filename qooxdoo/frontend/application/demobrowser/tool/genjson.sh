#!/bin/bash

################################################################################
# Preparing generation of demo applications:
# - scans for html files of demos (in source/demo)
# - creates corresponding entry in JSON 'jobs' file
# - copys corresponding .js file in 'script' dir (from source/class/..., for
#   the 'View Source' function in DemoBrowser)
################################################################################

js_target=$1

JSON="demo.json"

source=""
build=""

echo "{" > $JSON

for html in `find source/demo -mindepth 2 -maxdepth 2 -name "*.html"`;
do
  # ignore non-application files (helpers etc.)
  grep "demobrowser.demo" $html > /dev/null || continue

  # extract category / name
  category=`echo $html | cut -d"/" -f3`
  name=`echo $html | cut -d"/" -f4 | cut -d"." -f1`

  echo ">>> Processing: $category.$name..."

  # build classname
  class=demobrowser.demo.$category.$name
  source="$source \"source-$class\","
  build="$build \"build-$class\","

  # copy js source file
  if [ -n "$js_target" ]; then
    mkdir -p $js_target
    cp source/class/${class//\./\/}.js $js_target/$class.src.js
  fi

  # concat all
  cat tool/json.tmpl | sed s:XXX:$class:g >> $JSON
  echo "," >> $JSON
  echo >> $JSON
  echo >> $JSON
done

echo '  "source" : {' >> $JSON
echo '    "run" : [' >> $JSON
echo "     $source]" | sed s:",]":"]":g >> $JSON
echo '  },' >> $JSON

echo >> $JSON
echo >> $JSON

echo '  "build" : {' >> $JSON
echo '    "run" : [' >> $JSON
echo "     $build]" | sed s:",]":"]":g >> $JSON
echo '  }' >> $JSON

echo "}" >> $JSON
