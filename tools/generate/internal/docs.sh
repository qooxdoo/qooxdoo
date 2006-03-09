#!/usr/bin/env bash

cd `dirname $0`/../../..

echo ">>> Creating documentation..."

mkdir -p build/docs
rsync -av --exclude=CVS tools/generate/documentation/* build/docs/

mkdir -p build/script
mkdir -p tools/generate/internal/cache/script

python tools/generate/internal/compile.py --sourcepath source/script --buildpath build/script --cachepath "tools/generate/internal/cache/script" --docpath build/docs --prefix docs --job doc

mkdir -p build/themes
mkdir -p tools/generate/internal/cache/themes

python tools/generate/internal/compile.py --sourcepath source/themes --buildpath build/themes --cachepath "tools/generate/internal/cache/themes" --docpath build/docs --prefix docs --job compress

echo ">>> Done"
