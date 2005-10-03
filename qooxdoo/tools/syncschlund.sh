#!/bin/bash

cd `dirname $0`/..

if [ "$SCHLUNDUSER" = "" ]; then
  SCHLUNDUSER=$USER
fi

tools/makebuilds.sh noarch

find build/snapshots/allwithdocs -type d | xargs chmod a+rx
find build/snapshots/allwithdocs ! -type d | xargs chmod a+r

echo "[D-1/1] >>> Syncing with homepage"
rsync -rlvz --delete build/snapshots/allwithdocs/* ${SCHLUNDUSER}@qooxdoo.oss.schlund.de:/kunden/homepages/21/d74480075/htdocs/qooxdoo/demo/release
