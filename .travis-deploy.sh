#!/bin/bash

set -o errexit -o nounset

TARGET="devel"
CURRENT=0

rev=$(git rev-parse --short HEAD)
mkdir deploy && cd deploy

git init
git config --global user.name "Travis CI deploy"
git config --global user.email "no-reply@qooxdoo.org"
git config --global push.default simple

git remote add upstream "https://$DEPLOY_KEY@github.com/qooxdoo/qooxdoo.github.io.git"
git fetch upstream
git merge upstream/master

# Adjust settings for TAG build
if [ "$TRAVIS_TAG" != "" ]; then
  RELEASE=${TRAVIS_TAG#release_}
  TARGET=${RELEASE//_/.}
  LAST_VERSION=$(ls -1d [0-9]* | sort -V | tail -n1)

  if dpkg --compare-versions "$TARGET" "gt" "$LAST_VERSION"; then
    CURRENT=1
  fi
fi


rm -rf "$TARGET" &> /dev/null
cp -a ../build "$TARGET"

# Maintain the current link
if [ $CURRENT = 1 ]; then
  rm -rf current &> /dev/null
  ln -s "$TARGET" current
fi

#TODO: When we've some more control over the qx DNS records, we can add a CNAME here...
#echo "qooxdoo.org" > CNAME

touch .nojekyll
touch .

git add -A .
git commit -m "Refresh site at ${rev}"
git push -q upstream HEAD:master
