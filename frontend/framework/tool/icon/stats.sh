#!/usr/bin/env bash

lfilled=`egrep "^\+" freedesktop_kde.dat | wc -l`
laddon=`egrep "^\*" freedesktop_kde.dat | wc -l`
lempty=`egrep "^[a-z]+" freedesktop_kde.dat | wc -l`

echo ">>> Stats"
echo "    empty:$lempty, filled:$lfilled, addon:$laddon"

echo
echo ">>> Malformed:"
grep -v "^#" freedesktop_kde.dat | grep "=" | grep -v "^+" | grep -v "^*"

echo
echo ">>> Done"
