all: source build

generate-source:
	@../tools/generate/generate.py \
	  --script-input ../source/class \
	  --source-script-path ../../source/class \
	  --script-input source/class \
	  --source-script-path class \
	  --include api \
	  --include qx.theme.color.WindowsRoyaleColorTheme \
	  --include qx.theme.icon.CrystalSvgIconTheme \
	  --include qx.theme.widget.WindowsWidgetTheme \
	  --generate-source-script \
	  --source-script-file source/script/api.js \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:../../source/resource/icon/crystalsvg \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:../../source/resource/widget/windows \
	  --define-runtime-setting qx.manager.object.ImageManager.staticUri:../../source/resource/static \
	  --cache-directory ../.cache

generate-build:
	@../tools/generate/generate.py \
	  --script-input ../source/class \
	  --resource-input ../source/resource \
	  --resource-output build/resource/qooxdoo \
	  --script-input source/class \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --include api \
	  --include qx.theme.color.WindowsRoyaleColorTheme \
	  --include qx.theme.icon.CrystalSvgIconTheme \
	  --include qx.theme.widget.WindowsWidgetTheme \
	  --generate-compiled-script \
	  --compiled-script-file build/script/api.js \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:resource/qooxdoo/icon/crystalsvg \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:resource/qooxdoo/widget/windows \
	  --define-runtime-setting qx.manager.object.ImageManager.staticUri:resource/qooxdoo/static \
	  --copy-resource \
	  --cache-directory ../.cache

source: generate-source

build: generate-build
	cp -f source/index.html build/index.html

clean:
	rm -f source/script/api.js
	rm -f build/script/api.js

realclean: clean
	rm -rf build
