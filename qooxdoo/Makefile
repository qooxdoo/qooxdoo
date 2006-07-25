SVN = ".svn"

all: builddemos buildsource compile

clean:
	@rm  -f source/demo/demoinclude.js source/demo/demolayout.js
	@rm -rf build/demo build/script build/themes

realclean: clean
	@rm -rf public build release

apidocs:
	tools/generate-dev/build.py -s source/script/ --generate-api --api-output-directory api --generate-json-api

  # Test
  # tools/generate-dev/build.py -s source/script/ -s docs/script/ -i qx.apiviewer.ApiViewer --compile-output-directory docs/ --api-output-directory docs/ -a -c

buildsource:
	@tools/generate-dev/build.py -s source/script/ --generate-source --script-source-uri ../../script/ --source-output-directory source/demo
	@tools/generate-dev/make-demolayout.sh

builddemos:
	@tools/generate-dev/make-htmlbuild.sh
	@tools/generate-dev/make-demolayout.sh
	cp source/demo/demolayout.js build/demo

compile:
	tools/generate-dev/build.py \
	  --source-directory source/script \
	  --compile-source \
	  --compile-output-directory build/demo \
	  --copy-resources \
	  --resource-target qx.theme.icon.NuvolaIconTheme.images:build/resources/icon/nuvola \
	  --resource-target qx.theme.icon.CrystalSvgIconTheme.images:build/resources/icon/crystalsvg \
	  --resource-target qx.theme.widget.WindowsWidgetTheme.images:build/resources/widget/windows

online:


release: source-release build-release


source-release:


build-release:


