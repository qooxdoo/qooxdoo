CONTRIB_UTIL = python $(QOOXDOO_CONTRIB_PATH)/tool/contrib.py

ifneq ($(CONTRIBS),)
	MANIFESTS = $(patsubst %, --manifest %/Manifest.js , $(CONTRIBS))	
	
	APPLICATION_ADDITIONAL_CLASS_PATH += $(shell $(CONTRIB_UTIL) $(MANIFESTS) --class-path)
	APPLICATION_ADDITIONAL_CLASS_URI += $(shell $(CONTRIB_UTIL) $(MANIFESTS) --class-uri)
	
	APPLICATION_ADDITIONAL_BUILD_OPTIONS += $(shell $(CONTRIB_UTIL) $(MANIFESTS) --resource-flags-build)
	APPLICATION_ADDITIONAL_SOURCE_OPTIONS += $(shell $(CONTRIB_UTIL) $(MANIFESTS) --resource-flags-source)
endif
