#! /usr/bin/env python

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
#    * Daniel Wagner (d_wagner)
#
################################################################################

import unittest
import sys, os

libDir = os.path.abspath(os.path.join(os.pardir, os.pardir, "pylib"))
sys.path.append(libDir)
adminDir = os.path.abspath(os.path.join(os.pardir, os.pardir, "admin", "bin"))
sys.path.insert(0, adminDir)
from repository import LibraryValidator

class TestLibraryValidator(unittest.TestCase):

    #def setUp(self):
    #    pass

    #def tearDown(self):
    #    pass
    
    def testNoConfig(self):
        lv = LibraryValidator()
        self.failUnless(lv.isValid("someLib", "someType", "someVersion", ["qxVer1", "qxVer2"]))
        
    def testNoLibraries(self):
        conf = {}
        lv = LibraryValidator(conf)
        self.failUnless(lv.isValid("someLib", "someType", "someVersion", ["qxVer1", "qxVer2"]))
    
    def testNoIncludes(self):
        conf = {
          "libraries" : {}
        }
        lv = LibraryValidator(conf)
        self.failUnless(lv.isValid("someLib", "someType", "someVersion", ["qxVer1", "qxVer2"]))
    
    def testIncludeAll(self):
        conf = { 
          "libraries" : {
            "include" : {
              "*" : {}
            }
          } 
        }
        lv = LibraryValidator(conf)
        self.failUnless(lv.isValid("someLib", "someType", "someVersion", ["qxVer1", "qxVer2"]))
    
    def testIncludeByName(self):
        conf = { 
          "libraries" : {
            "include" : {
              "fooLib" : {}
            }
          } 
        }
        lv = LibraryValidator(conf)
        self.failUnless(lv.isValid("fooLib", "someType", "someVersion", ["qxVer1", "qxVer2"]))
        self.failIf(lv.isValid("barLib", "someType", "someVersion", ["qxVer1", "qxVer2"]))
    
    def testIncludeExplicit(self):
        conf = {
          "libraries" :
          {
            "include" : {
              "fooLib" : {
                "types" : ["contribution", "widget"],
                "versions" : ["trunk", "1.0"],
                "qooxdoo-versions" : ["1.0.1", "1.1"]
              }
            }
          }
        }
        lv = LibraryValidator(conf)
        
        self.failUnless(lv.isValid("fooLib", "widget", "1.0", ["trunk", "1.1"]), "Valid library deemed invalid!")
        self.failIf(lv.isValid("barLib", "someType", "someVersion", ["qxVer1", "qxVer2"]), "Library with excluded name validated!")
        self.failIf(lv.isValid("fooLib", "backend", "1.0", ["trunk", "1.1"]), "Library with excluded type validated!")
        self.failIf(lv.isValid("fooLib", "contribution", "0.1", ["trunk", "1.1"]), "Library with excluded version validated!")
        self.failIf(lv.isValid("fooLib", "contribution", "1.0", ["trunk"]), "Library with excluded qooxdoo version validated!")
    
    def testIncludeWildcardLib(self):
        conf = {
          "libraries" :
          {
            "include" : {
              "*" : {
                "types" : ["contribution", "widget"],
                "versions" : ["trunk", "1.0"],
                "qooxdoo-versions" : ["1.0.1", "1.1"]
              }
            }
          }
        }
        lv = LibraryValidator(conf)
        self.failUnless(lv.isValid("fooLib", "widget", "1.0", ["trunk", "1.1"]), "Valid library deemed invalid!")
        
    def testIncludeWildcardAttribs(self):
        conf = {
          "libraries" :
          {
            "include" : {
              "fooLib" : {
                "types" : ["*"],
                "versions" : ["*"],
                "qooxdoo-versions" : ["*"]
              }
            }
          }
        }
        lv = LibraryValidator(conf)
        self.failUnless(lv.isValid("fooLib", "widget", "1.0", ["trunk", "1.1"]), "Valid library deemed invalid!")
    
    def testExcludeLibrary(self):
        conf = {
          "libraries" :
          {
            "include" : {
              "*" : {}
            },
            "exclude" : {
              "fooLib" : {
                "types" : ["*"],
                "versions" : ["*"],
                "qooxdoo-versions" : ["*"]
              }
            }
          }
        }
        lv = LibraryValidator(conf)
        self.failIf(lv.isValid("fooLib", "widget", "1.0", ["trunk", "1.1"]), "Invalid library not excluded!")
    
    def testExcludeByAttributes(self):
        conf = {
          "libraries" :
          {
            "include" : {
              "*" : {}
            },
            "exclude" : {
              "fooLib" : {
                "types" : ["badType"],
                "versions" : ["badVersion"],
                "qooxdoo-versions" : ["badQxVersion"]
              }
            }
          }
        }
        lv = LibraryValidator(conf)
        self.failUnless(lv.isValid("fooLib", "goodType", "goodVersion", ["goodQxVersion", "badQxVersion"]), "Invalid library not excluded!")
        self.failIf(lv.isValid("fooLib", "badType", "goodVersion", ["goodQxVersion"]), "Invalid library not excluded!")
        self.failIf(lv.isValid("fooLib", "goodType", "badVersion", ["goodQxVersion"]), "Invalid library not excluded!")
        self.failIf(lv.isValid("fooLib", "goodType", "goodVersion", ["badQxVersion"]), "Invalid library not excluded!")
     

if __name__ == '__main__':
    unittest.main()
