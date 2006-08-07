###################################################################################
# VARIABLES
###################################################################################

FRAMEWORK=../framework
GENERATE=../framework/tool/generate/generate.py
CACHE=../.cache



###################################################################################
# DEFAULT TARGET
###################################################################################

all: build



###################################################################################
# COMMON TARGETS
###################################################################################

source: generate-script-source generate-data-source

build: generate-script-build generate-data-build
	cp -f source/index.html build/index.html



###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	rm -f source/script/api.js source/script/data.js
	rm -f build/script/api.js build/script/data.js

realclean: clean
	rm -rf build source/script

distclean: realclean
	find . -name "*~" -o -name "*.bak" -o -name "*.old" | xargs rm -rf



###################################################################################
# GENERATE TARGETS
###################################################################################

generate-script-source:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --source-script-path ../$(FRAMEWORK)/source/class \
	  --script-input source/class \
	  --source-script-path class \
	  --include api \
	  --include qx.theme.color.WindowsRoyaleColorTheme \
	  --include qx.theme.icon.CrystalSvgIconTheme \
	  --include qx.theme.widget.WindowsWidgetTheme \
	  --generate-source-script \
	  --source-script-file source/script/api.js \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:../$(FRAMEWORK)/source/resource/icon/crystalsvg \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:../$(FRAMEWORK)/source/resource/widget/windows \
	  --define-runtime-setting qx.manager.object.ImageManager.staticUri:../$(FRAMEWORK)/source/resource/static \
	  --define-runtime-setting qx.client.History.helperFile:../$(FRAMEWORK)/source/resource/static/history/historyHelper.html \
	  --cache-directory $(CACHE)

generate-script-build:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --resource-input $(FRAMEWORK)/source/resource \
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
	  --define-runtime-setting qx.client.History.helperFile:resource/qooxdoo/static/history/historyHelper.html \
	  --copy-resource \
	  --cache-directory $(CACHE)

generate-data-source:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --generate-api-documentation \
	  --api-documentation-json-file source/script/data.js \
	  --cache-directory $(CACHE)

generate-data-build:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --generate-api-documentation \
	  --api-documentation-json-file build/script/data.js \
	  --cache-directory $(CACHE)
