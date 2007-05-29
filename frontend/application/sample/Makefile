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
QOOXDOO_URI = ../../../../../..
APPLICATION_NAMESPACE = sample
APPLICATION_MAKE_TITLE = SAMPLE
APPLICATION_API_TITLE = Sample
APPLICATION_FILES = index.html html css
APPLICATION_PUBLISH_PATH = root@qooxdoo.org:/var/www/qooxdoo/demo/$(FRAMEWORK_VERSION)/$(APPLICATION_NAMESPACE)
APPLICATION_COMPLETE_BUILD = true
APPLICATION_HTML_TO_ROOT_URI = ../..

# For profiling
# APPLICATION_OPTIMIZE_BROWSER = true
# APPLICATION_OPTIMIZE_VARIABLES = false
# APPLICATION_OPTIMIZE_PRIVATE = false

# qx.log.DivAppender is used in the layout and cannot be detected
# automatically
APPLICATION_ADDITIONAL_SOURCE_OPTIONS = --include qx.log.DivAppender
APPLICATION_ADDITIONAL_BUILD_OPTIONS = $(APPLICATION_ADDITIONAL_SOURCE_OPTIONS)

APPLICATION_LOCALES = de de_DE en en_US es es_ES fr fr_FR


################################################################################
# INCLUDE CORE
################################################################################

ifneq ($(QOOXDOO_PATH),PLEASE_DEFINE_QOOXDOO_PATH)
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/targets.mk
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/application.mk
endif

error:
	@echo "  * Please configure QOOXDOO_PATH"





################################################################################
# EXTENSIONS
################################################################################

source:
	@echo
	@echo "  GENERATION OF SAMPLE LAYOUT"
	@$(CMD_LINE)
	@echo "  * Generating source/script/layout.js..."
	@$(CMD_PYTHON) tool/layout.py source/script/layout.js source/html

build:
	@echo
	@echo "  GENERATION OF SAMPLE LAYOUT"
	@$(CMD_LINE)
	@echo "  * Generating build/script/layout.js..."
	@$(CMD_PYTHON) tool/layout.py build/script/layout.js build/html

clean:
	@$(CMD_REMOVE) source/script/layout.js
	@$(CMD_REMOVE) build/script/layout.js

