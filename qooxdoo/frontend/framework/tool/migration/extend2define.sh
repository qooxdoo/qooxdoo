#!/usr/bin/env bash

if [ "$1" = "" -o ! -r "$1" ]; then
  echo "First parameter: The directory to update ($1)"
  exit 1
fi

sourcedir="$1"

for file in `find $sourcedir -name "*.js"`; do

  grep "\.extend(" $file > /dev/null
  if [ $? != 0 ]; then
    continue
  fi

  ext=`grep "\.extend(" $file`

  superclass=`echo $ext | cut -d"(" -f2 | cut -d"," -f1`
  thisclass=`echo $ext | cut -d"(" -f2 | cut -d"," -f2 | cut -d")" -f1 | sed s:" ":"":g | sed s:"\"":"":g`

  orig="$thisclass = function"
  repl="qx.OO.defineClass(\"$thisclass\", $superclass, \nfunction"

  #echo $orig
  #echo $repl

  sed --in-place s/"$orig"/"$repl"/g $file

  perl -pi -e 's/\n/§/sg' $file
  perl -pi -e "s/;§*?\Q$ext\E/\);/sg" $file
  perl -pi -e 's/§/\n/sg' $file

done
