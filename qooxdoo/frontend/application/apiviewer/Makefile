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
APPLICATION_NAMESPACE = apiviewer
APPLICATION_MAKE_TITLE = API VIEWER
APPLICATION_API_TITLE = ApiViewer
APPLICATION_FILES = index.html
APPLICATION_RESOURCE_FILTER = true
APPLICATION_COMPLETE_SOURCE = false
APPLICATION_PUBLISH_PATH = root@qooxdoo.org:/var/www/qooxdoo/demo/$(FRAMEWORK_VERSION)/$(APPLICATION_NAMESPACE)
APPLICATION_BUILD_LOG_LEVEL = error



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
	@$(CMD_GENERATOR) \
		--disable-internal-check \
	  --generate-api-documentation \
	  --api-separate-files \
	  --add-new-lines \
	  --api-documentation-json-file $(APPLICATION_SOURCE_PATH)/script/apidata.js \
	  --api-documentation-index-file $(APPLICATION_SOURCE_PATH)/script/apiindex.js \
	  --class-path $(FRAMEWORK_SOURCE_PATH)/class

build:
	@$(CMD_GENERATOR) \
	  --generate-api-documentation \
	  --api-separate-files \
	  --api-documentation-json-file $(APPLICATION_BUILD_PATH)/script/apidata.js \
	  --api-documentation-index-file $(APPLICATION_BUILD_PATH)/script/apiindex.js \
	  --class-path $(FRAMEWORK_SOURCE_PATH)/class

clean:
	@$(CMD_REMOVE) source/script
	@$(CMD_REMOVE) build/script
