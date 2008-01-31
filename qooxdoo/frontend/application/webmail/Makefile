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
APPLICATION_NAMESPACE = webmail
APPLICATION_API_TITLE = WebMail
APPLICATION_THEME_ICON = qx.theme.icon.CrystalClear
APPLICATION_RESOURCE_FILTER = true
APPLICATION_COMPLETE_SOURCE = false
APPLICATION_PUBLISH_PATH = root@qooxdoo.org:/var/www/qooxdoo/demo/$(FRAMEWORK_VERSION)/$(APPLICATION_NAMESPACE)
APPLICATION_FILES = index.html
APPLICATION_TEMPLATE_INPUT = index.xhtml.tmpl
APPLICATION_TEMPLATE_OUTPUT = index.xhtml
APPLICATION_OBFUSCATE_ACCESSORS = true




################################################################################
# INCLUDE CORE
################################################################################

ifneq ($(QOOXDOO_PATH),PLEASE_DEFINE_QOOXDOO_PATH)
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/targets.mk
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/application.mk
endif

error:
	@echo "  * Please configure QOOXDOO_PATH"

distclean:
	@rm -f source/index.xhtml
