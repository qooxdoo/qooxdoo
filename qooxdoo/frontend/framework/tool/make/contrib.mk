
ifneq ($(APPLICATION_INCLUDES),)
	
	QOOXDOO_CONTRIB_CACHE = $(FRAMEWORK_PATH)/.contribs

	DOWNLOAD_CONTRIBS = $(filter qooxdoo-contrib://%, $(APPLICATION_INCLUDES))
	LOCAL_CONTRIBS = $(filter-out qooxdoo-contrib://%, $(APPLICATION_INCLUDES))

	MANIFESTS = $(patsubst qooxdoo-contrib://%, --manifest $(QOOXDOO_CONTRIB_CACHE)/contribution/%/Manifest.js , $(DOWNLOAD_CONTRIBS))
	MANIFESTS += $(patsubst %, --manifest %/Manifest.js , $(LOCAL_CONTRIBS))		
	
	APPLICATION_ADDITIONAL_CLASS_PATH += $(shell $(CMD_CONTRIB) $(MANIFESTS) --class-path)
	APPLICATION_ADDITIONAL_CLASS_URI += $(shell $(CMD_CONTRIB) $(MANIFESTS) --class-uri)
	
	APPLICATION_ADDITIONAL_BUILD_OPTIONS += $(shell $(CMD_CONTRIB) $(MANIFESTS) --resource-flags-build)
	APPLICATION_ADDITIONAL_SOURCE_OPTIONS += $(shell $(CMD_CONTRIB) $(MANIFESTS) --resource-flags-source)
endif


exec-download-contribs:
	$(SILENCE) $(CMD_PYTHON) $(FRAMEWORK_TOOL_PATH)/make/download-contrib.py \
		$(patsubst qooxdoo-contrib://%, --contrib %, $(DOWNLOAD_CONTRIBS)) \
		--contrib-cache "$(QOOXDOO_CONTRIB_CACHE)"

