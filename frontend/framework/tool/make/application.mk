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
# INCLUDE EXTERNAL MAKEFILES
###################################################################################

include $(QOOXDOO_PATH)/frontend/framework/tool/make/framework.mk
include $(QOOXDOO_PATH)/frontend/framework/tool/make/apiviewer.mk







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
# In most cases just add a "/.." compared to above.
#
ifndef QOOXDOO_URI
  QOOXDOO_URI = $(QOOXDOO_PATH)/..
endif

#
# Define the path of your application relative to the Makefile.
# Normally the Makefile resists in the top-level directory of your application.
# The default value "." is OK in the most cases.
#
ifndef APPLICATION_PATH
  APPLICATION_PATH = .
endif

#
# Define the URI of your application HTML relative to the Makefile.
# Normally the Makefile resists in the top-level directory of your application.
# The default value "." is OK in the most cases.
#
ifndef APPLICATION_URI
  APPLICATION_URI = .
endif

#
# Namespace of your application e.g. custom
# Even complexer stuff is possible like: net.sf.custom
#
ifndef APPLICATION_NAMESPACE
  APPLICATION_NAMESPACE = custom
endif

#
# Namespace of your application e.g. custom
# Even complexer stuff is possible like: net/sf/custom
#
ifndef APPLICATION_NAMESPACE_PATH
  APPLICATION_NAMESPACE_PATH = custom
endif

#
# Titles used in your API viewer and during the build process
#
ifndef APPLICATION_MAKE_TITLE
  APPLICATION_MAKE_TITLE = CUSTOM
endif

ifndef APPLICATION_API_TITLE
  APPLICATION_API_TITLE = Custom
endif

#
# Files that will be copied from the source directory into the build
# directory (space separated list). The default list is empty.
#
ifndef APPLICATION_FILES
   APPLICATION_FILES =
endif

#
# Locales to use (space separated list)
#
ifndef APPLICATION_LOCALES
  APPLICATION_LOCALES =
endif








####################################################################################
# GENERATOR OPTIONS
####################################################################################

#
# Customize your application tailor mode
#
ifndef APPLICATION_COMPLETE_BUILD
  APPLICATION_COMPLETE_BUILD = false
endif

ifndef APPLICATION_COMPLETE_SOURCE
  APPLICATION_COMPLETE_SOURCE = true
endif

ifndef APPLICATION_COMPLETE_API
  APPLICATION_COMPLETE_API = true
endif

#
# Customize line break settings
# If enabled code is better readable, but bigger, too.
# Normally not useful for distribution.
#
ifndef APPLICATION_LINEBREAKS_BUILD
  APPLICATION_LINEBREAKS_BUILD = true
endif

ifndef APPLICATION_LINEBREAKS_SOURCE
  APPLICATION_LINEBREAKS_SOURCE = true
endif

#
# Configure optimizer settings
#
ifndef APPLICATION_OPTIMIZE_STRINGS
  APPLICATION_OPTIMIZE_STRINGS = true
endif

ifndef APPLICATION_OPTIMIZE_VARIABLES
  APPLICATION_OPTIMIZE_VARIABLES = true
endif

ifndef APPLICATION_OPTIMIZE_BROWSER
  APPLICATION_OPTIMIZE_BROWSER = true
endif

ifndef APPLICATION_OPTIMIZE_REMOVE_DEBUG
  APPLICATION_OPTIMIZE_REMOVE_DEBUG = true
endif

#
# Configure if support for widgets should be included
#
ifndef APPLICATION_ENABLE_GUI
  APPLICATION_ENABLE_GUI = true
endif

#
# Configure resource filter
# If enabled all application classes needs a #embed
# configuration, too.
#
ifndef APPLICATION_RESOURCE_FILTER
  APPLICATION_RESOURCE_FILTER = false
endif






####################################################################################
# RUNTIME SETTINGS
####################################################################################

#
# Theme selection support
#
ifndef APPLICATION_THEME_ICON
  APPLICATION_THEME_ICON = qx.theme.icon.Nuvola
endif

ifndef APPLICATION_THEME_WIDGET
  APPLICATION_THEME_WIDGET = qx.theme.widget.Windows
endif

ifndef APPLICATION_THEME_COLOR
  APPLICATION_THEME_COLOR = qx.theme.color.WindowsRoyale
endif

ifndef APPLICATION_THEME_APPEARANCE
  APPLICATION_THEME_APPEARANCE = qx.theme.appearance.Classic
endif





####################################################################################
# SOURCE TEMPLATE SETUP
####################################################################################

#
# Template to patch (e.g. XHTML mode)
#
ifndef APPLICATION_TEMPLATE_INPUT
  APPLICATION_TEMPLATE_INPUT =
endif

ifndef APPLICATION_TEMPLATE_OUTPUT
  APPLICATION_TEMPLATE_OUTPUT =
endif

ifndef APPLICATION_TEMPLATE_REPLACE
  APPLICATION_TEMPLATE_REPLACE = <!-- qooxdoo-script-block -->
endif







####################################################################################
# DETAILED PATH CONFIGURATION
####################################################################################

#
# The source folder of your application. This folder should contain all your
# application class files and resources. The default is "./source".
#
ifndef APPLICATION_SOURCE_PATH
  APPLICATION_SOURCE_PATH = $(APPLICATION_PATH)/source
endif

#
# The build folder of your application. This is the folder where the application
# self-contained build is generated to. The default is "./build".
#
ifndef APPLICATION_BUILD_PATH
  APPLICATION_BUILD_PATH = $(APPLICATION_PATH)/build
endif

#
# The API folder of your application. This is the destination target where the
# self-contained API viewer should resist after a "make api".
# The default is "./api".
#
ifndef APPLICATION_API_PATH
  APPLICATION_API_PATH = $(APPLICATION_PATH)/api
endif

#
# Define the publishing location
# Could be any rsync compatible url/path
#
ifndef APPLICATION_PUBLISH_PATH
  APPLICATION_PUBLISH_PATH = $(APPLICATION_PATH)/publish
endif

#
# Define the debug location
# Could be any rsync compatible url/path
#
ifndef APPLICATION_DEBUG_PATH
  APPLICATION_DEBUG_PATH = $(APPLICATION_PATH)/debug
endif









####################################################################################
# ADVANCED SETTINGS: OUTPUT OPTIONS
####################################################################################

#
# Name of the generated script
#
ifndef APPLICATION_SCRIPT_FILENAME
  APPLICATION_SCRIPT_FILENAME = $(APPLICATION_NAMESPACE).js
endif

#
# Full application classname
#
ifndef APPLICATION_CLASSNAME
  APPLICATION_CLASSNAME = $(APPLICATION_NAMESPACE).Application
endif









###################################################################################
# INCLUDE EXTERNAL MAKEFILES
###################################################################################

include $(QOOXDOO_PATH)/frontend/framework/tool/make/compute.mk
include $(QOOXDOO_PATH)/frontend/framework/tool/make/impl.mk
