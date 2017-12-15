#!/bin/bash
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#
#  License:
#    MIT: https://opensource.org/licenses/MIT
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Henner Kollmann (hkollmann)
#
################################################################################
export GH_USER_EMAIL=dummy
export TRAVIS_BRANCH=master
.travis/prepare_npm
.travis/make-release-sdk
.travis/build-site
npm pack