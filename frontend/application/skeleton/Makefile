################################################################################
# REQUIRED SETTINGS
################################################################################

#
# Location of your qooxdoo distribution
# Could be relative from this location or absolute
# This should end with the last directory. Please omit a trailing slash.
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
# MORE SETTINGS
################################################################################

#
# Please take a look at $(QOOXDOO_PATH)/frontend/framework/tool/make/application.mk
# for an overview of available options.
#






################################################################################
# INCLUDE CORE
################################################################################

ifneq ($(QOOXDOO_PATH),PLEASE_DEFINE_QOOXDOO_PATH)
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/targets.mk
	include $(QOOXDOO_PATH)/frontend/framework/tool/make/application.mk
endif

error:
	@echo "  * Please configure QOOXDOO_PATH"
