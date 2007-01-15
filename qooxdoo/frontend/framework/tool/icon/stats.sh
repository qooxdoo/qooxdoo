#!/usr/bin/env bash

lfilled=`egrep "^\+" tango_kde.dat | wc -l`
laddon=`egrep "^\*" tango_kde.dat | wc -l`
lempty=`egrep "^[a-z]+" tango_kde.dat | wc -l`

echo ">>> Stats"
echo "    empty:$lempty, filled:$lfilled, addon:$laddon"
