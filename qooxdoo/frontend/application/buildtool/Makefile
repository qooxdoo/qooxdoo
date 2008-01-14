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

APPLICATION_NAMESPACE = buildtool
APPLICATION_FILES = index.html help_overview.html
APPLICATION_COMPLETE_SOURCE = true

#APPLICATION_ADDITIONAL_SOURCE_OPTIONS = --include $(APPLICATION_NAMESPACE).*
#QOOXDOO_CONTRIB_PATH = ../..
#APPLICATION_INCLUDES = $(QOOXDOO_CONTRIB_PATH)/Inspector/trunk
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
DOC2ADMIN_XML = tool/buildtool/bin/mk-doc2admin-json.xsl
MAK_VARS = applicationvars.js
CMD_XSLT = xsltproc
CMD_COPY = cp -f

# Source Targets

# check some outside dependencies
check-framework: $(FRAMEWORK_CACHE_PATH)

$(FRAMEWORK_CACHE_PATH):
	@(cd $(FRAMEWORK_PATH) && make)

# the next one is an alias for the real target
source-makvars: check-framework gen-vardata

# this target is less readable, but is actually *checked* by make
gen-vardata: $(DOC2ADMIN_XML) $(FRAMEWORK_TOOL_PATH)/make/application.mk
	@echo
	@echo "  GENERATION OF BUILD TOOL DATA"
	@$(CMD_LINE)
	@echo "  * Generating source/script/applicationvars.js..."
	@$(CMD_DIR) $(APPLICATION_SOURCE_PATH)/script
	@$(CMD_PYTHON) $(FRAMEWORK_TOOL_PATH)/make/makefile_doc.py \
	  -e $(FRAMEWORK_TOOL_PATH)/make/application.mk > $(TMP_XML)
	@$(CMD_XSLT) $(DOC2ADMIN_XML) $(TMP_XML) > \
	  $(APPLICATION_SOURCE_PATH)/script/$(MAK_VARS)

# Build Targets

# just fix the source thing, and copy it over
build-makvars: source-makvars
	@$(CMD_COPY) $(APPLICATION_SOURCE_PATH)/script/$(MAK_VARS) \
	  $(APPLICATION_BUILD_PATH)/script

# Framework Interface
source-addon: source-makvars
build-addon: build-makvars

# 
# Special Target 'deploy'  -- construct a directory which contains everything
#   to export this application
#
deploy: exec-deploy

exec-deploy: build
	@echo
	@echo "  GENERATION OF DEPLOY VERSION OF BUILD TOOL"
	@$(CMD_LINE)
	@echo "  * Creating ./deploy..."
	@$(CMD_DIR) ./deploy
	@cp -fr ./build/* ./deploy
	@cp -fr ./tool/buildtool/* ./deploy
	@cp -fr ./buildtool_start.* ./deploy


#TESTDEPS = 1

ifdef TESTDEPS
	CLASSFILES = $(shell find $(APPLICATION_SOURCE_PATH)/class -name '.svn' -prune -o -name '*.js' -print)
	FRAMEFILES = $(shell find $(FRAMEWORK_SOURCE_PATH) -name '.svn' -prune -o -name '*.js' ! -name '__init__.js' -print)
endif

#source/script/buildtool.js: $(CLASSFILES) $(FRAMEFILES)
bingo: $(CLASSFILES) $(FRAMEFILES)
	#make source
	@echo $(FRAMEFILES)
	touch bingo
