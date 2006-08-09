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

source: generate-script-source update-layout-source
build: generate-script-build update-layout-build



###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	rm -f source/script/qx.js source/script/layout.js build/script/layout.js

realclean: clean
	rm -rf build

distclean: realclean
	find . -name "*~" -o -name "*.bak" -o -name "*.old" | xargs rm -rf



###################################################################################
# GENERATE TARGETS
###################################################################################

generate-script-source:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --source-script-path ../../../$(FRAMEWORK)/source/class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:../../../$(FRAMEWORK)/source/resource/icon/crystalsvg \
	  --define-runtime-setting qx.theme.icon.NuvolaIconTheme.imageUri:../../../$(FRAMEWORK)/source/resource/icon/nuvola \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:../../../$(FRAMEWORK)/source/resource/widget/windows \
	  --define-runtime-setting qx.manager.object.ImageManager.staticUri:../../../$(FRAMEWORK)/source/resource/static \
	  --cache-directory $(CACHE)

generate-script-build:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resources \
	  --resource-input $(FRAMEWORK)/source/resource \
	  --resource-output build/resource \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:../../resource/icon/crystalsvg \
	  --define-runtime-setting qx.theme.icon.NuvolaIconTheme.imageUri:../../resource/icon/nuvola \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:../../resource/widget/windows \
	  --define-runtime-setting qx.manager.object.ImageManager.staticUri:../../resource/static \
	  --cache-directory $(CACHE)



###################################################################################
# FILE RELATED TARGETS
###################################################################################

update-layout-source:
	tool/layout.sh source/script/layout.js source/html SOURCE

update-demo-build:
	mkdir -p build
	cp -f source/index.html build/
	mkdir -p build/html
	rsync --recursive --links --delete --exclude=.svn source/html/* build/html
	mkdir -p build/resource/css
	rsync --recursive --links --delete --exclude=.svn source/resource/css/* build/resource/css

update-layout-build: update-demo-build
	tool/layout.sh build/script/layout.js build/html BUILD
