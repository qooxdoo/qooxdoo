###################################################################################
# VARIABLES
###################################################################################

GENERATOR=./tool/generate/generator.py
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
# GENERATOR TARGETS
###################################################################################

generate-all:
	@$(GENERATOR) \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resources \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --source-script-path ../class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --cache-directory $(CACHE)

generate-compile:
	@$(GENERATOR) \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --cache-directory $(CACHE)

generate-resource:
	@$(GENERATOR) \
	  --script-input source/class \
	  --copy-resources \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --cache-directory $(CACHE)

generate-build:
	@$(GENERATOR) \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resources \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --cache-directory $(CACHE)

generate-source:
	@$(GENERATOR) \
	  --script-input source/class \
	  --source-script-path ../class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --cache-directory $(CACHE)
