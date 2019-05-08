#!/usr/bin/env bash
set -x
echo "Testing qooxdoo-compiler version $(qx --version)"
echo

cd test
node test-deps.js
cd ..

qx contrib update || exit $?
bash test/bash/test-dependency-management.sh || exit $?

rm -rf myapp
# test create app
qx create myapp -I --type server -v || exit $?
cd myapp
../qx compile -v --clean || exit $?
node compiled/source/myapp/myapp.js || exit $?
# test qx contrib list
../qx contrib update  -v || exit $?
../qx contrib list    -v || exit $?
../qx contrib list --all --short --noheaders --match=qooxdoo/ || exit $?
../qx contrib list --json --installed || exit $?
# test add contrib
../qx contrib install oetiker/UploadWidget -v --release v1.0.1 || exit $?
../qx contrib install cboulanger/qx-contrib-Dialog -v || exit $?
../qx contrib install johnspackman/UploadMgr -v || exit $?
../qx contrib install ergobyte/qookery/qookeryace -v || exit $?
../qx contrib install ergobyte/qookery/qookerymaps -v || exit $?
../qx compile -v --clean || exit $?
node compiled/source/myapp/myapp.js || exit $?
../qx contrib list --installed --short --noheaders
# test reinstall contrib
../qx clean || exit $?
../qx contrib install -v || exit $?
../qx compile -v --clean || exit $?
node compiled/source/myapp/myapp.js
../qx contrib list -isH
# test remove contrib
../qx contrib remove oetiker/UploadWidget -v || exit $?
../qx contrib remove ergobyte/qookery/qookeryace -v || exit $?
../qx contrib remove ergobyte/qookery/qookerymaps -v || exit $?
../qx compile -v --clean || exit $?
node compiled/source/myapp/myapp.js || exit $?
../qx contrib list --installed --short --noheaders
# test install without manifest
../qx clean || exit $?
../qx contrib install ergobyte/qookery -v || exit $?
../qx compile -v --clean || exit $?
node compiled/source/myapp/myapp.js || exit $?
../qx contrib list --installed --short --noheaders
# test add class and add script
../qx add class myapp.Window --extend=qx.ui.window.Window || exit $?
../qx add script ../testdata/npm/script/jszip.js --rename=zip.js || exit $?
cp ../testdata/npm/application/*.js source/class/myapp
../qx lint --fix --warnAsError ||  exit $?
../qx compile -v --clean || exit $?
node compiled/source/myapp/myapp.js || exit $?

