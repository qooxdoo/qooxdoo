################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007 1&1 Internet AG, Germany, http://www.1and1.org
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Fabian Jakobs (fjakobs)
#
################################################################################

ifneq ($(APPLICATION_INCLUDES),)
	
	QOOXDOO_CONTRIB_CACHE = $(FRAMEWORK_PATH)/.includes

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
  ifneq ($(DOWNLOAD_CONTRIBS),)
		$(SILENCE) $(CMD_DOWNLOAD_CONTRIB) \
			$(patsubst qooxdoo-contrib://%, --contrib %, $(DOWNLOAD_CONTRIBS)) \
			--contrib-cache "$(QOOXDOO_CONTRIB_CACHE)"
  endif