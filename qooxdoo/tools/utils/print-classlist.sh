#!/usr/bin/env bash

cd `dirname $0`/../..

for word in `grep -v "#" tools/generate/internal/config.sh | cut -d" " -f2 | cut -d"\"" -f1 | cut -d"/" -f3 | grep -v "=" | sort`; do
  echo $word
done
