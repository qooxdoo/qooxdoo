################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1and1.org
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Andreas Ecker (ecker)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

################################################################################
# PROCESSING APPLICATION SETTINGS
################################################################################



# ==============================================================================
# Compute basics
# ==============================================================================

COMPUTED_CLASS_PATH = --class-path $(FRAMEWORK_SOURCE_PATH)/class,$(APPLICATION_SOURCE_PATH)/class,$(APPLICATION_ADDITIONAL_CLASS_PATH)
COMPUTED_CLASS_URI = --class-uri $(FRAMEWORK_SOURCE_URI)/class,$(APPLICATION_HTML_TO_ROOT_URI)/class,$(APPLICATION_ADDITIONAL_CLASS_URI)

COMPUTED_BUILD_SCRIPT_NAME = $(APPLICATION_BUILD_PATH)/script/$(APPLICATION_SCRIPT_FILENAME)
COMPUTED_SOURCE_SCRIPT_NAME = $(APPLICATION_SOURCE_PATH)/script/$(APPLICATION_SCRIPT_FILENAME)







# ==============================================================================
# Compute resources
# ==============================================================================

COMPUTED_BUILD_RESOURCE = --copy-resources \
  --resource-input $(FRAMEWORK_SOURCE_PATH)/resource \
  --resource-output $(APPLICATION_BUILD_PATH)/resource/$(FRAMEWORK_NAMESPACE) \
  --resource-input $(APPLICATION_SOURCE_PATH)/resource \
  --resource-output $(APPLICATION_BUILD_PATH)/resource/$(APPLICATION_NAMESPACE)

ifeq ($(APPLICATION_RESOURCE_FILTER),true)
  COMPUTED_BUILD_RESOURCE += --enable-resource-filter
endif






# ==============================================================================
# Compute settings
# ==============================================================================

COMPUTED_BUILD_SETTING = \
  --use-setting $(FRAMEWORK_NAMESPACE).resourceUri:$(APPLICATION_HTML_TO_ROOT_URI)/resource/$(FRAMEWORK_NAMESPACE) \
  --use-setting $(APPLICATION_NAMESPACE).resourceUri:$(APPLICATION_HTML_TO_ROOT_URI)/resource/$(APPLICATION_NAMESPACE)

COMPUTED_SOURCE_SETTING = \
  --use-setting $(FRAMEWORK_NAMESPACE).resourceUri:$(FRAMEWORK_SOURCE_URI)/resource \
  --use-setting $(APPLICATION_NAMESPACE).resourceUri:$(APPLICATION_HTML_TO_ROOT_URI)/resource

ifeq ($(APPLICATION_ENABLE_GUI),true)
  COMPUTED_THEME_SETTING = \
    --use-setting qx.colorTheme:$(APPLICATION_THEME_COLOR) \
    --use-setting qx.iconTheme:$(APPLICATION_THEME_ICON) \
    --use-setting qx.widgetTheme:$(APPLICATION_THEME_WIDGET) \
    --use-setting qx.appearanceTheme:$(APPLICATION_THEME_APPEARANCE)

  COMPUTED_SOURCE_SETTING += $(COMPUTED_THEME_SETTING)
  COMPUTED_BUILD_SETTING += $(COMPUTED_THEME_SETTING)
else
  COMPUTED_SOURCE_SETTING += --use-setting qx.initComponent:qx.component.init.BasicInitComponent
  COMPUTED_BUILD_SETTING += --use-setting qx.initComponent:qx.component.init.BasicInitComponent
endif

ifneq ($(APPLICATION_SOURCE_LOG_LEVEL),)
  ifeq ($(APPLICATION_SOURCE_LOG_LEVEL),all)
    JS_SOURCE_LOG_LEVEL = 0
  endif
  ifeq ($(APPLICATION_SOURCE_LOG_LEVEL),debug)
    JS_SOURCE_LOG_LEVEL = 200
  endif
  ifeq ($(APPLICATION_SOURCE_LOG_LEVEL),info)
    JS_SOURCE_LOG_LEVEL = 500
  endif
  ifeq ($(APPLICATION_SOURCE_LOG_LEVEL),warn)
    JS_SOURCE_LOG_LEVEL = 600
  endif
  ifeq ($(APPLICATION_SOURCE_LOG_LEVEL),error)
    JS_SOURCE_LOG_LEVEL = 700
  endif
  ifeq ($(APPLICATION_SOURCE_LOG_LEVEL),fatal)
    JS_SOURCE_LOG_LEVEL = 800
  endif
  ifeq ($(APPLICATION_SOURCE_LOG_LEVEL),off)
    JS_SOURCE_LOG_LEVEL = 1000
  endif

  ifneq ($(JS_SOURCE_LOG_LEVEL),)
    COMPUTED_SOURCE_SETTING += --use-setting qx.minLogLevel:$(JS_SOURCE_LOG_LEVEL)
  endif
endif

ifneq ($(APPLICATION_BUILD_LOG_LEVEL),)
  ifeq ($(APPLICATION_BUILD_LOG_LEVEL),all)
    JS_BUILD_LOG_LEVEL = 0
  endif
  ifeq ($(APPLICATION_BUILD_LOG_LEVEL),debug)
    JS_BUILD_LOG_LEVEL = 200
  endif
  ifeq ($(APPLICATION_BUILD_LOG_LEVEL),info)
    JS_BUILD_LOG_LEVEL = 500
  endif
  ifeq ($(APPLICATION_BUILD_LOG_LEVEL),warn)
    JS_BUILD_LOG_LEVEL = 600
  endif
  ifeq ($(APPLICATION_BUILD_LOG_LEVEL),error)
    JS_BUILD_LOG_LEVEL = 700
  endif
  ifeq ($(APPLICATION_BUILD_LOG_LEVEL),fatal)
    JS_BUILD_LOG_LEVEL = 800
  endif
  ifeq ($(APPLICATION_BUILD_LOG_LEVEL),off)
    JS_BUILD_LOG_LEVEL = 1000
  endif

  ifneq ($(JS_BUILD_LOG_LEVEL),)
    COMPUTED_BUILD_SETTING += --use-setting qx.minLogLevel:$(JS_BUILD_LOG_LEVEL)
  endif
endif

ifneq ($(APPLICATION_SOURCE_LOG_APPENDER),)
  COMPUTED_SOURCE_SETTING += --use-setting qx.logAppender:$(APPLICATION_SOURCE_LOG_APPENDER)
endif

ifneq ($(APPLICATION_BUILD_LOG_APPENDER),)
  COMPUTED_BUILD_SETTING += --use-setting qx.logAppender:$(APPLICATION_BUILD_LOG_APPENDER)
endif





# ==============================================================================
# Compute locales
# ==============================================================================

ifndef APPLICATION_LOCALES
  COMPUTED_LOCALES = C
else
  COMPUTED_LOCALES = C $(APPLICATION_LOCALES)
endif







# ==============================================================================
# Compute includes
# ==============================================================================

ifeq ($(APPLICATION_ENABLE_GUI),false)
  COMPUTED_THEMES_INCLUDE =
else
  COMPUTED_THEMES_INCLUDE = --include $(APPLICATION_THEME_ICON),$(APPLICATION_THEME_WIDGET),$(APPLICATION_THEME_COLOR),$(APPLICATION_THEME_APPEARANCE)
endif

COMPUTED_FRAMEWORK_LOCALE_INCLUDE := $(COMPUTED_LOCALES:%= --include $(FRAMEWORK_NAMESPACE).locale.data.% )
COMPUTED_FRAMEWORK_TRANSLATION_INCLUDE := $(COMPUTED_LOCALES:%= --include $(FRAMEWORK_NAMESPACE).locale.translation.% )
COMPUTED_APPLICATION_TRANSLATION_INCLUDE := $(COMPUTED_LOCALES:%= --include $(APPLICATION_NAMESPACE).translation.% )

ifeq ($(APPLICATION_COMPLETE_SOURCE),false)
  COMPUTED_SOURCE_INCLUDE = --include $(APPLICATION_NAMESPACE).$(APPLICATION_CLASSNAME) \
    $(COMPUTED_FRAMEWORK_LOCALE_INCLUDE) \
    $(COMPUTED_FRAMEWORK_TRANSLATION_INCLUDE) \
    $(COMPUTED_APPLICATION_TRANSLATION_INCLUDE) \
    $(COMPUTED_THEMES_INCLUDE)
else
  COMPUTED_SOURCE_INCLUDE =
endif

ifneq ($(APPLICATION_COMPLETE_BUILD),true)
  COMPUTED_BUILD_INCLUDE = --include $(APPLICATION_NAMESPACE).$(APPLICATION_CLASSNAME) \
    $(COMPUTED_FRAMEWORK_LOCALE_INCLUDE) \
    $(COMPUTED_FRAMEWORK_TRANSLATION_INCLUDE) \
    $(COMPUTED_APPLICATION_TRANSLATION_INCLUDE) \
    $(COMPUTED_THEMES_INCLUDE)
else
  COMPUTED_BUILD_INCLUDE =
endif

ifeq ($(APPLICATION_COMPLETE_API),false)
  COMPUTED_API_INCLUDE = --include $(APPLICATION_NAMESPACE).$(APPLICATION_CLASSNAME)
else
  COMPUTED_API_INCLUDE =
endif

ifeq ($(APPLICATION_ENABLE_GUI),true)
  COMPUTED_SOURCE_INCLUDE += --include qx.component.init.InterfaceInitComponent
  COMPUTED_BUILD_INCLUDE += --include qx.component.init.InterfaceInitComponent
else
  COMPUTED_SOURCE_INCLUDE += --include qx.component.init.BasicInitComponent
  COMPUTED_BUILD_INCLUDE += --include qx.component.init.BasicInitComponent
endif

ifneq ($(APPLICATION_SOURCE_LOG_APPENDER),)
  COMPUTED_SOURCE_INCLUDE += --include $(APPLICATION_SOURCE_LOG_APPENDER)
else
  COMPUTED_SOURCE_INCLUDE += --include qx.log.WindowAppender
endif

ifneq ($(APPLICATION_BUILD_LOG_APPENDER),)
  COMPUTED_BUILD_INCLUDE += --include qx.logAppender:$(APPLICATION_BUILD_LOG_APPENDER)
else
  COMPUTED_BUILD_INCLUDE += --include qx.log.WindowAppender
endif





# ==============================================================================
# Compute priorities
# ==============================================================================

# Language features should be added with highest priority
COMPUTED_SOURCE_PRIORITIES = --prioritize-class qx.core.Client,qx.lang.Core,qx.lang.Generics
COMPUTED_BUILD_PRIORITIES = --prioritize-class qx.core.Client,qx.lang.Core,qx.lang.Generics

# Make the appender available to have the ability to log at loadtime for many of
# the following classes
ifneq ($(APPLICATION_SOURCE_LOG_APPENDER),)
  COMPUTED_SOURCE_PRIORITIES += --prioritize-class $(APPLICATION_SOURCE_LOG_APPENDER)
else
  COMPUTED_SOURCE_PRIORITIES += --prioritize-class qx.log.NativeAppender
endif

ifneq ($(APPLICATION_BUILD_LOG_APPENDER),)
  COMPUTED_BUILD_PRIORITIES += --prioritize-class $(APPLICATION_BUILD_LOG_APPENDER)
else
  COMPUTED_BUILD_PRIORITIES += --prioritize-class qx.log.NativeAppender
endif

# Be sure that the logger is available fast
COMPUTED_SOURCE_PRIORITIES += --prioritize-class qx.log.Logger
COMPUTED_BUILD_PRIORITIES += --prioritize-class qx.log.Logger

# Be sure that onload is assigned as earliest possible moment
COMPUTED_SOURCE_PRIORITIES += --prioritize-class qx.core.Init
COMPUTED_BUILD_PRIORITIES += --prioritize-class qx.core.Init





# ==============================================================================
# Compute variant configuration
# ==============================================================================

COMPUTED_BUILD_VARIANT =
COMPUTED_SOURCE_VARIANT =

ifeq ($(APPLICATION_OPTIMIZE_REMOVE_DEBUG),true)
  COMPUTED_BUILD_VARIANT += --use-variant qx.debug:off
endif







# ==============================================================================
# Compute options
# ==============================================================================

COMPUTED_SOURCE_OPTIONS =
COMPUTED_BUILD_OPTIONS =

ifeq ($(APPLICATION_OPTIMIZE_STRINGS),true)
  COMPUTED_BUILD_OPTIONS += --optimize-strings
endif

ifeq ($(APPLICATION_OPTIMIZE_VARIABLES),true)
  COMPUTED_BUILD_OPTIONS += --optimize-variables
endif

ifeq ($(APPLICATION_LINEBREAKS_SOURCE),true)
  COMPUTED_SOURCE_OPTIONS += --add-new-lines --add-file-ids
endif

ifeq ($(APPLICATION_LINEBREAKS_BUILD),true)
  COMPUTED_BUILD_OPTIONS += --add-new-lines --add-file-ids
endif

ifneq ($(APPLICATION_ADDITIONAL_SOURCE_OPTIONS),)
  COMPUTED_SOURCE_OPTIONS += $(APPLICATION_ADDITIONAL_SOURCE_OPTIONS)
endif

ifneq ($(APPLICATION_ADDITIONAL_BUILD_OPTIONS),)
  COMPUTED_BUILD_OPTIONS += $(APPLICATION_ADDITIONAL_BUILD_OPTIONS)
endif

ifneq ($(COMPUTED_SOURCE_PRIORITIES),)
  COMPUTED_SOURCE_OPTIONS += $(COMPUTED_SOURCE_PRIORITIES)
endif

ifneq ($(COMPUTED_BUILD_PRIORITIES),)
  COMPUTED_BUILD_OPTIONS += $(COMPUTED_BUILD_PRIORITIES)
endif






# ==============================================================================
# Compute template configuration
# ==============================================================================

COMPUTED_TEMPLATE =

ifneq ($(APPLICATION_TEMPLATE_INPUT),)
  COMPUTED_TEMPLATE += --source-template-input-file $(APPLICATION_SOURCE_PATH)/$(APPLICATION_TEMPLATE_INPUT) --source-template-output-file $(APPLICATION_SOURCE_PATH)/$(APPLICATION_TEMPLATE_OUTPUT)

  ifneq ($(APPLICATION_TEMPLATE_REPLACE),)
    COMPUTED_TEMPLATE += --source-template-replace "$(APPLICATION_TEMPLATE_REPLACE)"
  endif
endif
