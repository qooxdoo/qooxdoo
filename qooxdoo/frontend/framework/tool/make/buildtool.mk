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
#
################################################################################

#
# Build Tool Settings
#
BUILDTOOL_NAMESPACE = buildtool
BUILDTOOL_NAMESPACE_PATH = $(shell echo $(BUILDTOOL_NAMESPACE) | sed s:\\.:/:g)
BUILDTOOL_PATH = $(QOOXDOO_PATH)/frontend/application/buildtool
BUILDTOOL_SOURCE_PATH = $(BUILDTOOL_PATH)/source
BUILDTOOL_BUILD_PATH  = $(BUILDTOOL_PATH)/build
BUILDTOOL_DEPLOY_PATH  = $(BUILDTOOL_PATH)/deploy


