################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007 1&1 Internet AG, Germany, http://www.1and1.org
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

QOOXDOO_PATH = ../../../qooxdoo.legacy_0_7_x
QOOXDOO_URI = ../$(QOOXDOO_PATH)
QOOXDOO_VERSION = 0.7.2

APPLICATION_NAMESPACE = qxadmin
APPLICATION_CLASSNAME = Application
APPLICATION_MAKE_TITLE = QxAdmin
APPLICATION_API_TITLE = QxAdmin
APPLICATION_FILES = index.html help_overview.html
APPLICATION_RESOURCE_FILTER = true
APPLICATION_LINEBREAKS_BUILD = true
APPLICATION_LINEBREAKS_SOURCE = true
APPLICATION_COMPLETE_BUILD = false
APPLICATION_COMPLETE_SOURCE = true
APPLICATION_BUILD_LOG_LEVEL = error

#APPLICATION_ADDITIONAL_SOURCE_OPTIONS = --include $(APPLICATION_NAMESPACE).*
QOOXDOO_CONTRIB_PATH = ../..
APPLICATION_INCLUDES = $(QOOXDOO_CONTRIB_PATH)/Inspector/trunk
####################################################################################
# INTERNALS (PLEASE DO NOT CHANGE)
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

TMP_XML = $(FRAMEWORK_CACHE_PATH)/mak.xml
MAK_VARS = makvars.js
CMD_XSLT = xsltproc
CMD_COPY = cp -f

# Source Targets

# check some outside dependencies
check-framework: $(FRAMEWORK_CACHE_PATH)

$(FRAMEWORK_CACHE_PATH):
	@(cd $(FRAMEWORK_PATH) && make)

# the next one is an alias for the real target
source-makvars: check-framework source/script/makvars.js

# this target is less readable, but is actually *checked* by make
source/script/makvars.js: tool/mk-doc2admin-json.xsl $(FRAMEWORK_TOOL_PATH)/make/application.mk
	@echo
	@echo "  GENERATION OF QOOXDOO WEB ADMIN DATA"
	@$(CMD_LINE)
	@echo "  * Generating source/script/makvars.js..."
	@$(CMD_PYTHON) $(FRAMEWORK_TOOL_PATH)/make/makefile_doc.py \
	  -e $(FRAMEWORK_TOOL_PATH)/make/application.mk > $(TMP_XML)
	@$(CMD_XSLT) tool/mk-doc2admin-json.xsl $(TMP_XML) > \
	  $(APPLICATION_SOURCE_PATH)/script/$(MAK_VARS)

# Build Targets

# just fix the source thing, and copy it over
build-makvars: source-makvars
	@$(CMD_COPY) $(APPLICATION_SOURCE_PATH)/script/$(MAK_VARS) \
	  $(APPLICATION_BUILD_PATH)/script

# Framework Interface
source-addon: source-makvars
build-addon: build-makvars
