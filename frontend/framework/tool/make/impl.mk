###################################################################################
# COMMAND SETTINGS
###################################################################################

#
# Configure commands
#
CMD_NICE = @nice -n $(COMPUTED_COMMON_NICE)
CMD_GENERATOR = $(CMD_NICE) $(FRAMEWORK_PATH)/tool/generator.py --cache-directory $(FRAMEWORK_CACHE_PATH)
CMD_REMOVE = $(CMD_NICE) rm -rf
CMD_FIND = $(CMD_NICE) find 
CMD_SYNC = $(CMD_NICE) rsync --checksum --recursive --links --safe-links --delete --compress






###################################################################################
# EXEC TARGETS
###################################################################################

#
# Cleanup targets
#

internal-clean:
	@$(CMD_REMOVE) $(PROJECT_SOURCE_PATH)/$(PROJECT_SCRIPT_FOLDERNAME)/$(PROJECT_SCRIPT_FILENAME) 
	@$(CMD_REMOVE) $(PROJECT_BUILD_PATH)/$(PROJECT_SCRIPT_FOLDERNAME)/$(PROJECT_SCRIPT_FILENAME)

internal-realclean: internal-clean
	$(CMD_REMOVE) $(PROJECT_SOURCE_PATH)/$(PROJECT_SCRIPT_FOLDERNAME)
	$(CMD_REMOVE) $(PROJECT_BUILD_PATH)
	$(CMD_REMOVE) $(PROJECT_API_PATH)

internal-distclean: internal-realclean
	@$(CMD_FIND) . -name "*~" -o -name "*.bak" -o -name "*.old" | xargs rm -rf
	@$(CMD_REMOVE) $(CACHE)

job-clean-common:
	@echo "  * Cleaning up..."

exec-clean: job-clean-common internal-clean
exec-realclean: job-clean-common internal-realclean
exec-distclean: job-clean-common internal-distclean
		  
		  
		  


#
# Generator targets
#

exec-script-source:
	$(CMD_GENERATOR) \
	  $(COMPUTED_INIT_COMPONENT) \
	  $(COMPUTED_CLASS_PATH) \
	  $(COMPUTED_CLASS_URI) \
	  --generate-source-script \
	  --source-script-file $(PROJECT_SOURCE_PATH)/$(PROJECT_SCRIPT_FOLDERNAME)/$(PROJECT_SCRIPT_FILENAME) \
	  --define-runtime-setting qx.manager.object.AliasManager.resourceUri:$(FRAMEWORK_SOURCE_URI)/resource \
	  $(COMPUTED_SOURCE_INCLUDE) \
	  $(COMPUTED_SOURCE_LINEBREAKS)

exec-script-build:
	$(CMD_GENERATOR) \
	  $(COMPUTED_INIT_COMPONENT) \
	  $(COMPUTED_CLASS_PATH) \
	  $(COMPUTED_RESOURCE) \
	  --generate-compiled-script \
	  --compiled-script-file $(PROJECT_BUILD_PATH)/$(PROJECT_SCRIPT_FOLDERNAME)/$(PROJECT_SCRIPT_FILENAME) \
	  $(COMPUTED_BUILD_INCLUDE) \
	  $(COMPUTED_BUILD_OPTIMIZATIONS) \
	  $(COMPUTED_BUILD_LINEBREAKS)





#
# Utility targets
#
exec-pretty:
	$(CMD_GENERATOR) \
	  --include-without-dependencies $(PROJECT_NAMESPACE).* \
	  --pretty-print \
	  $(COMPUTED_CLASS_PATH)

exec-fix:
	$(CMD_GENERATOR) \
	  --include-without-dependencies $(PROJECT_NAMESPACE).* \
	  --fix-source \
	  $(COMPUTED_CLASS_PATH)





#
# Debug targets
#
exec-tokenizer:
	$(CMD_GENERATOR) \
	  --include-without-dependencies $(PROJECT_NAMESPACE).* \
	  --store-tokens \
    --token-output-directory $(PROJECT_DEBUG_PATH)/tokens \
	  $(COMPUTED_CLASS_PATH)

exec-treegenerator:
	$(CMD_GENERATOR) \
	  --include-without-dependencies $(PROJECT_NAMESPACE).* \
	  --store-tree \
    --tree-output-directory $(PROJECT_DEBUG_PATH)/tree \
	  $(COMPUTED_CLASS_PATH)
	  
	  




#
# File copy targets
#
		  
exec-files-build:
	@echo
	@echo "  COPYING OF FILES"
	@echo "--------------------------------------------------------"
	@echo "  * Copying files..."
	@for file in $(PROJECT_FILES); do \
    cp -f $(PROJECT_SOURCE_PATH)/$$file $(PROJECT_BUILD_PATH)/$$file; \
  done	

exec-files-api:
	@echo
	@echo "  COPYING OF FILES"
	@echo "--------------------------------------------------------"
	@echo "  * Copying files..."
	@for file in $(API_FILES); do \
    cp -f $(API_SOURCE_PATH)/$$file $(PROJECT_API_PATH)/$$file; \
  done





#
# CLDR data extraction targets
#

export PROJECT_LOCALES
download_locales:
	@echo
	@echo "  Loading CLDR files"
	@echo "--------------------------------------------------------"
	@echo "  * Loading files..."
	@$(MAKE) -C $(FRAMEWORK_TOOL_PATH)/make -e -f cldr.mk

	  
	  
	 
	  
	  
#
# API targets
#

exec-api-data:
	$(CMD_GENERATOR) \
	  --generate-api-documentation \
	  --api-documentation-json-file $(PROJECT_API_PATH)/script/apidata.js \
	  $(COMPUTED_CLASS_PATH) \
	  $(COMPUTED_API_INCLUDE)
	  
exec-api-build:
	$(CMD_GENERATOR) \
	  --script-input $(FRAMEWORK_SOURCE_PATH)/class \
	  --script-input $(API_SOURCE_PATH)/class \
	  --include api \
	  --generate-compiled-script \
	  --compiled-script-file $(PROJECT_API_PATH)/script/apiviewer.js \
	  --optimize-strings --optimize-variables \
	  --copy-resources \
	  --resource-input $(FRAMEWORK_SOURCE_PATH)/resource \
	  --resource-output $(PROJECT_API_PATH)/resource/qx \
	  --resource-input $(API_SOURCE_PATH)/resource \
	  --resource-output $(PROJECT_API_PATH)/resource/apiviewer \
	  --enable-resource-filter \
	  --define-runtime-setting qx.manager.object.AliasManager.resourceUri:resource/qx \
	  --define-runtime-setting apiviewer.Application.resourceUri:resource/apiviewer \
	  --define-runtime-setting apiviewer.Viewer.title:$(PROJECT_API_TITLE)





#
# Publish targets
#
exec-publish:
	@echo "  * Syncing files..."
	$(CMD_SYNC) $(PROJECT_BUILD_PATH)/* $(PROJECT_PUBLISH_PATH)








###################################################################################
# INFO TARGETS
###################################################################################

info-build:
	@echo 
	@echo "****************************************************************************"
	@echo "  GENERATING $(PROJECT_MAKE_TITLE) BUILD"
	@echo "****************************************************************************"

info-source:
	@echo 
	@echo "****************************************************************************"
	@echo "  GENERATING $(PROJECT_MAKE_TITLE) SOURCE"
	@echo "****************************************************************************"
	
info-api:
	@echo 
	@echo "****************************************************************************"
	@echo "  GENERATING $(PROJECT_MAKE_TITLE) API"
	@echo "****************************************************************************"
	
info-pretty:
	@echo 
	@echo "****************************************************************************"
	@echo "  GENERATING $(PROJECT_MAKE_TITLE) PRETTY"
	@echo "****************************************************************************"
	
info-fix:
	@echo 
	@echo "****************************************************************************"
	@echo "  GENERATING $(PROJECT_MAKE_TITLE) FIX"
	@echo "****************************************************************************"
			
info-help:
	@echo 
	@echo "****************************************************************************"
	@echo "  $(PROJECT_MAKE_TITLE) HELP"
	@echo "****************************************************************************"

info-clean:
	@echo 
	@echo "****************************************************************************"
	@echo "  CLEANING UP $(PROJECT_MAKE_TITLE) BASE"
	@echo "****************************************************************************"

info-realclean:
	@echo 
	@echo "****************************************************************************"
	@echo "  CLEANING UP $(PROJECT_MAKE_TITLE) REAL"
	@echo "****************************************************************************"

info-distclean:
	@echo 
	@echo "****************************************************************************"
	@echo "  CLEANING UP $(PROJECT_MAKE_TITLE) DIST"
	@echo "****************************************************************************"

info-publish:
	@echo 
	@echo "****************************************************************************"
	@echo "  PUBLISHING $(PROJECT_MAKE_TITLE)"
	@echo "****************************************************************************"

info-debug:
	@echo 
	@echo "****************************************************************************"
	@echo "  CREATING DEBUG OUTPUT FOR $(PROJECT_MAKE_TITLE)"
	@echo "****************************************************************************"
