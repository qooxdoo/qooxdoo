#!/bin/bash

set -e
set -x

qx export-glyphs MaterialIcons/materialicons-v126.ttf MaterialIcons/materialicons.json
qx export-glyphs MaterialIcons/materialiconsoutlined-v101.otf MaterialIcons/materialiconsoutlined.json
qx export-glyphs MaterialIcons/materialiconsround-v100.otf MaterialIcons/materialiconsround.json
qx export-glyphs MaterialIcons/materialiconssharp-v101.otf MaterialIcons/materialiconssharp.json
qx export-glyphs MaterialIcons/materialiconstwotone-v104.otf MaterialIcons/materialiconstwotone.json