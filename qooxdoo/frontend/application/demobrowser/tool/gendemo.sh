#!/bin/bash

JSON="demo.json"

all=""

echo "{" >> $JSON

for html in `find source/demo -mindepth 2 -maxdepth 2 -name "*.html"`; do
  # ignore non-application files (helpers etc.)
  grep "demobrowser.demo" $html > /dev/null || continue

  # extract category / name
  category=`echo $html | cut -d"/" -f3`
  name=`echo $html | cut -d"/" -f4 | cut -d"." -f1`

  # build classname
  class=demobrowser.demo.$category.$name
  all="$all $class"

  cat tool/json.tmpl | sed s:XXX:$class:g >> $JSON

done

echo "}" >> $JSON
