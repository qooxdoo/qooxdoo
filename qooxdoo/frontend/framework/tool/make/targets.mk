################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Andreas Ecker (ecker)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

###################################################################################
# TARGETS
###################################################################################

#
# Target definitions
#

.PHONY: source build api all locales pretty fix help clean distclean publish debug test lint

source: info-source exec-download-contribs exec-localization exec-translation exec-script-source source-addon
build: info-build exec-download-contribs exec-localization exec-translation exec-script-build exec-script-build-opt exec-files-build build-addon
build-split: info-build exec-download-contribs exec-localization exec-translation exec-script-build-split exec-files-build build-addon
api: info-api exec-download-contribs exec-localization exec-translation exec-api-build exec-api-data exec-files-api
test: info-test exec-localization exec-translation exec-testrunner-build exec-tests-build
test-source: info-test exec-localization exec-translation exec-testrunner-build exec-tests-source
buildtool: info-buildtool exec-localization exec-translation exec-buildtool-build exec-files-buildtool
all: source build api

source-addon: exec-none
build-addon: exec-none

locales: exec-localization exec-translation

migration: exec-migration
pretty: info-pretty exec-pretty
fix: info-fix exec-fix

help: info-help

clean: info-clean exec-clean
distclean: info-distclean exec-distclean

publish: build info-publish exec-publish

debug: info-debug exec-tokenizer exec-treegenerator
