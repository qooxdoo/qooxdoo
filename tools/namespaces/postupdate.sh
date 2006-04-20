#!/usr/bin/env bash

cd `dirname $0`/../..

if [ "$1" = "" ]; then
  echo "First parameter: The directory to update"
  exit 1
fi

if [ ! -r tools/namespaces ]; then
  echo "You need to be inside the main qooxdoo checkout folder!"
  exit 1
fi

base="tools/namespaces"

echo ">>> This script will update your files in the given folder."
echo ">>> Please be sure to have a valid backup first!"
echo ">>> Please press <ENTER> to continue"
read



echo ">>> Sorting post update information..."
grep "=" $base/postupdate.dat | sort -r > $base/postupdate.dat.tmp
echo ">>> Done"
echo



for file in `find $1 -name "*.html" -o -name "*.htm" -o -name "*.js" -o -name "*.php"`; do
  echo ">>> Updating $file..."

  for item in `cat $base/postupdate.dat.tmp`; do
    orig=`echo $item | cut -d= -f1`
    repl=`echo $item | cut -d= -f2-`

    sed --in-place s/"$orig"/"$repl"/g $file
  done
done

rm -f $base/postupdate.dat.tmp

echo ">>> Done"
