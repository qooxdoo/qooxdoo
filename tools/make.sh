#!/bin/bash

cd `dirname $0`/..

chmod og+x tools/*.sh
chmod og+x tools/*.py

tools/makesource.sh
tools/makepublic.sh

sync
