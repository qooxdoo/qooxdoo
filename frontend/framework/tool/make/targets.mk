###################################################################################
# TARGETS
###################################################################################

#
# Target definitions
#

.PHONY: source build api all locales pretty fix help clean distclean publish debug

source: info-source exec-localization exec-translation exec-script-source
build: info-build exec-localization exec-translation exec-script-build exec-files-build
api: info-api exec-localization exec-translation exec-api-build exec-api-data exec-files-api
all: source build api

locales: exec-localization exec-translation

pretty: info-pretty exec-pretty
fix: info-fix exec-fix

help: info-help

clean: info-clean exec-clean
distclean: info-distclean exec-distclean

publish: build info-publish exec-publish

debug: info-debug exec-tokenizer exec-treegenerator
