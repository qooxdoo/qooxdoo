#!/usr/bin/env bash

if [ "$1" = "" -o ! -r "$1" ]; then
  echo "First Parameter: The *.dat file to use! ($1)"
  exit 1
fi

datfile="$1"

if [ "$2" = "" -o ! -r "$2" ]; then
  echo "Second parameter: The directory to update ($2)"
  exit 1
fi

sourcedir="$2"

echo ">>> This script will update your files in the given folder."
echo ">>> Please be sure to have a valid backup first!"
echo ">>> Press <ENTER> to continue"
read



echo ">>> Sorting data..."
grep "=" $datfile | grep -v "^#" > /tmp/repltmp.dat
echo ">>> Done"
echo



for file in `find $sourcedir -name "*.html" -o -name "*.htm" -o -name "*.js" -o -name "*.php"`; do
  echo ">>> Updating $file..."

  for item in `cat /tmp/repltmp.dat`; do
    orig=`echo $item | cut -d= -f1`
    repl=`echo $item | cut -d= -f2-`

    sed --in-place s/"$orig"/"$repl"/g $file
  done
done

rm -f /tmp/repltmp.dat

echo ">>> Done"
