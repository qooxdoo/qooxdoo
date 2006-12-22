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

#
# Locales to build (space separated list)
#
APPLICATION_LOCALES =






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

SKELETON_BUILD_DIR=skeleton-dist

skeleton-dist:
	rm -rf $(SKELETON_BUILD_DIR)
	mkdir -p $(SKELETON_BUILD_DIR)/script
	cp custom.js.dist $(SKELETON_BUILD_DIR)/script/custom.js
	cp build/script/qx.js $(SKELETON_BUILD_DIR)/script
	rsync --recursive --links --safe-links --delete --compress dist/source $(SKELETON_BUILD_DIR)
	rsync --recursive --links --safe-links --delete --compress --exclude=translation source/class $(SKELETON_BUILD_DIR)
	rsync --recursive --links --safe-links --delete --compress build/resource $(SKELETON_BUILD_DIR)/resource
