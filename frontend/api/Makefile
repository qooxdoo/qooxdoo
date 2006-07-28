all: source build

generate-source:
	@../tools/generate/generate.py \
	  --script-input ../source/script \
	  --source-script-path ../../source/script \
	  --script-input source/script \
	  --source-script-path script \
	  --include api \
	  --include qx.theme.color.WindowsRoyaleColorTheme \
	  --include qx.theme.icon.CrystalSvgIconTheme \
	  --include qx.theme.widget.WindowsWidgetTheme \
	  --generate-source-script \
	  --source-script-file source/dist/api.js \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:../../source/resources/icon/crystalsvg \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:../../source/resources/widget/windows \
	  --define-runtime-setting qx.manager.object.ImageManager.staticUri:../../source/resources/static \
	  --cache-directory ../.cache

generate-build:
	@../tools/generate/generate.py \
	  --script-input ../source/script \
	  --resource-input ../source/resources \
	  --resource-output build/resources/qooxdoo \
	  --script-input source/script \
	  --resource-input source/resources \
	  --resource-output build/resources \
	  --include api \
	  --include qx.theme.color.WindowsRoyaleColorTheme \
	  --include qx.theme.icon.CrystalSvgIconTheme \
	  --include qx.theme.widget.WindowsWidgetTheme \
	  --generate-compiled-script \
	  --compiled-script-file build/dist/api.js \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:resources/qooxdoo/icon/crystalsvg \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:resources/qooxdoo/widget/windows \
	  --define-runtime-setting qx.manager.object.ImageManager.staticUri:resources/qooxdoo/static \
	  --copy-resources \
	  --cache-directory ../.cache

source: generate-source

build: generate-build
	@cp -f source/index.html build/index.html

clean:
	rm -f source/dist/api.js
	rm -f build/dist/api.js

realclean: clean
	rm -rf build
