#!/bin/bash

DEPLOY_PK="$1"

RSYNC_OPTS="--recursive --perms --times --group --owner --devices --specials --verbose --copy-links --copy-dirlinks --delete"

mkdir tmp 
ABSOLUTE_TMP=$(echo "$(cd "$(dirname "$tmp")"; pwd -P)/$(basename "tmp")")
echo "$DEPLOY_PK" > ./tmp/deploy-key
chmod 0600 ./tmp/deploy-key

git config --global user.email "deployment@qooxdoo.org"
git config --global user.name "Automated Deployment for qooxdoo/qooxdoo"
git clone -c core.sshCommand="/usr/bin/ssh -i $ABSOLUTE_TMP/deploy-key" git@github.com:qooxdoo/qooxdoo.github.io.git --depth=1 ./tmp/qooxdoo.github.io

rsync $RSYNC_OPTS ./docs ./tmp/qooxdoo.github.io

cd ./tmp/qooxdoo.github.io
if [[ ! -d .git ]] ; then
    echo "The checked out qooxdoo.github.io is not a .git repo!"
    exit 1
fi

git add .
git commit -m 'automatic deployment from qooxdoo/qooxdoo/.github/workflows/deploy-docs.sh'
git push

rm -f $ABSOLUTE_TMP/deploy-key
