###################################################################################
# VARIABLES
###################################################################################

FRAMEWORK=../framework
GENERATE=../framework/tool/generate/generate.py
CACHE=../.cache



###################################################################################
# DEFAULT TARGET
###################################################################################

all: generate-all update-sourcelayout update-buildlayout



###################################################################################
# COMMON TARGETS
###################################################################################

source: generate-source update-sourcelayout
build: generate-build update-buildlayout



###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	rm -f source/script/qx.js source/script/layout.js build/script/layout.js

realclean: clean
	rm -rf build



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
	  --source-script-path ../$(FRAMEWORK)/source/class \
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
	  --source-script-path ../$(FRAMEWORK)/source/class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --cache-directory $(CACHE)



###################################################################################
# FILE RELATED TARGETS
###################################################################################

update-sourcelayout:
	tool/layout.sh source/script/layout.js source/html SOURCE

update-builddemo:
	mkdir -p build/html
	rsync --recursive --links --delete --include=*.html --exclude=.svn source/html/* build/html

update-buildlayout: update-builddemo
	tool/layout.sh build/script/layout.js build/html BUILD
