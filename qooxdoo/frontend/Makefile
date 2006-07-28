###################################################################################
# DEFAULT TARGET
###################################################################################

all: update-buildlayout update-sourcelayout generate-all




###################################################################################
# BUILD SCRIPT CALLS
###################################################################################

generate-all:
	@tools/generate/generate.py \
	  --script-input source/script \
	  --generate-compiled-script \
	  --compiled-script-file build/demo/qx.js \
	  --copy-resources \
	  --resource-input source/resources \
	  --resource-output build/resources \
	  --source-script-path ../../script \
	  --generate-source-script \
	  --source-script-file source/demo/qx.js

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
	$(MAKE) -C api all
	@tools/generate/generate.py \
	  --script-input source/script \
	  --generate-api-documentation \
	  --api-documentation-json-file api/build/jsondata.js




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
docs: generate-api





###################################################################################
# CLEANUP
###################################################################################

clean:
	rm  -f source/demo/qx.js source/demo/demolayout.js source/demo/apiviewer/api.js
	rm -rf build/demo build/script build/themes
	$(MAKE) -C api clean

realclean: clean
	rm -rf public build release
	$(MAKE) -C api realclean
