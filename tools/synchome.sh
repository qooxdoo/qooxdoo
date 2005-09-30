#!/bin/bash

cd `dirname $0`/..

if [ "$SFUSER" = "" ]; then
  SFUSER=$USER
fi

tools/makebuilds.sh noarch

echo "[D-1/1] >>> Syncing with homepage"
rsync -avz --delete build/snapshots/allwithdocs/* ${SFUSER}@qooxdoo.sf.net:/home/groups/q/qo/qooxdoo/htdocs/build

