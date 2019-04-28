#!/usr/bin/env bash
set -x
echo "Testing qooxdoo-compiler version $(qx --version)"
echo

cd test
node test-deps.js
cd ..

qx package update || exit $?
bash test/bash/test-dependency-management.sh || exit $?

rm -rf myapp
# test create app
qx create myapp -I --type server -v || exit $?
cd myapp
qx compile -v --clean || exit $?
node compiled/source/myapp/myapp.js || exit $?
# test qx package list
qx package update  -v || exit $?
qx package list    -v || exit $?
qx package list --all --short --noheaders --match=qooxdoo/ || exit $?
qx package list --json --installed || exit $?
# test add package
qx package install oetiker/UploadWidget -v --release v1.0.1 || exit $?
qx package install cboulanger/qx-contrib-Dialog -v || exit $?
qx package install johnspackman/UploadMgr -v || exit $?
qx package install ergobyte/qookery/qookeryace -v || exit $?
qx package install ergobyte/qookery/qookerymaps -v || exit $?
qx compile -v --clean || exit $?
node compiled/source/myapp/myapp.js || exit $?
qx package list --installed --short --noheaders
# test reinstall package
qx clean -v || exit $?
qx package install -v || exit $?
qx compile -v --clean || exit $?
node compiled/source/myapp/myapp.js
qx package list -isH
# test remove package
qx package remove oetiker/UploadWidget -v || exit $?
qx package remove ergobyte/qookery/qookeryace -v || exit $?
qx package remove ergobyte/qookery/qookerymaps -v || exit $?
qx compile -v --clean || exit $?
node compiled/source/myapp/myapp.js || exit $?
qx package list --installed --short --noheaders
# test install without manifest
qx clean -v || exit $?
qx package install ergobyte/qookery -v || exit $?
qx compile -v --clean || exit $?
node compiled/source/myapp/myapp.js || exit $?
qx package list --installed --short --noheaders
# test add class and add script
qx add class myapp.Window --extend=qx.ui.window.Window || exit $?
qx add script ../testdata/npm/script/jszip.js --rename=zip.js || exit $?
cp ../testdata/npm/application/*.js source/class/myapp
qx lint --fix --warnAsError ||  exit $?
qx compile -v --clean || exit $?
node compiled/source/myapp/myapp.js || exit $?

