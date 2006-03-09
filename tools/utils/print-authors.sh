#!/usr/bin/env bash

cd `dirname $0`/../..

grep "^2005-" CHANGELOG | cut -d" " -f4 | sort | uniq -c | sort -nr
