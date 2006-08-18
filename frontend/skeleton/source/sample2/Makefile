###################################################################################
# PUBLIC VARIABLES
###################################################################################

QOOXDOO = ../../../../
SCRIPTNAME = custom.js
APPCLASS = custom.Application
INCLUDEALL = false
NICE=10


###################################################################################
# PRIVATE VARIABLES
###################################################################################

FRAMEWORK = $(QOOXDOO)frontend/framework/
CACHE = $(QOOXDOO)frontend/.cache
GENERATOR = $(FRAMEWORK)tool/generator/generator.py


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
	@nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)/source/class \
	  --source-script-path ../$(FRAMEWORK)source/class \
	  --script-input source/class \
	  --source-script-path class \
	  --generate-source-script \
	  $(INCLUDE) \
	  --source-script-file source/script/custom.js \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:../$(FRAMEWORK)source/resource/icon/crystalsvg \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:../$(FRAMEWORK)source/resource/widget/windows \
	  --define-runtime-setting qx.manager.object.AliasManager.staticUri:../$(FRAMEWORK)source/resource/static \
	  --cache-directory $(CACHE)

generate-script-build:
	@nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)source/class \
	  --script-input source/class \
	  --generate-compiled-script \
	  $(INCLUDE) \
	  --compiled-script-file build/script/$(SCRIPTNAME) \
	  --copy-resources \
	  --resource-input $(FRAMEWORK)source/resource \
	  --resource-output build/resource \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:./resource/icon/crystalsvg \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:./resource/widget/windows \
	  --define-runtime-setting qx.manager.object.AliasManager.staticUri:./resource/static \
	  --cache-directory $(CACHE)




###################################################################################
# ADDITIONAL TARGETS
###################################################################################

copy-build-files:
	@echo
	@echo "  CREATE COPY OF HTML FILE"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Copying file..."
	@cp -f source/index.html build/index.html





###################################################################################
# INFO TARGETS
###################################################################################

info-build:
	@echo "****************************************************************************"
	@echo "  GENERATING SAMPLE 2 BUILD"
	@echo "****************************************************************************"

info-source:
	@echo "****************************************************************************"
	@echo "  GENERATING SAMPLE 2 SOURCE"
	@echo "****************************************************************************"
