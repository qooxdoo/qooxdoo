#!/bin/bash

cd `dirname $0`/../..

find source/script/ -name "*.js" | xargs grep -n "$*"
