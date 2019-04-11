#!/usr/bin/env bash

echo
echo "Test 1: qxl.test1, latest version"
[[ -d myapp ]] && rm -rf myapp
qx create myapp -I
cd myapp
qx contrib install qooxdoo/qxl.test1
LIST=$(qx contrib list --short --noheaders --installed --all)
echo "$LIST"
COUNTLINES=$(echo "$LIST" | wc -l | tr -d ' ')
[ "$COUNTLINES" == "3" ] || (echo "Installing dependencies failed" || exit 1)
qx compile --feedback=false || exit 1
cd ..

echo
echo "Test 2: qxl.test2/qxl.test2A, latest version"
rm -rf myapp
qx create myapp -I
cd myapp
qx contrib install qooxdoo/qxl.test2/qxl.test2A
LIST=$(qx contrib list --short --noheaders --installed --all)
echo "$LIST"
COUNTLINES=$(echo "$LIST" | wc -l | tr -d ' ')
[ "$COUNTLINES" == "4" ] || (echo "Installing dependencies failed" || exit 1)
qx compile --feedback=false || exit 1
cd ..

echo
echo "Test 3: qxl.test1@v1.0.2 version"
rm -rf myapp
qx create myapp -I
cd myapp
qx contrib install qooxdoo/qxl.test1@v1.0.2
LIST=$(qx contrib list --short --noheaders --installed --all)
echo "$LIST"
EXPECTED="\
qooxdoo/qxl.test1              v1.0.2   v1.0.2   v1.0.2
qooxdoo/qxl.test2/qxl.test2C   v1.0.2   v1.0.2   v1.0.2
qooxdoo/qxl.test2/qxl.test2D   v1.0.2   v1.0.2   v1.0.2"
[ "$EXPECTED" == "$LIST" ] || (echo "Installing dependencies failed" || exit 1)
qx compile --feedback=false || exit 1
cd ..

echo
echo "Test 4: qxl.test1@e27ecf811667c1b3bc5dc023d806e74a9328a26c"
rm -rf myapp
qx create myapp -I
cd myapp
qx contrib install qooxdoo/qxl.test1@e27ecf811667c1b3bc5dc023d806e74a9328a26c
LIST=$(qx contrib list --short --noheaders --installed --all)
echo "$LIST"
EXPECTED="\
qooxdoo/qxl.test1              e27ecf811667c1b3bc5dc023d806e74a9328a26c   v1.0.2   v1.0.2
qooxdoo/qxl.test2/qxl.test2C   v1.0.2                                     v1.0.2   v1.0.2
qooxdoo/qxl.test2/qxl.test2D   v1.0.2                                     v1.0.2   v1.0.2"
[ "$EXPECTED" == "$LIST" ] || (echo "Installing dependencies failed" || exit 1)
qx compile --feedback=false || exit 1
cd ..
