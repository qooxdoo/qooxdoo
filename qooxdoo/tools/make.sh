#!/bin/bash

cd `dirname $0`/..

chmod ug+x tools/*.sh
chmod ug+x tools/*.py
chmod ug+x tools/*.pl

tools/makesource.sh
tools/makepublic.sh

sync
