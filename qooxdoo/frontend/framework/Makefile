###################################################################################
# VARIABLES
###################################################################################

GENERATE=./tool/generate/generate.py
CACHE=../.cache



###################################################################################
# DEFAULT TARGET
###################################################################################

all: build



###################################################################################
# COMMON TARGETS
###################################################################################

source: generate-source
build: generate-build



###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	rm -f build/script/qx.js source/script/qx.js

realclean: clean
	rm -rf build source/script

distclean: realclean
	rm -f tool/generate/*.pyc
	find . -name "*~" -o -name "*.bak" -o -name "*.old" | xargs rm -rf



###################################################################################
# GENERATE TARGETS
###################################################################################

generate-all:
	@$(GENERATE) \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resource \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --source-script-path ../class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --cache-directory $(CACHE)

generate-compile:
	@$(GENERATE) \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --cache-directory $(CACHE)

generate-resource:
	@$(GENERATE) \
	  --script-input source/class \
	  --copy-resource \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --cache-directory $(CACHE)

generate-build:
	@$(GENERATE) \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resource \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --cache-directory $(CACHE)

generate-source:
	@$(GENERATE) \
	  --script-input source/class \
	  --source-script-path ../class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --cache-directory $(CACHE)
