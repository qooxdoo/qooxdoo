all:
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
	  --compiled-script-file build/script/api.js \
	  --copy-resources \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:resources/qooxdoo/icon/crystalsvg \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:resources/qooxdoo/widget/windows \
	  --define-runtime-setting qx.manager.object.ImageManager.staticUri:resources/qooxdoo/static

	@cp -f source/index.html build/index.html