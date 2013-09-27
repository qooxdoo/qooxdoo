#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2012 1&1 Internet AG, Germany, http://www.1und1.de
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

##
# scss.py -- a .scss to .css compiler
#
# Command-line wrapper around the pyScss module (SCSS compiler)
##

import sys
import qxenviron

##
# Assure that sufficient Python version is present.
#
# @param fn function
#
def __assurePython26(fn):
    def _fn():
        if sys.version_info >= (2, 6) and sys.version_info < (3, 0):
            fn()
        else:
            sys.exit("No *.scss compilation possible - requires Python 2.6+.")
    return _fn

@__assurePython26
def main():
    from scss import tool
    tool.main()

if __name__ == "__main__":
    main()
