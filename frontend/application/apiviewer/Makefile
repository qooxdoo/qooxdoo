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
PROJECT_NAMESPACE = apiviewer

#
# Titles used in your API viewer and during the build process
#
PROJECT_MAKE_TITLE = APIVIEWER
PROJECT_API_TITLE = ApiViewer

#
# Additional files (space separated list)
#
PROJECT_FILES = index.html

#
# Locales to build (space separated list)
#
PROJECT_LOCALES =





####################################################################################
# ADVANCED SETTINGS
####################################################################################

#
# Enable resource filtering in API viewer
#
PROJECT_RESOURCE_FILTER = true

#
# We don't need the full source code
#
PROJECT_COMPLETE_SOURCE = false

#
# Disable line breaks
#
PROJECT_LINEBREAKS_BUILD = false
PROJECT_LINEBREAKS_SOURCE = false

#
# qooxdoo.org sync
#
PROJECT_PUBLISH_PATH = root@qooxdoo.org:/var/www/qooxdoo/api




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

source:	
	$(CMD_GENERATOR) \
	  --generate-api-documentation \
	  --api-documentation-json-file $(PROJECT_PATH)/source/script/apidata.js \
	  --script-input $(FRAMEWORK_SOURCE_PATH)/class
	  
build:	
	$(CMD_GENERATOR) \
	  --generate-api-documentation \
	  --api-documentation-json-file $(PROJECT_PATH)/build/script/apidata.js \
	  --script-input $(FRAMEWORK_SOURCE_PATH)/class
	
#
# Include implementation targets
#
include $(QOOXDOO_PATH)/frontend/framework/tool/make/impl.mk
