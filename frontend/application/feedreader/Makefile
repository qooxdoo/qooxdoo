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
# SETTINGS
################################################################################

QOOXDOO_PATH = ../../..
APPLICATION_NAMESPACE = feedreader
APPLICATION_API_TITLE = FeedReader
APPLICATION_FILES = index.html
APPLICATION_RESOURCE_FILTER = true
APPLICATION_COMPLETE_SOURCE = false
APPLICATION_PUBLISH_PATH = root@qooxdoo.org:/var/www/qooxdoo/demo/$(FRAMEWORK_VERSION)/$(APPLICATION_NAMESPACE)
APPLICATION_BUILD_LOG_LEVEL = error

APPLICATION_THEME=qx.theme.Ext

#APPLICATION_LOCALES = en de tr it es sv ru fr
APPLICATION_LOCALES = de es en


PROFILE_SOURCE = true
PROFILE_BUILD = true

ifeq ($(PROFILE_SOURCE),true)
	APPLICATION_ADDITIONAL_SOURCE_OPTIONS = --add-require qx.Class:qx.dev.Profile --use-variant qx.aspects:on
endif

ifeq ($(PROFILE_BUILD),true)
	APPLICATION_ADDITIONAL_BUILD_OPTIONS = --add-require qx.Class:qx.dev.Profile --use-variant qx.aspects:on
else
  APPLICATION_ADDITIONAL_BUILD_OPTIONS = --use-variant qx.aspects:off
endif



################################################################################
# INCLUDE CORE
################################################################################

ifneq ($(QOOXDOO_PATH),PLEASE_DEFINE_QOOXDOO_PATH)
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/targets.mk
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/application.mk
endif

error:
	@echo "  * Please configure QOOXDOO_PATH"
