warning:
	@echo
	@echo "****************************************************************************"
	@echo "  WARNING"
	@echo "----------------------------------------------------------------------------"
	@echo "  This file 'project.mk' has been renamed to 'application.mk'." 
	@echo "  between release 0.6.4 and 0.6.5. You have migrated manually."
	@echo ""
	@echo "  Please replace all occurrences of 'project.mk' in your Makefiles with"
	@echo "  'application.mk'. Remove this file 'projekt.mk' afterwards."
	@echo "****************************************************************************"



source: warning
build: warning
api: warning
all: warning

include $(QOOXDOO_PATH)/frontend/framework/tool/make/application.mk
