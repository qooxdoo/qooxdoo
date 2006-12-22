####################################################################################
# BASIC SETTINGS
####################################################################################

#
# Location of your qooxdoo distribution
# Could be relative from this location or absolute
#
QOOXDOO_PATH = ../../..

#
# The same as above, but from the webserver point of view
# Starting point is the application HTML file of the source folder.
# In most cases just add a "/.." compared to above
#
QOOXDOO_URI = ../../../..

#
# Namespace of your application e.g. custom
#
APPLICATION_NAMESPACE = custom

#
# Titles used in your API viewer and during the build process
#
APPLICATION_MAKE_TITLE = CUSTOM
APPLICATION_API_TITLE = Custom

APPLICATION_SCRIPT_FILENAME = qx.js
APPLICATION_NORESOURCES = true

#
# Locales to build (space separated list)
#
APPLICATION_LOCALES = de de_DE en en_US fr fr_FR es es_ES






####################################################################################
# ADVANCED SETTINGS
####################################################################################

#
# Please take a look at $(QOOXDOO_PATH)/frontend/framework/tool/make/project.mk
# for more options
#







####################################################################################
# INCLUDE CORE
####################################################################################

ifneq ($(QOOXDOO_PATH),PLEASE_DEFINE_QOOXDOO_PATH)
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/targets.mk
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/project.mk
endif

error:
	@echo "  * Please configure QOOXDOO_PATH"
	
	
	
	
####################################################################################
# BUILD TARGETS
####################################################################################

SKELETON_BUILD_DIR=skeleton-build
SKELETON_SDK_DIR=skeleton-sdk

skeleton-release-build:
	if [ ! -r build ]; then \
	  echo "      - Missing build folder! Run $(MAKE) build first!"; \
	  exit 1; \
	fi;
	rm -rf $(SKELETON_BUILD_DIR)
	mkdir -p $(SKELETON_BUILD_DIR)/script
	cp custom.js.dist $(SKELETON_BUILD_DIR)/script/custom.js
	cp build/script/qx.js $(SKELETON_BUILD_DIR)/script
	rsync --recursive --links --safe-links dist/source/ $(SKELETON_BUILD_DIR)
	rsync --recursive --links --safe-links build/resource/qx $(SKELETON_BUILD_DIR)/resource
	
skeleton-release-sdk:
	rm -rf $(SKELETON_SDK_DIR)
	mkdir -p $(SKELETON_SDK_DIR)
	rsync --recursive --links --safe-links dist/ $(SKELETON_SDK_DIR)
	
clean:
	rm -rf $(SKELETON_BUILD_DIR)
	rm -rf $(SKELETON_SDK_DIR)
