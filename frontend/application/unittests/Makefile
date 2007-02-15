####################################################################################
# BASIC SETTINGS
####################################################################################

#
# Location of your qooxdoo distribution
# Could be relative from this location or absolute
#
QOOXDOO_PATH = ../../../

#
# The same as above, but from the webserver point of view
# Starting point is the application HTML file of the source folder.
# In most cases just add a "/.." compared to above
#
QOOXDOO_URI = ../../../../../

#
# Namespace of your application e.g. custom
#
APPLICATION_NAMESPACE = qxunit

#
# Titles used in your API viewer and during the build process
#
APPLICATION_MAKE_TITLE = QXUNIT
APPLICATION_API_TITLE = qxUnit

#
# Additional files (space separated list)
#
APPLICATION_FILES = index.html html

APPLICATION_LOCALES = C de de_DE



####################################################################################
# ADVANCED SETTINGS
####################################################################################

#
# Disable line breaks
#
APPLICATION_LINEBREAKS_BUILD = true
APPLICATION_LINEBREAKS_SOURCE = true

#
# Build/Integrate all features
#
APPLICATION_COMPLETE_BUILD = false
APPLICATION_COMPLETE_SOURCE = false
APPLICATION_ENABLE_GUI = false

APPLICATION_HTML_TO_ROOT_URI=..

APPLICATION_OPTIMIZE_STRINGS = false
APPLICATION_OPTIMIZE_VARIABLES = false
APPLICATION_OPTIMIZE_BROWSER = false

APPLICATION_SOURCE_FLAGS = \

APPLICATION_ADDITIONAL_SOURCE_OPTIONS = \
  --include qxunit.* 

APPLICATION_ADDITIONAL_BUILD_OPTIONS = $(APPLICATION_ADDITIONAL_SOURCE_OPTIONS)


ANT = /Users/fabianpb/Desktop/JAVA/apache-ant-1.7.0/bin/ant

####################################################################################
# INCLUDE CORE
####################################################################################

ifneq ($(QOOXDOO_PATH),PLEASE_DEFINE_QOOXDOO_PATH)
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/targets.mk
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/application.mk
endif

error:
	@echo "  * Please configure QOOXDOO_PATH"

test: source
	cd jsunit && $(ANT) standalone_test
	cd ..
