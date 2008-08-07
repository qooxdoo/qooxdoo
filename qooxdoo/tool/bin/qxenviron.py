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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import sys, os

##
# qxenviron.py -- provide PYTHONPATH extension
##

# calculate script path
scriptDir = os.path.dirname(os.path.abspath(sys.argv[0])) 
# extend PYTHONPATH with 'pylib'
sys.path.insert(0, 
    os.path.normpath(
        os.path.join( scriptDir, os.pardir, "pylib")))
