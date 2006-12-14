###################################################################################
# TARGETS
###################################################################################

#
# Target definitions
#

.PHONY: build source api all clean realclean distclean pretty fix help

build: info-build exec-script-build exec-files-build
source: info-source exec-script-source
api: info-api exec-api-build exec-api-data exec-files-api
all: qx-source qx-build qx-api
pretty: info-pretty exec-pretty
fix: info-fix exec-fix
help: info-help
clean: info-clean exec-clean
realclean: info-realclean exec-realclean
distclean: info-distclean exec-distclean
