###################################################################################
# DEFAULT TARGET
###################################################################################

all: generate-all



###################################################################################
# COMMON JOBS
###################################################################################

source: generate-source
build: generate-build



###################################################################################
# CLEANUP JOBS
###################################################################################

clean:
	rm -f build/script/qx.js source/script/qx.js

realclean: clean
	rm -rf build



###################################################################################
# GENERATE JOBS
###################################################################################

generate-all:
	@tool/generate/generate.py \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resource \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --source-script-path ../class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --cache-directory ../.cache

generate-compile:
	@tool/generate/generate.py \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --cache-directory ../.cache

generate-resource:
	@tool/generate/generate.py \
	  --script-input source/class \
	  --copy-resource \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --cache-directory ../.cache

generate-build:
	@tool/generate/generate.py \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resource \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --cache-directory ../.cache

generate-source:
	@tool/generate/generate.py \
	  --script-input source/class \
	  --source-script-path ../class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --cache-directory ../.cache
