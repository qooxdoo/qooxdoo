#!/bin/bash

cd `dirname $0`/../..

tools/utils/fix-dos2unix.sh
tools/utils/fix-tab2space.sh
tools/utils/fix-trimright.sh
tools/utils/fix-rights.sh
