###################################################################################
# DEFAULT TARGET
###################################################################################

all: update-buildlayout update-sourcelayout generate-all




###################################################################################
# BUILD SCRIPT CALLS
###################################################################################

generate-all:
	@tools/generate-dev/generate.py \
	  --source-directory source/script \
	  --compile-source \
	  --compile-output-directory build/demo \
	  --copy-resources \
	  --resource-target qx.theme.icon.NuvolaIconTheme.images:build/resources/icon/nuvola \
	  --resource-target qx.theme.icon.CrystalSvgIconTheme.images:build/resources/icon/crystalsvg \
	  --resource-target qx.theme.widget.WindowsWidgetTheme.images:build/resources/widget/windows \
	  --generate-source \
	  --script-source-uri ../../script/ \
	  --source-output-directory source/demo

generate-compile:
	@tools/generate-dev/generate.py \
	  --source-directory source/script \
	  --compile-source \
	  --compile-output-directory build/demo

generate-resources:
	@tools/generate-dev/generate.py \
	  --source-directory source/script \
	  --copy-resources \
	  --resource-target qx.theme.icon.NuvolaIconTheme.images:build/resources/icon/nuvola \
	  --resource-target qx.theme.icon.CrystalSvgIconTheme.images:build/resources/icon/crystalsvg \
	  --resource-target qx.theme.widget.WindowsWidgetTheme.images:build/resources/widget/windows

generate-build:
	@tools/generate-dev/generate.py \
	  --source-directory source/script \
	  --compile-source \
	  --compile-output-directory build/demo \
	  --copy-resources \
	  --resource-target qx.theme.icon.NuvolaIconTheme.images:build/resources/icon/nuvola \
	  --resource-target qx.theme.icon.CrystalSvgIconTheme.images:build/resources/icon/crystalsvg \
	  --resource-target qx.theme.widget.WindowsWidgetTheme.images:build/resources/widget/windows

generate-source:
	@tools/generate-dev/generate.py \
	  --source-directory source/script \
	  --generate-source \
	  --script-source-uri ../../script/ \
	  --source-output-directory source/demo

generate-api:
	@tools/generate-dev/generate.py \
	  --source-directory source/script \
	  --generate-api \
	  --api-output-directory source/demo/apiviewer \
	  --generate-json-api

  # Test
  #  @tools/generate-dev/generate.py \
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
	@tools/generate-dev/make-demolayout.sh source/demo/demolayout.js source/demo SOURCE

update-builddemo:
	@tools/generate-dev/make-demobuild.sh

update-buildlayout: update-builddemo
	@tools/generate-dev/make-demolayout.sh build/demo/demolayout.js build/demo BUILD






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
