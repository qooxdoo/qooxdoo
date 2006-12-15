####################################################################################
# BASIC SETTINGS
####################################################################################

#
# Location of your qooxdoo distribution
# Could be relative from this location or absolute
#
ifndef QOOXDOO_PATH
  QOOXDOO_PATH = PLEASE_DEFINE_QOOXDOO_PATH
endif

#
# The same as above, but from the webserver point of view
# Starting point is the application HTML file of the source folder.
# In most cases just add a "/.." compared to above
#
ifndef QOOXDOO_URI
  QOOXDOO_URI = $(QOOXDOO_PATH)/..
endif

#
# Namespace of your application e.g. custom
#
ifndef PROJECT_NAMESPACE
  PROJECT_NAMESPACE = custom
endif

#
# Titles used in your API viewer and during the build process
#
ifndef PROJECT_MAKE_TITLE
  PROJECT_MAKE_TITLE = CUSTOM
endif

ifndef PROJECT_API_TITLE
  PROJECT_API_TITLE = Custom
endif

#
# Files that will be copied into the build directory
# (space separated list)
#
# ifndef PROJECT_FILES
#   PROJECT_FILES = index.html
# endif

#
# Locales to use (space separated list)
#
# ifndef PROJECT_LOCALES
#   PROJECT_LOCALES = en fr de es
# endif






####################################################################################
# ADVANCED SETTINGS
####################################################################################

#
# Define folder path
#
ifndef PROJECT_PATH
  PROJECT_PATH = .
endif

#
# Define deep folder paths
#
ifndef PROJECT_SOURCE_PATH
  PROJECT_SOURCE_PATH = $(PROJECT_PATH)/source
endif

ifndef PROJECT_BUILD_PATH
  PROJECT_BUILD_PATH = $(PROJECT_PATH)/build
endif

ifndef PROJECT_API_PATH
  PROJECT_API_PATH = $(PROJECT_PATH)/api
endif

#
# Define the publishing location
# Could be any rsync compatible url/path
#
ifndef PROJECT_PUBLISH_PATH
  PROJECT_PUBLISH_PATH = $(PROJECT_PATH)/publish
endif

#
# Define the debug location
# Could be any rsync compatible url/path
#
ifndef PROJECT_DEBUG_PATH
  PROJECT_DEBUG_PATH = $(PROJECT_PATH)/debug
endif

#
# Relation from HTML file in source folder to source directory. 
# Normally keep this the default "."
#
ifndef PROJECT_SOURCE_URI
  PROJECT_SOURCE_URI = .
endif

#
# Configure resource handling
#
ifndef PROJECT_RESOURCE_FILTER
  PROJECT_RESOURCE_FILTER = false
endif

#
# Customize your build
#
ifndef PROJECT_COMPLETE_BUILD
  PROJECT_COMPLETE_BUILD = false
endif

ifndef PROJECT_COMPLETE_SOURCE
  PROJECT_COMPLETE_SOURCE = true
endif

ifndef PROJECT_COMPLETE_API
  PROJECT_COMPLETE_API = true
endif

#
# Customize your build
#
ifndef PROJECT_LINEBREAKS_BUILD
  PROJECT_LINEBREAKS_BUILD = true
endif

ifndef PROJECT_LINEBREAKS_SOURCE
  PROJECT_LINEBREAKS_SOURCE = true
endif

#
# Configure optimizer
#
ifndef PROJECT_OPTIMIZE_STRINGS
  PROJECT_OPTIMIZE_STRINGS = true
endif

ifndef PROJECT_OPTIMIZE_VARIABLES
  PROJECT_OPTIMIZE_VARIABLES = true
endif

#
# Include support for widgets
#
ifndef PROJECT_ENABLE_GUI
  PROJECT_ENABLE_GUI = true
endif

#
# Available options: low, middle, high
#
ifndef PROJECT_PROCESS_PRIORITY
  PROJECT_PROCESS_PRIORITY = low
endif

#
# Redefine folder names (inside build/source)
#
ifndef PROJECT_SCRIPT_FOLDERNAME
  PROJECT_SCRIPT_FOLDERNAME = script
endif

ifndef PROJECT_CLASS_FOLDERNAME
  PROJECT_CLASS_FOLDERNAME = class
endif

#
# Name of the generated script
#
ifndef PROJECT_SCRIPT_FILENAME
  PROJECT_SCRIPT_FILENAME = $(PROJECT_NAMESPACE).js
endif

#
# Application classname
#
ifndef PROJECT_APPLICATION
  PROJECT_APPLICATION = $(PROJECT_NAMESPACE).Application
endif

#
# Locale namespace
#
ifndef PROJECT_LOCALE_NAMESPACE
  PROJECT_LOCALE_NAMESPACE = $(PROJECT_NAMESPACE).locale.translation
endif

#
# Locale directory
#
ifndef PROJECT_LOCALE_DIRECTORY
  PROJECT_LOCALE_DIRECTORY = $(PROJECT_SOURCE_PATH)/class/$(PROJECT_NAMESPACE)/locale/translation
endif

#
# Settings for more advanced users
#
ifndef PROJECT_ADDITIONAL_CLASS_PATH
  PROJECT_ADDITIONAL_CLASS_PATH = 
endif

ifndef PROJECT_ADDITIONAL_CLASS_URI
  PROJECT_ADDITIONAL_CLASS_URI =
endif

ifndef PROJECT_ADDITIONAL_RESOURCE
  PROJECT_ADDITIONAL_RESOURCE =
endif

#
# Define the default commands e.g. build, source, clean, all, ...
#
ifndef PROJECT_DEFINE_DEFAULT_TARGETS
  PROJECT_DEFINE_DEFAULT_TARGETS = true
endif







###################################################################################
# SETTINGS
###################################################################################

#
# Framework paths
#
FRAMEWORK_PATH = $(QOOXDOO_PATH)/frontend/framework
FRAMEWORK_SOURCE_PATH = $(FRAMEWORK_PATH)/source
FRAMEWORK_CACHE_PATH = $(FRAMEWORK_PATH)/.cache
FRAMEWORK_LOCALES_CACHE_PATH = $(FRAMEWORK_PATH)/.locales
FRAMEWORK_TOOL_PATH = $(FRAMEWORK_PATH)/tool
FRAMEWORK_LOCALES_PATH = $(FRAMEWORK_SOURCE_PATH)/class/qx/locale/data

#
# Framework URIs
#
FRAMEWORK_URI = $(QOOXDOO_URI)/frontend/framework
FRAMEWORK_SOURCE_URI = $(FRAMEWORK_URI)/source
FRAMEWORK_CLDR_DOWNLOAD_URI = http://unicode.org/cldr/data/common/main

#
# API Paths
#
API_PATH = $(QOOXDOO_PATH)/frontend/application/apiviewer
API_SOURCE_PATH = $(API_PATH)/source
API_FILES = index.html





###################################################################################
# COMPUTED DEFAULTS
###################################################################################

COMPUTED_COMMON_INIT = 
COMPUTED_COMMON_NICE = 0

COMPUTED_SOURCE_INCLUDE = 
COMPUTED_SOURCE_LINEBREAKS = 

COMPUTED_BUILD_INCLUDE =
COMPUTED_BUILD_OPTIMIZATIONS =
COMPUTED_BUILD_LINEBREAKS = 

COMPUTED_API_INCLUDE =






###################################################################################
# PROCESSING PROJECT SETTINGS
###################################################################################

# TODO:
# Rename: 
#   --script-input to --class-path
#   --source-script-path to --class-uri
#

COMPUTED_CLASS_PATH = --script-input $(FRAMEWORK_SOURCE_PATH)/class \
  --script-input $(PROJECT_SOURCE_PATH)/$(PROJECT_CLASS_FOLDERNAME) \
  $(PROJECT_ADDITIONAL_CLASS_PATH)
  
COMPUTED_CLASS_URI = --source-script-path $(FRAMEWORK_SOURCE_URI)/class \
  --source-script-path $(PROJECT_SOURCE_URI)/$(PROJECT_CLASS_FOLDERNAME) \
  $(PROJECT_ADDITIONAL_CLASS_URI)
  
COMPUTED_RESOURCE = --copy-resources \
  --resource-input $(FRAMEWORK_SOURCE_PATH)/resource \
  --resource-output $(PROJECT_BUILD_PATH)/resource/qx \
  --define-runtime-setting qx.manager.object.AliasManager.resourceUri:resource/qx \
  --resource-input $(PROJECT_SOURCE_PATH)/resource \
  --resource-output $(PROJECT_BUILD_PATH)/resource/$(PROJECT_NAMESPACE) \
  --define-runtime-setting $(PROJECT_NAMESPACE).Application.resourceUri:resource/$(PROJECT_NAMESPACE) \
  $(PROJECT_ADDITIONAL_RESOURCE)
  
  


ifeq ($(PROJECT_PROCESS_PRIORITY),low)
  COMPUTED_COMMON_NICE = 10
endif

ifeq ($(PROJECT_PROCESS_PRIORITY),high)
  COMPUTED_COMMON_NICE = -10
endif

ifeq ($(PROJECT_COMPLETE_SOURCE),false)
  COMPUTED_SOURCE_INCLUDE = --include $(PROJECT_APPLICATION)
endif

ifneq ($(PROJECT_COMPLETE_BUILD),true)
  COMPUTED_BUILD_INCLUDE = --include $(PROJECT_APPLICATION)
endif

ifeq ($(PROJECT_COMPLETE_API),false)
  COMPUTED_API_INCLUDE = --include $(PROJECT_APPLICATION)
endif

ifeq ($(PROJECT_OPTIMIZE_STRINGS),true)
  COMPUTED_BUILD_OPTIMIZATIONS += --optimize-strings
endif

ifeq ($(PROJECT_OPTIMIZE_VARIABLES),true)
  COMPUTED_BUILD_OPTIMIZATIONS += --optimize-variables
endif

ifeq ($(PROJECT_ENABLE_GUI),false)
  COMPUTED_COMMON_INIT = --define-runtime-setting qx.core.Init.component:qx.component.init.BasicInitComponent
endif

ifeq ($(PROJECT_RESOURCE_FILTER),true)
  COMPUTED_RESOURCE += --enable-resource-filter
endif

ifeq ($(PROJECT_LINEBREAKS_SOURCE),true)
  COMPUTED_SOURCE_LINEBREAKS = --add-new-lines --add-file-ids
endif

ifeq ($(PROJECT_LINEBREAKS_BUILD),true)
  COMPUTED_BUILD_LINEBREAKS = --add-new-lines --add-file-ids
endif
