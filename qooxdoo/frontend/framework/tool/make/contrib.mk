
ifneq ($(APPLICATION_INCLUDES),)
	MANIFESTS = $(patsubst %, --manifest %/Manifest.js , $(APPLICATION_INCLUDES))	
	
	APPLICATION_ADDITIONAL_CLASS_PATH += $(shell $(CMD_CONTRIB) $(MANIFESTS) --class-path)
	APPLICATION_ADDITIONAL_CLASS_URI += $(shell $(CMD_CONTRIB) $(MANIFESTS) --class-uri)
	
	APPLICATION_ADDITIONAL_BUILD_OPTIONS += $(shell $(CMD_CONTRIB) $(MANIFESTS) --resource-flags-build)
	APPLICATION_ADDITIONAL_SOURCE_OPTIONS += $(shell $(CMD_CONTRIB) $(MANIFESTS) --resource-flags-source)
endif
