SVN = ".svn"

all: buildresources builddemos compile buildsource

clean:
	@rm  -f source/demo/demoinclude.js source/demo/demolayout.js
	@rm -rf build/demo build/script build/themes

realclean: clean
	@rm -rf public build release

apidocs:
	tools/generate-dev/build.py -s source/script/ --generate-api --api-output-directory api --generate-json-api

buildsource:
	@tools/generate-dev/build.py -s source/script/ --generate-source --relative-source-path ../../script/ --source-output-directory source/demo
	@tools/generate-dev/make-demolayout.sh

buildresources:
	@tools/generate-dev/make-resourcebuild.sh

builddemos:
	@tools/generate-dev/make-htmlbuild.sh

compile:
	tools/generate-dev/build.py -s source/script --compile-source --compile-output-directory build/script

online:


release: source-release build-release


source-release:


build-release:

