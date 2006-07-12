#!/usr/bin/env bash

cd `dirname $0`/../../..

if [ "$SCHLUNDUSER" = "" ]; then
  SCHLUNDUSER=$USER
fi

tools/generate/make-source.sh
tools/generate/make-docs.sh

rsync -rlvzcp --delete build/demo build/docs build/images ${SCHLUNDUSER}@old.qooxdoo.org:/kunden/homepages/21/d74480075/htdocs/qooxdoo/homepage/public
rsync -rlvzcp --delete --delete-excluded --exclude=*.js build/themes ${SCHLUNDUSER}@old.qooxdoo.org:/kunden/homepages/21/d74480075/htdocs/qooxdoo/homepage/public
rsync -rlvzcp --delete --delete-excluded build/script/qooxdoo.js* ${SCHLUNDUSER}@old.qooxdoo.org:/kunden/homepages/21/d74480075/htdocs/qooxdoo/homepage/public/script
