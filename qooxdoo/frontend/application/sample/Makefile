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
PROJECT_NAMESPACE = sample

#
# Titles used in your API viewer and during the build process
#
PROJECT_MAKE_TITLE = SAMPLE
PROJECT_API_TITLE = Sample

#
# Additional files (space separated list)
#
PROJECT_FILES = html css





####################################################################################
# ADVANCED SETTINGS
####################################################################################

#
# Disable line breaks
#
PROJECT_LINEBREAKS_BUILD = false
PROJECT_LINEBREAKS_SOURCE = false

#
# qooxdoo.org sync
#
PROJECT_PUBLISH_PATH = root@qooxdoo.org:/var/www/qooxdoo/demo/$(PROJECT_NAMESPACE)

#
# Build/Integrate all features
#
PROJECT_COMPLETE_BUILD = true

#
# Relation from HTML file to the top level directory (source or build). 
#
PROJECT_PAGE_TO_TOPLEVEL = ../..






####################################################################################
# INCLUDE CORE
####################################################################################

#
# Include project core handling
#
include $(QOOXDOO_PATH)/frontend/framework/tool/make/project.mk

#
# Include default targets, but add data generation (only qooxdoo) to source and build
#
include $(QOOXDOO_PATH)/frontend/framework/tool/make/targets.mk
	
#
# Include implementation targets
#
include $(QOOXDOO_PATH)/frontend/framework/tool/make/impl.mk





####################################################################################
# EXTENSIONS
####################################################################################

layout-source:
	@echo
	@echo "  GENERATION OF SAMPLE LAYOUT"
	@$(CMD_LINE)
	@echo "  * Generating layout.js..."
	@tool/layout.sh build/script/layout.js source/html SOURCE
  
layout-build:
	@echo
	@echo "  GENERATION OF SAMPLE LAYOUT"
	@$(CMD_LINE)
	@echo "  * Generating layout.js..."
	@tool/layout.sh build/script/layout.js build/html BUILD
  
build: layout-build
source: layout-source
