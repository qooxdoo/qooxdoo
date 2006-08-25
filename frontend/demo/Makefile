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

source: generate-script-source update-layout-source
build: generate-script-build update-layout-build
sync: build sync-qooxdoo-org



###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -rf source/script

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



###################################################################################
# GENERATOR TARGETS
###################################################################################

generate-script-source:
	@chmod u+x $(GENERATOR) && nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)/source/class \
	  --source-script-path ../../../$(FRAMEWORK)/source/class \
	  --generate-source-script \
	  --source-script-file source/script/qx.js \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:../../../$(FRAMEWORK)/source/resource/icon/crystalsvg \
	  --define-runtime-setting qx.theme.icon.NuvolaIconTheme.imageUri:../../../$(FRAMEWORK)/source/resource/icon/nuvola \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:../../../$(FRAMEWORK)/source/resource/widget/windows \
	  --define-runtime-setting qx.manager.object.AliasManager.staticUri:../../../$(FRAMEWORK)/source/resource/static \
	  --cache-directory $(CACHE)

generate-script-build:
	@chmod u+x $(GENERATOR) && nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)/source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/qx.js \
	  --copy-resources \
	  --resource-input $(FRAMEWORK)/source/resource \
	  --resource-output build/resource \
	  --define-runtime-setting qx.theme.icon.CrystalSvgIconTheme.imageUri:../../resource/icon/crystalsvg \
	  --define-runtime-setting qx.theme.icon.NuvolaIconTheme.imageUri:../../resource/icon/nuvola \
	  --define-runtime-setting qx.theme.widget.WindowsWidgetTheme.imageUri:../../resource/widget/windows \
	  --define-runtime-setting qx.manager.object.AliasManager.staticUri:../../resource/static \
	  --cache-directory $(CACHE)



###################################################################################
# FILE RELATED TARGETS
###################################################################################

update-layout-source:
	@echo
	@echo "  CREATION OF DEMO LAYOUT (SOURCE)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Generating..."
	@chmod u+x tool/layout.sh && nice -n $(NICE) tool/layout.sh source/script/layout.js source/html SOURCE

update-demo-build:
	@echo
	@echo "  CREATE COPY OF HTML FILES"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Copying files..."
	@mkdir -p build
	@cp -f source/index.html build/
	@mkdir -p build/html
	@nice -n $(NICE) rsync --recursive --links --delete --exclude=.svn source/html/* build/html
	@mkdir -p build/resource/css
	@nice -n $(NICE) rsync --recursive --links --delete --exclude=.svn source/resource/css/* build/resource/css

update-layout-build: update-demo-build
	@echo
	@echo "  CREATION OF DEMO LAYOUT (BUILD)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Generating..."
	@chmod u+x tool/layout.sh && nice -n $(NICE) tool/layout.sh build/script/layout.js build/html BUILD





###################################################################################
# ONLINE TARGETS
###################################################################################

sync-qooxdoo-org:
	@echo
	@echo "  SYNC FILES TO HOMEPAGE"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Syncing..."
	@nice -n $(NICE) rsync --checksum --recursive --links --delete --verbose build/* root@qooxdoo.org:/var/www/qooxdoo/demo
