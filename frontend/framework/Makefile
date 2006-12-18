####################################################################################
# BASIC SETTINGS
####################################################################################

#
# Location of your qooxdoo distribution
# Could be relative from this location or absolute
#
QOOXDOO_PATH = ../..

#
# The same as above, but from the webserver point of view
# Starting point is the application HTML file of the source folder.
# In most cases just add a "/.." compared to above
#
QOOXDOO_URI = ../../..

#
# Namespace of your application e.g. custom
#
PROJECT_NAMESPACE = qx

#
# Titles used in your API viewer and during the build process
#
PROJECT_MAKE_TITLE = FRAMEWORK
PROJECT_API_TITLE = qooxdoo

#
# Locales to include
#
PROJECT_LOCALES = de de_DE en en_US fr fr_FR es es_ES



####################################################################################
# ADVANCED SETTINGS
####################################################################################

#
# Include all stuff into build
#
PROJECT_COMPLETE_BUILD = true

#
# Locale directory
#
PROJECT_LOCALE_DIRECTORY = source/class/$(PROJECT_NAMESPACE)/locale/translation

#
# Locale namespace
#
PROJECT_LOCALE_NAMESPACE = $(PROJECT_NAMESPACE).locale.translation




####################################################################################
# INCLUDE CORE
####################################################################################

#
# Include project core handling
#
include $(QOOXDOO_PATH)/frontend/framework/tool/make/project.mk

#
# Include default targets: build, source, clean, ...
#
include $(QOOXDOO_PATH)/frontend/framework/tool/make/targets.mk

#
# Include implementation targets
#
include $(QOOXDOO_PATH)/frontend/framework/tool/make/impl.mk
