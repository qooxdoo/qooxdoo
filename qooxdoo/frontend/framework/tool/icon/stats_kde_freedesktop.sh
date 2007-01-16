#!/usr/bin/env bash

lcommon=`egrep "^\+" freedesktop_kde.dat | wc -l`
lkde=`egrep "^\*" freedesktop_kde.dat | wc -l`
lfd=`egrep "^\-" freedesktop_kde.dat | wc -l`
lunspec=`egrep "^[a-z]+" freedesktop_kde.dat | wc -l`

echo ">>> Stats"
echo "    common:$lcommon, fd-only:$lfd, kde-only:$lkde, unspec:$lunspec"
