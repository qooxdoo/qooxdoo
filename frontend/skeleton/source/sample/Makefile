####################################################################################
# BASIC SETTINGS
####################################################################################

#
# Most interesting: Where qooxdoo resists
#
QOOXDOO_PATH = ../../../..

#
# The same as above, but from the webserver point of view
# Starting point is the application HTML file of the source folder.
# In most cases just add a "/.." compared to above
#
QOOXDOO_URI = ../../../../..

#
# Basic project data
#
PROJECT_NAMESPACE = custom
PROJECT_MAKE_TITLE = CUSTOM
PROJECT_API_TITLE = Custom

#
# Additional files (space separated list)
#
PROJECT_FILES = index.html

#
# Locales to build (space separated list)
#
PROJECT_LOCALES = de en fr




####################################################################################
# ADVANCED SETTINGS
####################################################################################

#
# Define folder path
#
PROJECT_PATH = .

#
# Define deep folder paths
#
PROJECT_SOURCE_PATH = $(PROJECT_PATH)/source
PROJECT_BUILD_PATH = $(PROJECT_PATH)/build
PROJECT_API_PATH = $(PROJECT_PATH)/api

#
# Relation from HTML file in source folder to source directory. 
# Normally keep this the default "."
#
PROJECT_SOURCE_URI = .

#
# Configure resource handling
#
PROJECT_RESOURCE_FILTER = false

#
# Customize your build
#
PROJECT_COMPLETE_BUILD = false
PROJECT_COMPLETE_SOURCE = true
PROJECT_COMPLETE_API = true

#
# Customize your build
#
PROJECT_LINEBREAKS_BUILD = true
PROJECT_LINEBREAKS_SOURCE = true

#
# Configure optimizer
#
PROJECT_OPTIMIZE_STRINGS = true
PROJECT_OPTIMIZE_VARIABLES = true

#
# Include support for widgets
#
PROJECT_ENABLE_GUI = true

#
# Available options: low, middle, high
#
PROJECT_PROCESS_PRIORITY = low

#
# Redefine folder names (inside build/source)
#
PROJECT_SCRIPT_FOLDERNAME = script
PROJECT_CLASS_FOLDERNAME = class

#
# Name of the generated script
#
PROJECT_SCRIPT_FILENAME = $(PROJECT_NAMESPACE).js

#
# Application classname
#
PROJECT_APPLICATION = $(PROJECT_NAMESPACE).Application

#
# Settings for more advanced users
#
PROJECT_ADDITIONAL_CLASS_PATH = 
PROJECT_ADDITIONAL_CLASS_URI =
PROJECT_ADDITIONAL_RESOURCE =

#
# Define the default commands e.g. build, source, clean, all, ...
#
PROJECT_DEFINE_DEFAULT_TARGETS = true





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
