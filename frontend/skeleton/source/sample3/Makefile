###################################################################################
# PUBLIC VARIABLES
###################################################################################

QOOXDOO = PATH_TO_QOOXDOO
SCRIPTNAME = custom.js
APPCLASS = custom.Application3
INCLUDEALL = false
NICE=10


###################################################################################
# PRIVATE VARIABLES
###################################################################################

FRAMEWORK = $(QOOXDOO)/frontend/framework
API = $(QOOXDOO)/frontend/api
CACHE = $(QOOXDOO)/frontend/.cache
GENERATOR = $(FRAMEWORK)/tool/generator/generator.py


ifeq ($(INCLUDEALL),false)
  INCLUDE = --include $(APPCLASS)
else
  INCLUDE =
endif




###################################################################################
# DEFAULT TARGET
###################################################################################

all: build



###################################################################################
# COMMON TARGETS
###################################################################################

source: info-source generate-script-source
build: info-build generate-script-build copy-build-files

api: generate-api-build generate-api-data
	@echo
	@echo "  CREATE COPY OF HTML FILE"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Copying file..."
	@cp -f $(API)/source/index.html api/index.html



###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -f source/script/custom.js build/script/custom.js

realclean: clean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (REAL)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@nice -n $(NICE) rm -rf build

distclean: realclean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (DIST)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@nice -n $(NICE) find . -name "*~" -o -name "*.bak" -o -name "*.old" | xargs rm -rf
	@nice -n $(NICE) rm -rf $(CACHE)



###################################################################################
# GENERATOR TARGETS
###################################################################################

generate-script-source:
	@chmod u+x $(GENERATOR) && nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)/source/class \
	  --source-script-path ../$(FRAMEWORK)/source/class \
	  --script-input source/class \
	  --source-script-path class \
	  --generate-source-script \
	  $(INCLUDE) \
	  --source-script-file source/script/custom.js \
	  --define-runtime-setting qx.core.Init.component:qx.component.init.BasicInitComponent \
	  --cache-directory $(CACHE)

generate-script-build:
	@chmod u+x $(GENERATOR) && nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)/source/class \
	  --script-input source/class \
	  --generate-compiled-script \
	  $(INCLUDE) \
	  --compiled-script-file build/script/$(SCRIPTNAME) \
	  --define-runtime-setting qx.core.Init.component:qx.component.init.BasicInitComponent \
	  --cache-directory $(CACHE)

generate-api-build:
	@chmod u+x $(GENERATOR) && nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)/source/class \
	  --resource-input $(FRAMEWORK)/source/resource \
	  --resource-output api/resource/qooxdoo \
	  --script-input $(API)/source/class \
	  --resource-input $(API)/source/resource \
	  --resource-output api/resource \
	  --include api \
	  --generate-compiled-script \
	  --compiled-script-file api/script/api.js \
	  --define-runtime-setting qx.manager.object.AliasManager.resourceUri:resource/qooxdoo \
	  --define-runtime-setting api.Viewer.title:Sample \
	  --copy-resources \
	  --cache-directory $(CACHE)

generate-api-data:
	@chmod u+x $(GENERATOR) && nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)/source/class \
	  --script-input source/class \
	  --generate-api-documentation \
	  --api-documentation-json-file api/script/data.js \
	  --cache-directory $(CACHE)



###################################################################################
# ADDITIONAL TARGETS
###################################################################################

copy-build-files:
	@echo
	@echo "  CREATE COPY OF FILES"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Copying files..."
	@cp -f source/index.html build/index.html
	@cp -f source/test.xml build/test.xml





###################################################################################
# INFO TARGETS
###################################################################################

info-build:
	@echo "****************************************************************************"
	@echo "  GENERATING SAMPLE 3 BUILD"
	@echo "****************************************************************************"

info-source:
	@echo "****************************************************************************"
	@echo "  GENERATING SAMPLE 3 SOURCE"
	@echo "****************************************************************************"
