SVN = ".svn"

all: buildresources builddemos compile

clean:
	rm  -f source/demo/demoinclude.js source/demo/demolayout.js
	rm -rf tools/generate/internal/cache
	rm -rf build/demo build/script build/themes

realclean: clean
	rm -rf public build release

docs:
	tools/generate-dev/docgenerator.py

buildsource:
	@echo TODO: Remove dependency to shell script if possible
	tools/generate/make-source.sh

buildresources:
	mkdir -p build/images build/themes
	rsync -rl --exclude=$(SVN) --exclude=*.js source/images build/
	rsync -rl --exclude=$(SVN) --exclude=*.js source/themes build/

builddemos:
  @echo TODO: Remove dependency to shell script if possible
	tools/generate/internal/patchdemos.sh

compile:
	tools/generate-dev/build.py --compile-source -s source/script -s source/themes --compile-directory build/script

online:
  @echo TODO: Sync Demos online

release: source-release build-release

source-release:
  @echo TODO: Generate source release

build-release:
  @echo TODO: Generate build release
