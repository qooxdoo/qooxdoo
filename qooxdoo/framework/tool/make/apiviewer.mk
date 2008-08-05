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

#
# API-Viewer Settings
#
APIVIEWER_NAMESPACE = apiviewer
APIVIEWER_NAMESPACE_PATH = $(shell echo $(APIVIEWER_NAMESPACE) | sed s:\\.:/:g)
APIVIEWER_PATH = $(QOOXDOO_PATH)/frontend/application/apiviewer
APIVIEWER_SOURCE_PATH = $(APIVIEWER_PATH)/source
APIVIEWER_FILES = index.html
