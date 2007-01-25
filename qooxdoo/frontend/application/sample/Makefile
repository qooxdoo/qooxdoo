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
QOOXDOO_URI = ../../../../../..

#
# Namespace of your application e.g. custom
#
APPLICATION_NAMESPACE = sample

#
# Titles used in your API viewer and during the build process
#
APPLICATION_MAKE_TITLE = SAMPLE
APPLICATION_API_TITLE = Sample

#
# Additional files (space separated list)
#
APPLICATION_FILES = index.html html css



####################################################################################
# ADVANCED SETTINGS
####################################################################################

#
# Disable line breaks
#
APPLICATION_LINEBREAKS_BUILD = false
APPLICATION_LINEBREAKS_SOURCE = false

#
# qooxdoo.org sync
#
APPLICATION_PUBLISH_PATH = root@qooxdoo.org:/var/www/qooxdoo/demo/$(FRAMEWORK_VERSION)/$(APPLICATION_NAMESPACE)

#
# Build/Integrate all features
#
APPLICATION_COMPLETE_BUILD = true

#
# Relation from HTML file to the top level directory (source or build).
#
APPLICATION_PAGE_TO_TOPLEVEL = ../..






####################################################################################
# INCLUDE CORE
####################################################################################

ifneq ($(QOOXDOO_PATH),PLEASE_DEFINE_QOOXDOO_PATH)
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/targets.mk
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/application.mk
endif

error:
	@echo "  * Please configure QOOXDOO_PATH"





####################################################################################
# EXTENSIONS
####################################################################################

layout-source:
	@echo
	@echo "  GENERATION OF SAMPLE LAYOUT"
	@$(CMD_LINE)
	@echo "  * Generating source/script/layout.js..."
	@python tool/layout.py source/script/layout.js source/html

layout-build:
	@echo
	@echo "  GENERATION OF SAMPLE LAYOUT"
	@$(CMD_LINE)
	@echo "  * Generating build/script/layout.js..."
	@python tool/layout.py build/script/layout.js build/html

build: layout-build
source: layout-source
