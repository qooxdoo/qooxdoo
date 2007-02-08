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


###################################################################################
# PROCESSING APPLICATION SETTINGS
###################################################################################



# ========================================================
# Compute basics
# ========================================================

COMPUTED_CLASS_PATH = --class-path $(FRAMEWORK_SOURCE_PATH)/class --class-path $(APPLICATION_SOURCE_PATH)/class
COMPUTED_CLASS_URI = --class-uri $(FRAMEWORK_SOURCE_URI)/class --class-uri ./class

COMPUTED_BUILD_SCRIPT_NAME = $(APPLICATION_BUILD_PATH)/script/$(APPLICATION_SCRIPT_FILENAME)
COMPUTED_SOURCE_SCRIPT_NAME = $(APPLICATION_SOURCE_PATH)/script/$(APPLICATION_SCRIPT_FILENAME)





# ========================================================
# Compute resources
# ========================================================

COMPUTED_BUILD_RESOURCE = --copy-resources \
  --resource-input $(FRAMEWORK_SOURCE_PATH)/resource \
  --resource-output $(APPLICATION_BUILD_PATH)/resource/qx \
  --resource-input $(APPLICATION_SOURCE_PATH)/resource \
  --resource-output $(APPLICATION_BUILD_PATH)/resource/$(APPLICATION_NAMESPACE)

ifeq ($(APPLICATION_RESOURCE_FILTER),true)
  COMPUTED_BUILD_RESOURCE += --enable-resource-filter
endif






# ========================================================
# Compute settings
# ========================================================

COMPUTED_BUILD_SETTING = \
  --use-setting $(FRAMEWORK_NAMESPACE).resourceUri:./resource/qx \
  --use-setting $(APPLICATION_NAMESPACE).resourceUri:./resource/$(APPLICATION_NAMESPACE)

COMPUTED_SOURCE_SETTING = \
  --use-setting $(FRAMEWORK_NAMESPACE).resourceUri:$(FRAMEWORK_SOURCE_URI)/resource \

ifeq ($(APPLICATION_ENABLE_GUI),true)
  COMPUTED_THEME_SETTING = --use-setting qx.colorTheme:$(APPLICATION_THEME_COLOR) \
    --use-setting qx.iconTheme:$(APPLICATION_THEME_ICON) \
    --use-setting qx.widgetTheme:$(APPLICATION_THEME_WIDGET) \
    --use-setting qx.appearanceTheme:$(APPLICATION_THEME_APPEARANCE)

  COMPUTED_SOURCE_SETTING += $(COMPUTED_THEME_SETTING)
  COMPUTED_BUILD_SETTING += $(COMPUTED_THEME_SETTING)
else
  COMPUTED_SOURCE_SETTING += --use-setting qx.initComponent:qx.component.init.BasicInitComponent
  COMPUTED_BUILD_SETTING += --use-setting qx.initComponent:qx.component.init.BasicInitComponent
endif






# ========================================================
# Compute locales
# ========================================================

ifndef APPLICATION_LOCALES
  COMPUTED_LOCALES = C
else
  COMPUTED_LOCALES = C $(APPLICATION_LOCALES)
endif

COMPUTED_FRAMEWORK_LOCALE_INCLUDE := $(COMPUTED_LOCALES:%= --include $(FRAMEWORK_NAMESPACE).locale.data.% )
COMPUTED_FRAMEWORK_TRANSLATION_INCLUDE := $(COMPUTED_LOCALES:%= --include $(FRAMEWORK_NAMESPACE).locale.translation.% )
COMPUTED_APPLICATION_TRANSLATION_INCLUDE := $(COMPUTED_LOCALES:%= --include $(APPLICATION_NAMESPACE).translation.% )






# ========================================================
# Compute includes
# ========================================================

ifeq ($(APPLICATION_ENABLE_GUI),false)
COMPUTED_THEMES_INCLUDE =
else
COMPUTED_THEMES_INCLUDE = --include $(APPLICATION_THEME_ICON),$(APPLICATION_THEME_WIDGET),$(APPLICATION_THEME_COLOR),$(APPLICATION_THEME_APPEARANCE)
endif

ifeq ($(APPLICATION_COMPLETE_SOURCE),false)
  COMPUTED_SOURCE_INCLUDE = --include $(APPLICATION_CLASSNAME) \
    $(COMPUTED_FRAMEWORK_LOCALE_INCLUDE) \
    $(COMPUTED_FRAMEWORK_TRANSLATION_INCLUDE) \
    $(COMPUTED_APPLICATION_TRANSLATION_INCLUDE) \
    $(COMPUTED_THEMES_INCLUDE)
else
  COMPUTED_SOURCE_INCLUDE =
endif

ifneq ($(APPLICATION_COMPLETE_BUILD),true)
  COMPUTED_BUILD_INCLUDE = --include $(APPLICATION_CLASSNAME) \
    $(COMPUTED_FRAMEWORK_LOCALE_INCLUDE) \
    $(COMPUTED_FRAMEWORK_TRANSLATION_INCLUDE) \
    $(COMPUTED_APPLICATION_TRANSLATION_INCLUDE) \
    $(COMPUTED_THEMES_INCLUDE)
else
  COMPUTED_BUILD_INCLUDE =
endif

ifeq ($(APPLICATION_COMPLETE_API),false)
  COMPUTED_API_INCLUDE = --include $(APPLICATION_CLASSNAME)
else
  COMPUTED_API_INCLUDE =
endif







# ========================================================
# Compute variant configuration
# ========================================================

COMPUTED_BUILD_VARIANT =
COMPUTED_SOURCE_VARIANT =

ifeq ($(APPLICATION_OPTIMIZE_REMOVE_DEBUG),true)
  COMPUTED_BUILD_VARIANT += --use-variant qx.debug:off
endif







# ========================================================
# Compute options
# ========================================================

COMPUTED_SOURCE_OPTIONS =
COMPUTED_BUILD_OPTIONS =

ifeq ($(APPLICATION_OPTIMIZE_STRINGS),true)
  COMPUTED_BUILD_OPTIONS += --optimize-strings
endif

ifeq ($(APPLICATION_OPTIMIZE_VARIABLES),true)
  COMPUTED_BUILD_OPTIONS += --optimize-variables
endif

ifneq ($(APPLICATION_LOGLEVEL),)
  COMPUTED_BUILD_OPTIONS += --log-level $(APPLICATION_LOGLEVEL)
endif

ifeq ($(APPLICATION_LINEBREAKS_SOURCE),true)
  COMPUTED_SOURCE_OPTIONS += --add-new-lines --add-file-ids
endif

ifeq ($(APPLICATION_LINEBREAKS_BUILD),true)
  COMPUTED_BUILD_OPTIONS += --add-new-lines --add-file-ids
endif

ifneq ($(APPLICATION_BUILD_FLAGS),)
  COMPUTED_BUILD_OPTIONS += $(APPLICATION_BUILD_FLAGS)
endif

ifneq ($(APPLICATION_SOURCE_FLAGS),)
  COMPUTED_SOURCE_OPTIONS += $(APPLICATION_SOURCE_FLAGS)
endif






# ========================================================
# Compute template configuration
# ========================================================

COMPUTED_TEMPLATE =

ifneq ($(APPLICATION_TEMPLATE_INPUT),)
  COMPUTED_TEMPLATE += --source-template-input-file $(APPLICATION_SOURCE_PATH)/$(APPLICATION_TEMPLATE_INPUT) --source-template-output-file $(APPLICATION_SOURCE_PATH)/$(APPLICATION_TEMPLATE_OUTPUT)

  ifneq ($(APPLICATION_TEMPLATE_REPLACE),)
    COMPUTED_TEMPLATE += --source-template-replace "$(APPLICATION_TEMPLATE_REPLACE)"
  endif
endif
