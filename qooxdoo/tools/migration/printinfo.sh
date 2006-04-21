#!/usr/bin/env bash

cd `dirname $0`/../..

if [ "$1" = "" -o ! -r $1 ]; then
  echo "First Parameter: The *.dat file to use! ($1)"
  exit 1
fi

datfile="$1"

if [ "$2" = "" -o ! -r $2 ]; then
  echo "Second parameter: The directory to check ($2)"
  exit 1
fi

checkdir="$2"

if [ ! -r tools/namespaces ]; then
  echo "You need to be inside the main qooxdoo checkout folder!"
  exit 1
fi

echo ">>> This script will update your files in the given folder."
echo ">>> Please be sure to have a valid backup first!"
echo ">>> Press <ENTER> to continue"
read



echo ">>> Sorting class update information..."
grep "=" $datfile | grep -v "^#" | sort -r > /tmp/repltmp.dat
echo ">>> Done"
echo



for file in `find $checkdir -name "*.html" -o -name "*.htm" -o -name "*.js" -o -name "*.php"`; do
  echo ">>> Updating $file..."

  for item in `cat /tmp/repltmp.dat`; do
    orig=`echo $item | cut -d= -f1`
    msg=`echo $item | cut -d= -f2-`

    grep -q $orig $file > /dev/null 2>&1
    if [ $? != 0 ]; then
      echo "Found: $orig"
      echo "$msg"
    fi
  done
done

rm -f /tmp/repltmp.dat

echo ">>> Done"
