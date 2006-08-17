###################################################################################
# VARIABLES
###################################################################################

GENERATOR=./tool/generator/generator.py
CACHE=../.cache
NICE=10


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
	nice -n $(NICE) rm -rf build source/script

distclean: realclean
	find tool -name "*.pyc" | xargs rm -f
	find . -name "*~" -o -name "*.bak" -o -name "*.old" | xargs rm -rf



###################################################################################
# GENERATOR TARGETS
###################################################################################

generate-all:
	@nice -n $(NICE) $(GENERATOR) \
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
	@nice -n $(NICE) $(GENERATOR) \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --cache-directory $(CACHE)

generate-resource:
	@nice -n $(NICE) $(GENERATOR) \
	  --script-input source/class \
	  --copy-resources \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --cache-directory $(CACHE)

generate-build:
	@nice -n $(NICE) $(GENERATOR) \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resources \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --cache-directory $(CACHE)

generate-source:
	@nice -n $(NICE) $(GENERATOR) \
	  --script-input source/class \
	  --source-script-path ../class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --cache-directory $(CACHE)
