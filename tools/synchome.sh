#!/bin/bash

cd `dirname $0`/..

if [ "$SFUSER" = "" ]; then
  SFUSER=$USER
fi

tools/makebuilds.sh noarch

find build/snapshots/allwithdocs -type d | xargs chmod a+rx
find build/snapshots/allwithdocs ! -type d | xargs chmod a+r

echo "[D-1/1] >>> Syncing with homepage"
rsync -rlvz --delete build/snapshots/allwithdocs/* ${SFUSER}@qooxdoo.sf.net:/home/groups/q/qo/qooxdoo/htdocs/build
