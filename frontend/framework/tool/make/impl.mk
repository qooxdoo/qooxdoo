###################################################################################
# COMMAND SETTINGS
###################################################################################

#
# Configure commands
#
CMD_PYTHON = python
CMD_NICE = nice -n $(COMPUTED_COMMON_NICE)
CMD_GENERATOR = $(CMD_NICE) $(CMD_PYTHON) $(FRAMEWORK_PATH)/tool/generator.py --cache-directory $(FRAMEWORK_CACHE_PATH)
CMD_CLDR = $(CMD_NICE) $(CMD_PYTHON) $(FRAMEWORK_PATH)/tool/modules/cldr.py 
CMD_MSGFMT = $(CMD_NICE) $(CMD_PYTHON) $(FRAMEWORK_PATH)/tool/modules/msgfmt.py
CMD_REMOVE = $(CMD_NICE) rm -rf
CMD_FIND = $(CMD_NICE) find 
CMD_SYNC = $(CMD_NICE) rsync --checksum --recursive --links --safe-links --delete --compress
CMD_LINE = echo "----------------------------------------------------------------------------"





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
	@$(CMD_REMOVE) $(PROJECT_SOURCE_PATH)/$(PROJECT_SCRIPT_FOLDERNAME)
	@$(CMD_REMOVE) $(PROJECT_BUILD_PATH)
	@$(CMD_REMOVE) $(PROJECT_API_PATH)

internal-distclean: internal-realclean
	@$(CMD_FIND) . -name "*~" -o -name "*.bak" -o -name "*.old" | xargs rm -rf
	@$(CMD_REMOVE) $(CACHE)
	@$(CMD_REMOVE) $(PROJECT_DEBUG_PATH)
	@$(CMD_REMOVE) $(PROJECT_TRANSLATION_CLASS_PATH)
	@$(CMD_REMOVE) $(FRAMEWORK_CACHE_PATH)
	@$(CMD_REMOVE) $(FRAMEWORK_TRANSLATION_CLASS_PATH)

job-clean-common:
	@echo "  * Cleaning up..."

exec-clean: job-clean-common internal-clean
exec-realclean: job-clean-common internal-realclean
exec-distclean: job-clean-common internal-distclean
		  
		  
		  


#
# Generator targets
#

exec-script-source:
	@$(CMD_GENERATOR) \
	  $(COMPUTED_INIT_COMPONENT) \
	  $(COMPUTED_CLASS_PATH) \
	  $(COMPUTED_CLASS_URI) \
	  --generate-source-script \
	  --source-script-file $(PROJECT_SOURCE_PATH)/$(PROJECT_SCRIPT_FOLDERNAME)/$(PROJECT_SCRIPT_FILENAME) \
	  --define-runtime-setting $(FRAMEWORK_NAMESPACE).manager.object.AliasManager.resourceUri:$(FRAMEWORK_SOURCE_URI)/resource \
	  $(COMPUTED_SOURCE_INCLUDE) \
	  $(COMPUTED_SOURCE_LINEBREAKS)

exec-script-build:
	@$(CMD_GENERATOR) \
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
	@$(CMD_GENERATOR) \
	  --include-without-dependencies $(PROJECT_NAMESPACE).* \
	  --pretty-print \
	  $(COMPUTED_CLASS_PATH)

exec-fix:
	@$(CMD_GENERATOR) \
	  --include-without-dependencies $(PROJECT_NAMESPACE).* \
	  --fix-source \
	  $(COMPUTED_CLASS_PATH)







#
# Debug targets
#
exec-tokenizer:
	@$(CMD_GENERATOR) \
	  --include-without-dependencies $(PROJECT_NAMESPACE).* \
	  --store-tokens \
    --token-output-directory $(PROJECT_DEBUG_PATH)/tokens \
	  $(COMPUTED_CLASS_PATH)

exec-treegenerator:
	@$(CMD_GENERATOR) \
	  --include-without-dependencies $(PROJECT_NAMESPACE).* \
	  --store-tree \
    --tree-output-directory $(PROJECT_DEBUG_PATH)/tree \
	  $(COMPUTED_CLASS_PATH)
	  
	  







ifdef PROJECT_LOCALES

exec-localization: exec-framework-localization
exec-translation: exec-framework-translation exec-project-translation

else

exec-localization: exec-none
exec-translation: exec-none

endif





exec-framework-localization:
	@echo
	@echo "  PREPARING LOCALIZATION"
	@$(CMD_LINE)
	@mkdir -p $(FRAMEWORK_CACHE_PATH)
	@for LOC in $(PROJECT_LOCALES); do \
	  echo "  * Processing $$LOC"; \
	  mod=0; \
	  if [ ! -r $(FRAMEWORK_CACHE_PATH)/$$LOC.xml ]; then \
	    echo "    - Loading $$LOC.xml..."; \
	    (test -r $(FRAMEWORK_LOCALE_PATH)/$$LOC.xml && cp -f $(FRAMEWORK_LOCALE_PATH)/$$LOC.xml $(FRAMEWORK_CACHE_PATH)/$$LOC.xml) || \
	    (which wget > /dev/null 2>&1 && wget $(FRAMEWORK_CLDR_DOWNLOAD_URI)/$$LOC.xml -q -P $(FRAMEWORK_CACHE_PATH)) || \
      (which curl > /dev/null 2>&1 && curl $(FRAMEWORK_CLDR_DOWNLOAD_URI)/$$LOC.xml -s -o $(FRAMEWORK_CACHE_PATH)/$$LOC.xml); \
	    mod=1; \
	  fi; \
	  if [ ! -r $(FRAMEWORK_CACHE_PATH)/$$LOC.xml ]; then \
	    echo "    - Download failed! Please install wget (preferred) or curl."; \
	    exit 1; \
	  elif [ ! -r $(FRAMEWORK_LOCALE_CLASS_PATH)/$$LOC.js -o $$mod == 1 ]; then \
	    echo "    - Generating $$LOC.js..."; \
	    $(CMD_CLDR) -o $(FRAMEWORK_LOCALE_CLASS_PATH) $(FRAMEWORK_CACHE_PATH)/$$LOC.xml; \
	  fi; \
	done
	
exec-framework-translation:
	@echo
	@echo "  PREPARING FRAMEWORK TRANSLATION"
	@$(CMD_LINE)
	@echo -n "  * Processing source code: "
	@which xgettext > /dev/null 2>&1 || (echo "    - Please install gettext tools (xgettext)" && exit 1)
	@which msginit > /dev/null 2>&1 || (echo "    - Please install gettext tools (msginit)" && exit 1)
	@which msgmerge > /dev/null 2>&1 || (echo "    - Please install gettext tools (msgmerge)" && exit 1)
	
	@mkdir -p $(FRAMEWORK_TRANSLATION_PATH)
	@mkdir -p $(FRAMEWORK_TRANSLATION_CLASS_PATH)
	
	@rm -f $(FRAMEWORK_TRANSLATION_PATH)/messages.pot
	@touch $(FRAMEWORK_TRANSLATION_PATH)/messages.pot
	
	@for FILE in `find $(FRAMEWORK_SOURCE_PATH)/$(FRAMEWORK_CLASS_FOLDERNAME) -name "*.js"`; do \
	  xgettext --language=Java --from-code=UTF-8 \
	    -kthis.trc -kthis.tr -kthis.marktr -kthis.trn:1,2 \
	    -kManager.trc -kManager.tr -kManager.marktr -kManager.trn:1,2 \
	    -j -o $(FRAMEWORK_TRANSLATION_PATH)/messages.pot $$FILE 2> /dev/null; \
	  echo -n "."; \
	done;
	
	@echo ""
	@echo "    - Found `grep msgid $(FRAMEWORK_TRANSLATION_PATH)/messages.pot | wc -l` messages"
	
	@for LOC in $(PROJECT_LOCALES); do \
		echo "  * Processing $$LOC"; \
		if [ ! -r $(FRAMEWORK_TRANSLATION_PATH)/$$LOC.po ]; then \
  		echo "    - Generating initial translation file..."; \
		  msginit --no-translator -i $(FRAMEWORK_TRANSLATION_PATH)/messages.pot -o $(FRAMEWORK_TRANSLATION_PATH)/$$LOC.po > /dev/null 2>&1; \
		else \
	  	echo "    - Merging translation file..."; \
		  msgmerge --update -q $(FRAMEWORK_TRANSLATION_PATH)/$$LOC.po $(FRAMEWORK_TRANSLATION_PATH)/messages.pot; \
		fi; \
    echo "    - Generating catalog..."; \
    mkdir -p $(FRAMEWORK_TRANSLATION_PATH); \
	  $(CMD_MSGFMT) \
	    -n $(FRAMEWORK_TRANSLATION_CLASS_NAMESPACE) \
	    -d $(FRAMEWORK_TRANSLATION_CLASS_PATH) \
	    $(FRAMEWORK_TRANSLATION_PATH)/$$LOC.po; \
	done

exec-project-translation:
	@echo
	@echo "  PREPARING PROJECT TRANSLATION"
	@$(CMD_LINE)
	@echo -n "  * Processing source code: "
	
	@which xgettext > /dev/null 2>&1 || (echo "    - Please install gettext tools (xgettext)" && exit 1)
	@which msginit > /dev/null 2>&1 || (echo "    - Please install gettext tools (msginit)" && exit 1)
	@which msgmerge > /dev/null 2>&1 || (echo "    - Please install gettext tools (msgmerge)" && exit 1)
	
	@mkdir -p $(PROJECT_TRANSLATION_PATH)
	@mkdir -p $(PROJECT_TRANSLATION_CLASS_PATH)
	
	@rm -f $(PROJECT_TRANSLATION_PATH)/messages.pot
	@touch $(PROJECT_TRANSLATION_PATH)/messages.pot
	
	@for FILE in `find $(PROJECT_SOURCE_PATH)/$(PROJECT_CLASS_FOLDERNAME) -name "*.js"`; do \
	  xgettext --language=Java --from-code=UTF-8 \
	    -kthis.trc -kthis.tr -kthis.marktr -kthis.trn:1,2 \
	    -kManager.trc -kManager.tr -kManager.marktr -kManager.trn:1,2 \
	    -j -o $(PROJECT_TRANSLATION_PATH)/messages.pot $$FILE 2> /dev/null; \
	  echo -n "."; \
	done;
	
	@echo ""
	@echo "    - Found `grep msgid $(PROJECT_TRANSLATION_PATH)/messages.pot | wc -l` messages"
	
	@for LOC in $(PROJECT_LOCALES); do \
		echo "  * Processing $$LOC"; \
		if [ ! -r $(PROJECT_TRANSLATION_PATH)/$$LOC.po ]; then \
  		echo "    - Generating initial translation file..."; \
		  msginit --no-translator -i $(PROJECT_TRANSLATION_PATH)/messages.pot -o $(PROJECT_TRANSLATION_PATH)/$$LOC.po > /dev/null 2>&1; \
		else \
	  	echo "    - Merging translation file..."; \
		  msgmerge --update -q $(PROJECT_TRANSLATION_PATH)/$$LOC.po $(PROJECT_TRANSLATION_PATH)/messages.pot; \
		fi; \
    echo "    - Generating catalog..."; \
    mkdir -p $(PROJECT_TRANSLATION_PATH); \
	  $(CMD_MSGFMT) \
	    -n $(PROJECT_TRANSLATION_CLASS_NAMESPACE) \
	    -d $(PROJECT_TRANSLATION_CLASS_PATH) \
	    $(PROJECT_TRANSLATION_PATH)/$$LOC.po; \
	done







#
# File copy targets
#
		  
exec-files-build:
	@echo
	@echo "  COPYING OF FILES"
	@$(CMD_LINE)
	@echo "  * Copying files..."
	@mkdir -p $(PROJECT_BUILD_PATH)
	@for file in $(PROJECT_FILES); do \
		echo "    - Processing $$file"; \
		cp -Rf $(PROJECT_SOURCE_PATH)/$$file $(PROJECT_BUILD_PATH)/$$file; \
	done	

exec-files-api:
	@echo
	@echo "  COPYING OF FILES"
	@$(CMD_LINE)
	@echo "  * Copying files..."
	@mkdir -p $(PROJECT_API_PATH)
	@for file in $(APIVIEWER_FILES); do \
		echo "    - Processing $$file"; \
		cp -Rf $(APIVIEWER_SOURCE_PATH)/$$file $(PROJECT_API_PATH)/$$file; \
  done







#
# API targets
#

exec-api-data:
	@$(CMD_GENERATOR) \
	  --generate-api-documentation \
	  --api-documentation-json-file $(PROJECT_API_PATH)/script/apidata.js \
	  $(COMPUTED_CLASS_PATH) \
	  $(COMPUTED_API_INCLUDE)
	  
exec-api-build:
	@$(CMD_GENERATOR) \
	  --class-path $(FRAMEWORK_SOURCE_PATH)/class \
	  --class-path $(APIVIEWER_SOURCE_PATH)/class \
	  --include api \
	  --generate-compiled-script \
	  --compiled-script-file $(PROJECT_API_PATH)/script/$(APIVIEWER_NAMESPACE).js \
	  --optimize-strings --optimize-variables \
	  --copy-resources \
	  --resource-input $(FRAMEWORK_SOURCE_PATH)/resource \
	  --resource-output $(PROJECT_API_PATH)/resource/$(FRAMEWORK_NAMESPACE) \
	  --resource-input $(APIVIEWER_SOURCE_PATH)/resource \
	  --resource-output $(PROJECT_API_PATH)/resource/$(APIVIEWER_NAMESPACE) \
	  --enable-resource-filter \
	  --define-runtime-setting $(FRAMEWORK_NAMESPACE).manager.object.AliasManager.resourceUri:resource/$(FRAMEWORK_NAMESPACE) \
	  --define-runtime-setting $(APIVIEWER_NAMESPACE).Application.resourceUri:resource/$(APIVIEWER_NAMESPACE) \
	  --define-runtime-setting $(APIVIEWER_NAMESPACE).Viewer.title:$(PROJECT_API_TITLE)







#
# Publish targets
#
exec-publish:
	@echo "  * Syncing files..."
	@$(CMD_SYNC) $(PROJECT_BUILD_PATH)/* $(PROJECT_PUBLISH_PATH)







#
# None helper target
#
exec-none: 
	@true



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
