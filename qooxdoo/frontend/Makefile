###################################################################################
# DEFAULT TARGET
###################################################################################

all: update-buildlayout update-sourcelayout generate-all




###################################################################################
# BUILD SCRIPT CALLS
###################################################################################

generate-all:
	@tools/generate/generate.py \
	  --source-directory source/script \
	  --source-web-path ../../script \
	  --compile-source \
	  --compile-output-directory build/demo \
	  --copy-resources \
	  --resource-target qx.theme.icon.NuvolaIconTheme.images:build/resources/icon/nuvola \
	  --resource-target qx.theme.icon.CrystalSvgIconTheme.images:build/resources/icon/crystalsvg \
	  --resource-target qx.theme.widget.WindowsWidgetTheme.images:build/resources/widget/windows \
	  --resource-target qx.ui.basic.Image.core:build/resources/static/coreimages \
	  --generate-source \
	  --source-output-directory source/demo

generate-compile:
	@tools/generate/generate.py \
	  --script-input source/script \
	  --generate-compiled-script \
	  --compiled-script-file build/demo/qx.js

generate-resources:
	@tools/generate/generate.py \
	  --script-input source/script \
	  --copy-resources \
	  --resource-input source/resources \
	  --resource-output build/resources

generate-build:
	@tools/generate/generate.py \
	  --script-input source/script \
	  --generate-compiled-script \
	  --compiled-script-file build/demo/qx.js \
	  --copy-resources \
	  --resource-input source/resources \
	  --resource-output build/resources

generate-source:
	@tools/generate/generate.py \
	  --script-input source/script \
	  --source-script-path ../../script \
	  --generate-source-script \
	  --source-script-file source/demo/qx.js

generate-api:
	@tools/generate/generate.py \
	  --source-directory source/script \
	  --generate-api \
	  --api-output-directory source/demo/apiviewer \
	  --generate-json-api

  # Test
  #  @tools/generate/generate.py \
  #  --source-directory source/script \
  #  --source-directory docs/script \
  #  --include qx.apiviewer.ApiViewer \
  #  --compile-source \
  #  --compile-output-directory docs \
  #  --generate-api \
  #  --api-output-directory docs \
  #  --generate-json-api





###################################################################################
# FILE HANDLING
###################################################################################

update-sourcelayout:
	@tools/generate/make-demolayout.sh source/demo/demolayout.js source/demo SOURCE

update-builddemo:
	@tools/generate/make-demobuild.sh

update-buildlayout: update-builddemo
	@tools/generate/make-demolayout.sh build/demo/demolayout.js build/demo BUILD






###################################################################################
# GENERAL JOBS
###################################################################################

source: generate-source update-sourcelayout
build: generate-build update-buildlayout






###################################################################################
# CLEANUP
###################################################################################

clean:
	rm  -f source/demo/demoinclude.js source/demo/demolayout.js
	rm -rf build/demo build/script build/themes

realclean: clean
	rm -rf public build release
