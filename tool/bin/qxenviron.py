################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
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

import sys, os

##
# qxenviron.py -- provide PYTHONPATH extension
##

# assure that sufficient Python version is present.
if sys.version_info < (2, 6) or sys.version_info >= (3, 0):
    sys.exit("Please use Python 2.x (2.6 or above). Your version (Python %d.%d)" \
      " isn't supported.\n" % (sys.version_info[0], sys.version_info[1]))

# calculate script path
scriptDir = os.path.dirname(os.path.abspath(__file__))
QXPYLIB = os.path.normpath(os.path.join(scriptDir, os.pardir, "pylib"))
# extend PYTHONPATH with 'pylib'
sys.path.insert(0, QXPYLIB)
