################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

#
# TestRunner/UnitTest Settings
#
TESTRUNNER_NAMESPACE = testrunner
TESTRUNNER_NAMESPACE_PATH = $(shell echo $(TESTRUNNER_NAMESPACE) | sed s:\\.:/:g)
TESTRUNNER_PATH = $(QOOXDOO_PATH)/frontend/application/testrunner
TESTRUNNER_SOURCE_PATH = $(TESTRUNNER_PATH)/source
TESTRUNNER_BUILD_PATH  = $(TESTRUNNER_PATH)/build


