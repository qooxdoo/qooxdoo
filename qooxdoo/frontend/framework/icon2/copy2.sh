#!/bin/bash

for ENTRY in `cat data/use.dat | grep -v ^# | grep "/"`; do
  echo "ENTRY: $ENTRY"
done
