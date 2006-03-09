#!/usr/bin/env bash

cd `dirname $0`/../..

echo ">>> Cleaning up..."

find . -name "*~" -o -name "*.old" -o -name "*.bak" -o -name ".#*" | xargs rm -fv

echo ">>> Done"

