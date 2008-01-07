#!/bin/bash

PREFIX=$1
SIZES="8 11 16 22 32 48 64 128"
DIRS="${PREFIX}/scalable"

for SIZE in $SIZES; do
  DIRS+=" ${PREFIX}/${SIZE}x${SIZE}"
done

echo $DIRS
