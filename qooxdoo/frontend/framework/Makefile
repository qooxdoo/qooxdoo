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
	@echo
	@echo "  CLEANUP OF GENERATED FILES"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -f build/script/qx.js source/script/qx.js

realclean: clean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (REAL)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@nice -n $(NICE) rm -rf build source/script

distclean: realclean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (DIST)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@nice -n $(NICE) find tool -name "*.pyc" | xargs rm -f
	@nice -n $(NICE) find . -name "*~" -o -name "*.bak" -o -name "*.old" | xargs rm -rf



###################################################################################
# GENERATOR TARGETS
###################################################################################

generate-all:
	@chmod u+x $(GENERATOR) && nice -n $(NICE) $(GENERATOR) \
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
	@chmod u+x $(GENERATOR) && nice -n $(NICE) $(GENERATOR) \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --cache-directory $(CACHE)

generate-resource:
	@chmod u+x $(GENERATOR) && nice -n $(NICE) $(GENERATOR) \
	  --script-input source/class \
	  --copy-resources \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --cache-directory $(CACHE)

generate-build:
	@chmod u+x $(GENERATOR) && nice -n $(NICE) $(GENERATOR) \
	  --script-input source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resources \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --cache-directory $(CACHE)

generate-source:
	@chmod u+x $(GENERATOR) && nice -n $(NICE) $(GENERATOR) \
	  --script-input source/class \
	  --source-script-path ../class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --cache-directory $(CACHE)
