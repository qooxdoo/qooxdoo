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
# INCLUDE EXTERNAL MAKEFILES
################################################################################

include $(QOOXDOO_PATH)/frontend/framework/tool/make/framework.mk
include $(QOOXDOO_PATH)/frontend/framework/tool/make/apiviewer.mk






################################################################################
# REQUIRED SETTINGS
################################################################################

#
# Path to the folder of your qooxdoo distribution.
# Can either be
# a) a relative path to the location of this Makefile (preferred) or
# b) an absolute path starting at the root of your file system
# Example: If you put the skeleton folder next to the qooxdoo SDK folder,
# you can use the following relative path:
# QOOXDOO_PATH = ../qooxdoo-0.6.5-sdk
# Please note that Windows users should always use relative paths.
# It should end with the last directory. Please omit a trailing slash.
#
ifndef QOOXDOO_PATH
  QOOXDOO_PATH = PLEASE_DEFINE_QOOXDOO_PATH
endif

#
# Namespace of your application e.g. custom
# Even complexer stuff is possible like: net.sf.custom
#
ifndef APPLICATION_NAMESPACE
  APPLICATION_NAMESPACE = custom
endif







################################################################################
# BASIC SETTINGS
################################################################################

#
# Full application classname
#
ifndef APPLICATION_CLASSNAME
  APPLICATION_CLASSNAME = Application
endif

#
# Similar to QOOXDOO_PATH, but from the webserver point of view.
# Starting point is now the application HTML file of the source folder
# (source/index.html by default). In most cases just prepend a "../" to
# QOOXDOO_PATH from above.
# Example: QOOXDOO_URI = ../../qooxdoo-0.6.5-sdk
# This should end with the last directory. Please omit a trailing slash.
#
ifndef QOOXDOO_URI
  QOOXDOO_URI = $(QOOXDOO_PATH)/..
endif

#
# Namespace defined as a directory path.
# Even complexer stuff is possible like: net/sf/custom
# Normally the namespace given will be automatically translated.
#
ifndef APPLICATION_NAMESPACE_PATH
  APPLICATION_NAMESPACE_PATH := $(shell echo $(APPLICATION_NAMESPACE) | sed s:\\.:/:g)
endif

#
# Title used during the make process.
# Default is the uppercase variant of your custom namespace.
#
ifndef APPLICATION_MAKE_TITLE
  APPLICATION_MAKE_TITLE := $(shell echo $(APPLICATION_NAMESPACE) | tr "[:lower:]" "[:upper:]")
endif

#
# Title used in your API viewer
# Default is identical to your custom namespace.
#
ifndef APPLICATION_API_TITLE
  APPLICATION_API_TITLE := $(APPLICATION_NAMESPACE)
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
# To set a specific locale like "en_US" the generic locale "en" has to be added as well
# Example: APPLICATION_LOCALES = en en_US de de_DE es
#
ifndef APPLICATION_LOCALES
  APPLICATION_LOCALES =
endif

#
# Defines the position of the HTML/PHP etc. file used to include your
# application JavaScript code in relation to root directory. The root
# directory meant here is your source or build directory. Even if we
# this is about directories all the time, this setting configure the
# URI and not a file system path.
#
# If your HTML file is placed directly in source/build you can simply use
# the default "." (without quotation) here.
#
# If your HTML file is placed in source/html/page.html you can configure
# this setting to "../" (without quotation) for example.
#
ifndef APPLICATION_HTML_TO_ROOT_URI
  APPLICATION_HTML_TO_ROOT_URI = .
endif







################################################################################
# GENERATOR OPTIONS
################################################################################

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






################################################################################
# RUNTIME SETTINGS
################################################################################

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



#
# Logging settings support
#
ifndef APPLICATION_SOURCE_LOG_LEVEL
  APPLICATION_SOURCE_LOG_LEVEL = debug
endif

ifndef APPLICATION_BUILD_LOG_LEVEL
  APPLICATION_BUILD_LOG_LEVEL = debug
endif

ifndef APPLICATION_SOURCE_LOG_APPENDER
  APPLICATION_SOURCE_LOG_APPENDER = qx.log.NativeAppender
endif

ifndef APPLICATION_BUILD_LOG_APPENDER
  APPLICATION_BUILD_LOG_APPENDER = qx.log.NativeAppender
endif






################################################################################
# SOURCE TEMPLATE SETUP
################################################################################

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







################################################################################
# DETAILED PATH CONFIGURATION
################################################################################

#
# The source folder of your application from the directory which contains the
# Makefile (if defined relatively). This folder should contain all your
# application class files and resources. The default is ./source.
#
ifndef APPLICATION_SOURCE_PATH
  APPLICATION_SOURCE_PATH = ./source
endif

#
# The build folder of your application from the directory which contains the
# Makefile (if defined relatively). This is the folder where the application
# self-contained build is generated to. The default is ./build.
#
ifndef APPLICATION_BUILD_PATH
  APPLICATION_BUILD_PATH = ./build
endif

#
# The API folder of your application from the directory which contains the
# Makefile (if defined relatively). This is the destination target where the
# self-contained API viewer should resist after a "make api".
# The default is ./api.
#
ifndef APPLICATION_API_PATH
  APPLICATION_API_PATH = ./api
endif

#
# Define the debug location from the directory which contains the
# Makefile (if defined relatively). The default is ./debug.
#
ifndef APPLICATION_DEBUG_PATH
  APPLICATION_DEBUG_PATH = ./debug
endif

#
# Define the publishing location from the directory which contains the
# Makefile (if defined relatively). Could be any rsync compatible url/path
# The default is ./publish.
#
ifndef APPLICATION_PUBLISH_PATH
  APPLICATION_PUBLISH_PATH = ./publish
endif









################################################################################
# OUTPUT OPTIONS
################################################################################

#
# Name of the generated script
#
ifndef APPLICATION_SCRIPT_FILENAME
  APPLICATION_SCRIPT_FILENAME = $(APPLICATION_NAMESPACE).js
endif






################################################################################
# ADDITIONAL CONFIGURATION
################################################################################

#
# Additional class paths and URIs.
# These should be comma separated.
# The generator option will be automatically added
#
ifndef APPLICATION_ADDITIONAL_CLASS_PATH
  APPLICATION_ADDITIONAL_CLASS_PATH =
endif

ifndef APPLICATION_ADDITIONAL_CLASS_URI
  APPLICATION_ADDITIONAL_CLASS_URI =
endif

ifndef APPLICATION_ADDITIONAL_SOURCE_OPTIONS
  APPLICATION_ADDITIONAL_SCRIPT_OPTIONS =
endif

ifndef APPLICATION_ADDITIONAL_BUILD_OPTIONS
  APPLICATION_ADDITIONAL_BUILD_OPTIONS =
endif









################################################################################
# INCLUDE EXTERNAL MAKEFILES
################################################################################

include $(QOOXDOO_PATH)/frontend/framework/tool/make/compute.mk
include $(QOOXDOO_PATH)/frontend/framework/tool/make/impl.mk
