################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1und1.de
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
# SETTINGS
################################################################################

QOOXDOO_PATH = ../../..

APPLICATION_MAKE_TITLE = QUICKSTART
APPLICATION_API_TITLE = Quickstart

APPLICATION_FILES = index.html button.png Application.js
APPLICATION_RESOURCE_FILTER = true
APPLICATION_LOCALES = en

# Generate a single JavaScript file
APPLICATION_SCRIPT_FILENAME = qx.js

APPLICATION_ADDITIONAL_SOURCE_OPTIONS = --exclude-without-dependencies qx.theme.icon.VistaInspirate,qx.theme.icon.NuoveXT,qx.theme.icon.CrystalClear,qx.theme.ext.*,qx.theme.Ext
APPLICATION_ADDITIONAL_BUILD_OPTIONS = --exclude-without-dependencies qx.theme.icon.VistaInspirate,qx.theme.icon.NuoveXT,qx.theme.icon.CrystalClear,qx.theme.ext.*,qx.theme.Ext

APPLICATION_COMPLETE_SOURCE = true
APPLICATION_COMPLETE_BUILD = true

APPLICATION_OPTIMIZE_VARIABLES = false
APPLICATION_OPTIMIZE_REMOVE_DEBUG = false
APPLICATION_OPTIMIZE_REMOVE_COMPATIBILITY = false





################################################################################
# INCLUDE CORE
################################################################################

ifneq ($(QOOXDOO_PATH),PLEASE_DEFINE_QOOXDOO_PATH)
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/targets.mk
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/application.mk
endif

error:
	@echo "  * Please configure QOOXDOO_PATH"
