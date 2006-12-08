###################################################################################
# PUBLIC VARIABLES
###################################################################################

QOOXDOO = ../../..
SCRIPTNAME = samples.js
APPCLASS = 
OPTIMIZESTRINGS = true
OPTIMIZEVARIABLES = true
NICE=10





###################################################################################
# PRIVATE VARIABLES
###################################################################################

FRONTEND = $(QOOXDOO)/frontend
FRAMEWORK = $(FRONTEND)/framework
API = $(FRONTEND)/api
CACHE = $(FRAMEWORK)/.cache
GENERATOR = $(FRAMEWORK)/tool/generator.py
SYNCOPT=--checksum --recursive --links --safe-links --delete --compress

ifeq ($(OPTIMIZESTRINGS),true)
  OPTIMIZESTR = --optimize-strings
else
  OPTIMIZESTR =
endif

ifeq ($(OPTIMIZEVARIABLES),true)
  OPTIMIZEVAR = --optimize-variables
else
  OPTIMIZEVAR =
endif







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
	@nice -n $(NICE) rm -rf source/script build

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
	  --source-script-path ../../../$(FRAMEWORK)/source/class \
	  --generate-source-script \
	  --source-script-file source/script/$(SCRIPTNAME) \
	  --add-new-lines \
	  --define-runtime-setting qx.manager.object.AliasManager.resourceUri:../../../$(FRAMEWORK)/source/resource \
	  --cache-directory $(CACHE)

generate-script-build:
	@chmod u+x $(GENERATOR) && nice -n $(NICE) $(GENERATOR) \
	  --script-input $(FRAMEWORK)/source/class \
	  --generate-compiled-script \
	  --compiled-script-file build/script/$(SCRIPTNAME) \
	  --optimize-strings \
	  --optimize-variables \
	  --copy-resources \
	  --resource-input $(FRAMEWORK)/source/resource \
	  --resource-output build/resource \
	  --define-runtime-setting qx.manager.object.AliasManager.resourceUri:../../resource \
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
	@nice -n $(NICE) rsync $(SYNCOPT) build/* root@qooxdoo.org:/var/www/qooxdoo/demo/samples
