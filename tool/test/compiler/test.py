#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2009 1&1 Internet AG, Germany, http://www.1und1.de
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

import unittest, subprocess

class Tests(object):

    def test_compile1(self):
        sourcefile = "test1/t1.js"
        outfile    = "test1/t1.out.js"
        reffile    = "test1/t1.ref.js"
        compilefile = "../bin/compile.py"
        subprocess.open(compilefile, sourcefile, "> %s" % outfile)
        res = compare(outfile, reffile)
        self.assertEqual(res, 0)

class DummyTest(unittest.TestCase):

    def testSomething(self):
        print 'Huhu!'
        self.assertEqual(4-3,1)

if __name__ == "__main__":
    unittest.main()
