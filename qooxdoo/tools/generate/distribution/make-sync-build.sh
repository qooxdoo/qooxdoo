#!/usr/bin/env bash

cd `dirname $0`/../../..

if [ "$SCHLUNDUSER" = "" ]; then
  SCHLUNDUSER=$USER
fi

tools/generate/make-source.sh
tools/generate/make-build.sh

rsync -rlvzcp --delete build/demo build/images ${SCHLUNDUSER}@qooxdoo.oss.schlund.de:/kunden/homepages/21/d74480075/htdocs/qooxdoo/public
rsync -rlvzcp --delete --delete-excluded --exclude=*.js build/themes ${SCHLUNDUSER}@qooxdoo.oss.schlund.de:/kunden/homepages/21/d74480075/htdocs/qooxdoo/public
rsync -rlvzcp --delete --delete-excluded build/script/qooxdoo.js* ${SCHLUNDUSER}@qooxdoo.oss.schlund.de:/kunden/homepages/21/d74480075/htdocs/qooxdoo/public/script
