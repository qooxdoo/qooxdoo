###################################################################################
# VARIABLES
###################################################################################

FRAMEWORK=../framework
GENERATE=../framework/tool/generate/generate.py
CACHE=../.cache



###################################################################################
# DEFAULT TARGET
###################################################################################

all: source build



###################################################################################
# COMMON TARGETS
###################################################################################

source: generate-source update-sourcelayout
build: generate-build update-buildlayout



###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	rm -f source/script/qx.js source/script/layout.js build/script/layout.js

realclean: clean
	rm -rf build



###################################################################################
# GENERATE TARGETS
###################################################################################

generate-build:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resource \
	  --resource-input $(FRAMEWORK)/source/resource \
	  --resource-output build/resource \
	  --cache-directory $(CACHE) \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:../../resource/icon/crystalsvg \
	  --define-runtime-setting qx.theme.icon.NuvolaIconTheme.imageUri:../../resource/icon/nuvola \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:../../resource/widget/windows \
	  --define-runtime-setting qx.manager.object.ImageManager.staticUri:../../resource/static

generate-source:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --source-script-path ../../../$(FRAMEWORK)/source/class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --cache-directory $(CACHE) \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:../../../$(FRAMEWORK)/source/resource/icon/crystalsvg \
	  --define-runtime-setting qx.theme.icon.NuvolaIconTheme.imageUri:../../../$(FRAMEWORK)/source/resource/icon/nuvola \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:../../../$(FRAMEWORK)/source/resource/widget/windows \
	  --define-runtime-setting qx.manager.object.ImageManager.staticUri:../../../$(FRAMEWORK)/source/resource/static



###################################################################################
# FILE RELATED TARGETS
###################################################################################

update-sourcelayout:
	tool/layout.sh source/script/layout.js source/html SOURCE

update-builddemo:
	mkdir -p build/html
	rsync --recursive --links --delete --exclude=.svn source/html/* build/html
	mkdir -p build/resource/css
	rsync --recursive --links --delete --exclude=.svn source/resource/css/* build/resource/css

update-buildlayout: update-builddemo
	tool/layout.sh build/script/layout.js build/html BUILD
