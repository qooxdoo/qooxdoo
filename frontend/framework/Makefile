###################################################################################
# VARIABLES
###################################################################################

FRAMEWORK=./
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
	@rm -fv build/script/qx.js $(FRAMEWORK)/source/script/qx.js

realclean: clean
	@rm -rfv build source/script

distclean: realclean
	@rm -fv tool/generate/*.pyc
	@find . -name "*~" -o -name "*.bak" -o -name "*.old" | xargs rm -rfv



###################################################################################
# GENERATE TARGETS
###################################################################################

generate-all:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resource \
	  --resource-input $(FRAMEWORK)/source/resource \
	  --resource-output build/resource \
	  --source-script-path ../class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --cache-directory $(CACHE)

generate-compile:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --cache-directory $(CACHE)

generate-resource:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --copy-resource \
	  --resource-input $(FRAMEWORK)/source/resource \
	  --resource-output build/resource \
	  --cache-directory $(CACHE)

generate-build:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resource \
	  --resource-input $(FRAMEWORK)/source/resource \
	  --resource-output build/resource \
	  --cache-directory $(CACHE)

generate-source:
	@$(GENERATE) \
	  --script-input $(FRAMEWORK)/source/class \
	  --source-script-path ../class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --cache-directory $(CACHE)
