#!/bin/bash

cd `dirname $0`/../..

cvs diff 2>&1 | grep -v "cvs diff"
