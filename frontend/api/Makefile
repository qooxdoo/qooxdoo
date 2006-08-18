###################################################################################
# VARIABLES
###################################################################################

FRAMEWORK=../framework
GENERATOR=$(FRAMEWORK)/tool/generator/generator.py
CACHE=../.cache
NICE=10


###################################################################################
# DEFAULT TARGET
###################################################################################

all: build



###################################################################################
# COMMON TARGETS
###################################################################################

source: generate-script-source generate-data-source

build: generate-script-build generate-data-build
	@echo
	@echo "  CREATE COPY OF HTML FILE"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Copying file..."
	@cp -f source/index.html build/index.html

sync: build sync-qooxdoo-org



###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -f source/script/api.js source/script/data.js
	@rm -f build/script/api.js build/script/data.js

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
	@nice -n $(NICE) find . -name "*~" -o -name "*.bak" -o -name "*.old" | xargs rm -rf



###################################################################################
# GENERATOR TARGETS
###################################################################################

generate-script-source:
	@nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)/source/class \
	  --source-script-path ../$(FRAMEWORK)/source/class \
	  --script-input source/class \
	  --source-script-path class \
	  --include api \
	  --include qx.theme.color.WindowsRoyaleColorTheme \
	  --include qx.theme.icon.CrystalSvgIconTheme \
	  --include qx.theme.widget.WindowsWidgetTheme \
	  --generate-source-script \
	  --source-script-file source/script/api.js \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:../$(FRAMEWORK)/source/resource/icon/crystalsvg \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:../$(FRAMEWORK)/source/resource/widget/windows \
	  --define-runtime-setting qx.manager.object.AliasManager.staticUri:../$(FRAMEWORK)/source/resource/static \
	  --define-runtime-setting qx.client.History.helperFile:../$(FRAMEWORK)/source/resource/static/history/historyHelper.html \
	  --cache-directory $(CACHE)

generate-script-build:
	@nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)/source/class \
	  --resource-input $(FRAMEWORK)/source/resource \
	  --resource-output build/resource/qooxdoo \
	  --script-input source/class \
	  --resource-input source/resource \
	  --resource-output build/resource \
	  --include api \
	  --include qx.theme.color.WindowsRoyaleColorTheme \
	  --include qx.theme.icon.CrystalSvgIconTheme \
	  --include qx.theme.widget.WindowsWidgetTheme \
	  --generate-compiled-script \
	  --compiled-script-file build/script/api.js \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:resource/qooxdoo/icon/crystalsvg \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:resource/qooxdoo/widget/windows \
	  --define-runtime-setting qx.manager.object.AliasManager.staticUri:resource/qooxdoo/static \
	  --define-runtime-setting qx.client.History.helperFile:resource/qooxdoo/static/history/historyHelper.html \
	  --copy-resources \
	  --cache-directory $(CACHE)

generate-data-source:
	@nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)/source/class \
	  --generate-api-documentation \
	  --api-documentation-json-file source/script/data.js \
	  --cache-directory $(CACHE)

generate-data-build:
	@nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)/source/class \
	  --generate-api-documentation \
	  --api-documentation-json-file build/script/data.js \
	  --cache-directory $(CACHE)




###################################################################################
# ONLINE TARGETS
###################################################################################

sync-qooxdoo-org:
	@echo
	@echo "  SYNC FILES TO HOMEPAGE"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Syncing..."
	@nice -n $(NICE) rsync --checksum --recursive --links --delete --verbose build/* root@qooxdoo.org:/var/www/qooxdoo/api
