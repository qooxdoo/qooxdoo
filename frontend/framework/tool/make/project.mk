###################################################################################
# APPLY DEFAULTS
###################################################################################

# TODO




###################################################################################
# SETTINGS
###################################################################################

#
# Framework paths
#
FRAMEWORK_PATH = $(QOOXDOO_PATH)/frontend/framework
FRAMEWORK_SOURCE_PATH = $(FRAMEWORK_PATH)/source
FRAMEWORK_CACHE_PATH = $(FRAMEWORK_PATH)/.cache
FRAMEWORK_TOOL_PATH = $(FRAMEWORK_PATH)/tool

#
# Framework URIs
#
FRAMEWORK_URI = $(QOOXDOO_URI)/frontend/framework
FRAMEWORK_SOURCE_URI = $(FRAMEWORK_URI)/source

#
# API Paths
#
API_PATH = $(QOOXDOO_PATH)/frontend/api
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
  --script-input $(PROJECT_SOURCE_PATH)/class \
  $(PROJECT_ADDITIONAL_CLASS_PATH)
  
COMPUTED_CLASS_URI = --source-script-path $(FRAMEWORK_SOURCE_URI)/class \
  --source-script-path $(PROJECT_SOURCE_URI)/class \
  $(PROJECT_ADDITIONAL_CLASS_URI)
  
COMPUTED_RESOURCE = --copy-resources \
  --resource-input $(FRAMEWORK_SOURCE_PATH)/resource \
  --resource-output $(PROJECT_BUILD_PATH)/resource/qooxdoo \
  --define-runtime-setting qx.manager.object.AliasManager.resourceUri:resource/qooxdoo \
  --resource-input $(PROJECT_SOURCE_PATH)/resource \
  --resource-output $(PROJECT_BUILD_PATH)/resource/project \
  --define-runtime-setting $(PROJECT_NAMESPACE).Application.resourceUri:resource/project \
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
