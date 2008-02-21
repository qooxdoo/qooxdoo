################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

####################################################################################
# BASIC SETTINGS
####################################################################################

QOOXDOO_PATH = ../../..
APPLICATION_NAMESPACE = demobrowser
APPLICATION_CLASSNAME = Application
APPLICATION_MAKE_TITLE = DEMO BROWSER
APPLICATION_API_TITLE = Demo Browser
APPLICATION_FILES = index.html
APPLICATION_RESOURCE_FILTER = true
APPLICATION_LINEBREAKS_BUILD = true
APPLICATION_LINEBREAKS_SOURCE = true
APPLICATION_COMPLETE_BUILD = false
APPLICATION_COMPLETE_SOURCE = false
APPLICATION_BUILD_LOG_LEVEL = error




####################################################################################
# INCLUDE CORE
####################################################################################

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
	@echo "  GENERATION OF DEMO BROWSER DATA"
	@$(CMD_LINE)
	@echo "  * Generating $(APPLICATION_SOURCE_PATH)/$(APPLICATION_SCRIPT_FOLDERNAME)/demodata.js..."
	@$(CMD_PYTHON) tool/gendata.py $(APPLICATION_SOURCE_PATH)/$(APPLICATION_SCRIPT_FOLDERNAME)/demodata.js $(APPLICATION_SOURCE_PATH)/html

build:
	@echo
	@echo "  GENERATION OF DEMO BROWSER DATA"
	@$(CMD_LINE)
	@echo "  * Generating $(APPLICATION_BUILD_PATH)/$(APPLICATION_SCRIPT_FOLDERNAME)/demodata.js..."
	@$(CMD_PYTHON) tool/gendata.py $(APPLICATION_BUILD_PATH)/$(APPLICATION_SCRIPT_FOLDERNAME)/demodata.js $(APPLICATION_BUILD_PATH)/html

clean:
	@$(CMD_REMOVE) $(APPLICATION_SOURCE_PATH)/$(APPLICATION_SCRIPT_FOLDERNAME)/demodata.js
	@$(CMD_REMOVE) $(APPLICATION_BUILD_PATH)/$(APPLICATION_SCRIPT_FOLDERNAME)/demodata.js