#!/bin/bash

FILES=$*
LEN=`echo $FILES | wc -w | sed s:\t::g | sed s:" "::g`
cat $FILES | sort | uniq -c | grep " $LEN " | cut -d$LEN -f2 | sed s:" "::g > common.tmp

IGNORE=`cat ignore.dat`
CMD="cat common.tmp"
for ENTRY in $IGNORE; do
    CMD+=" | grep -v \"^$ENTRY$\""
done

echo $CMD > common_gen.sh
bash ./common_gen.sh > common.dat
rm -f common_gen.sh
rm -f common.tmp

echo ">>> Common updated: common.dat"
