#!/bin/bash

set -e
set -x

function getGlyphs() {
  local url=$1
  local filename=$2
  
  rm -f tmp.woff
  wget url -O tmp.woff
  qx export-glyphs tmp.woff filename
}


getGlyphs "https://github.com/marella/material-icons/raw/main/iconfont/material-icons.woff2" MaterialIcons/materialicons.json
exit

getGlyphs "https://github.com/marella/material-icons/raw/main/iconfont/material-icons-outlined.woff2" MaterialIcons/materialiconsoutlined.json
getGlyphs "https://github.com/marella/material-icons/raw/main/iconfont/material-icons-round.woff2" MaterialIcons/materialiconsround.json
getGlyphs "https://github.com/marella/material-icons/raw/main/iconfont/material-icons-sharp.woff2" MaterialIcons/materialiconssharp.json
getGlyphs "https://github.com/marella/material-icons/raw/main/iconfont/material-icons-two-tone.woff2" MaterialIcons/materialiconstwotone.json