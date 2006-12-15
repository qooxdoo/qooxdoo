###################################################################################
# TARGETS
###################################################################################

#
# Target definitions
#

.PHONY: build source api all pretty fix help clean realclean distclean publish debug

source: info-source exec-locales exec-script-source
build: info-build exec-locales exec-script-build exec-files-build
api: info-api exec-locales exec-api-build exec-api-data exec-files-api
all: source build api

pretty: info-pretty exec-pretty
fix: info-fix exec-fix

help: info-help

clean: info-clean exec-clean
realclean: info-realclean exec-realclean
distclean: info-distclean exec-distclean

publish: build info-publish exec-publish

debug: info-debug exec-tokenizer exec-treegenerator
