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

	DOWNLOAD_CONTRIBS = $(filter contrib://%, $(APPLICATION_INCLUDES))
	LOCAL_CONTRIBS = $(filter-out contrib://%, $(APPLICATION_INCLUDES))

	MANIFESTS = $(patsubst contrib://%, --manifest $(QOOXDOO_CONTRIB_CACHE)/contribution/%/Manifest.js , $(DOWNLOAD_CONTRIBS))
	MANIFESTS += $(patsubst %, --manifest %/Manifest.js , $(LOCAL_CONTRIBS))		

	CONTRIB_ARGS = \
	  --application-build-path $(APPLICATION_BUILD_PATH) \
	  --application-to-root-uri $(APPLICATION_HTML_TO_ROOT_URI) \
	  $(MANIFESTS)

	APPLICATION_ADDITIONAL_CLASS_PATH += `$(CMD_CONTRIB) $(CONTRIB_ARGS) --class-path`
	APPLICATION_ADDITIONAL_CLASS_URI += `$(CMD_CONTRIB) $(CONTRIB_ARGS) --class-uri`
	
	APPLICATION_ADDITIONAL_BUILD_OPTIONS += `$(CMD_CONTRIB) $(CONTRIB_ARGS) --resource-flags-build`
	APPLICATION_ADDITIONAL_SOURCE_OPTIONS += `$(CMD_CONTRIB) $(CONTRIB_ARGS) --resource-flags-source`
endif


exec-download-contribs:
	$(SILENCE) $(CMD_DOWNLOAD_CONTRIB) \
		$(patsubst contrib://%, --contrib %, $(DOWNLOAD_CONTRIBS)) \
		--contrib-cache "$(QOOXDOO_CONTRIB_CACHE)"
