QOOXDOO_PATH = ../..
CMD_REMOVE = rm -rf

include $(QOOXDOO_PATH)/frontend/framework/tool/make/framework.mk

#
# New all target
#
all:
	@echo 
	@echo "****************************************************************************"
	@echo "  GENERATING FRAMEWORK"
	@echo "****************************************************************************"
	@echo ""
	@echo "  WARNING"
	@echo "----------------------------------------------------------------------------"
	@echo "  * The generation of the framework has been moved."
	@echo "    - Please execute your make command in frontend/project/framework"

source: all
build: all
api: all
pretty: all
fix: all
clean: all
realclean: all

distclean:
	@echo 
	@echo "****************************************************************************"
	@echo "  CLEANING UP FRAMEWORK DIST"
	@echo "****************************************************************************"
	@echo "  * Cleaning up..."
	@$(CMD_REMOVE) $(FRAMEWORK_CACHE_PATH)
	@$(CMD_REMOVE) $(FRAMEWORK_LOCALE_CLASS_PATH)
	@$(CMD_REMOVE) $(FRAMEWORK_TRANSLATION_CLASS_PATH)
