#!/usr/bin/env bash

if [ "$1" = "" -o ! -r "$1" ]; then
  echo "First Parameter: The *.dat file to use! ($1)"
  exit 1
fi

datfile="$1"

if [ "$2" = "" -o ! -r "$2" ]; then
  echo "Second parameter: The directory to check ($2)"
  exit 1
fi

checkdir="$2"

echo ">>> This script will check your files in the given folder"
echo ">>> according to informations in the given data file."
echo ">>> Press <ENTER> to continue"
read



echo ">>> Sorting data..."
grep "=" $datfile | grep -v "^#" | sort -r > /tmp/infotmp.dat
cat /tmp/infotmp.dat | cut -d= -f1 > /tmp/infokeystmp.dat
echo ">>> Done"
echo



for file in `find $checkdir -name "*.html" -o -name "*.htm" -o -name "*.js" -o -name "*.php"`; do
  echo ">>> Checking $file..."

  for item in `cat /tmp/infokeystmp.dat`; do
    grep -q $item $file > /dev/null 2>&1
    if [ $? = 0 ]; then
      echo -n "[$item] "
      grep "^${item}=" /tmp/infotmp.dat | cut -d= -f2-
    fi
  done
done

rm -f /tmp/repltmp.dat /tmp/infokeystmp.dat

echo ">>> Done"
