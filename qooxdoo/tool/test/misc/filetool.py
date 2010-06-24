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
import sys, os, shutil, tempfile

libDir = os.path.abspath(os.path.join(os.pardir, os.pardir, "pylib"))
sys.path.append(libDir)
from misc import filetool

class TestWalk(unittest.TestCase):

    def setUp(self):
        self.tempDirs = [tempfile.mkdtemp()]

    def tearDown(self):
        for dir in self.tempDirs:
          shutil.rmtree(dir)

    
    def testWalkFiles(self):
        fooPath = os.path.join(self.tempDirs[0], "foo.txt")
        foo = file(fooPath, "w")
        foo.close()
        barPath = os.path.join(self.tempDirs[0], "bar.txt")
        bar = file(barPath, "w")
        bar.close()
        
        found = []
        for root, dirs, files in filetool.walk(self.tempDirs[0]):
            for filename in files:
                found.append(filename)
        
        self.failUnlessEqual(found, ["foo.txt", "bar.txt"], "filetool.walk returned unexpected result %s" %repr(found))    
    
    
    def testSymlink(self):
        """
        dir1
            dir2 -> ../dir2
        dir2
            foo.txt
        Should follow the symlink and find foo.txt
        """
        
        self.tempDirs.append(tempfile.mkdtemp())
        symTarget = os.path.basename(self.tempDirs[1])
        symTargetFile = file(os.path.join(self.tempDirs[1], "foo.txt"), "w") 
        symTargetPath = os.path.join(self.tempDirs[0], symTarget)
        os.symlink(self.tempDirs[1], symTargetPath)
        
        
        found = []
        for root, dirs, files in filetool.walk(self.tempDirs[0]):
            for filename in files:
                found.append(filename)
        
        self.failUnlessEqual(found, ["foo.txt"])
        
    
    def testSymlinkMulti(self):
        self.tempDirs.append(tempfile.mkdtemp())
        symTarget = os.path.basename(self.tempDirs[1])
        symTargetFile = file(os.path.join(self.tempDirs[1], "foo.txt"), "w") 
        symTargetPath = os.path.join(self.tempDirs[0], symTarget)
        os.symlink(self.tempDirs[1], symTargetPath)
        
        found1 = []
        for root, dirs, files in filetool.walk(self.tempDirs[0]):
            for filename in files:
                found1.append(filename)
        
        found2 = []
        for root, dirs, files in filetool.walk(self.tempDirs[0]):
            for filename in files:
                found2.append(filename)
        
        self.failUnlessEqual(found1, found2)
    
    
    def testSymlinkCyclic(self):
        """
        dir
            link -> ../dir
            foo.txt
        
        Should find the directories link and link/link, but not link/link/link
        Should find the files foo.txt and link/foo.txt, but not link/link/foo.txt
        """
        symTarget = "link"
        fileInSource = file(os.path.join(self.tempDirs[0], "foo.txt"), "w")
        fileInSource.close()
        symTargetPath = os.path.join(self.tempDirs[0], symTarget)
        os.symlink(self.tempDirs[0], symTargetPath)
        
        expectedDirs = [os.path.join(symTargetPath, symTarget), symTargetPath]
        expectedFiles = [ os.path.join(self.tempDirs[0], symTarget,"foo.txt"),
                          os.path.join(self.tempDirs[0], "foo.txt") ]
        
        foundDirs = []
        foundFiles = []
        for root, dirs, files in filetool.walk(self.tempDirs[0]):
            for dirname in dirs:
                foundDirs.append(os.path.join(root, dirname))
            for filename in files:
                foundFiles.append(os.path.join(root, filename))
        
        self.failUnlessEqual(foundDirs, expectedDirs)
        self.failUnlessEqual(foundFiles, expectedFiles)
        
    
    def testTwoLinksSameTarget(self):
        """
        dir1
            link1 -> ../dir2
            link2 -> ../dir2
        dir2
            foo.txt
        Should follow the symlinks and find foo.txt twice
        """
        
        self.tempDirs.append(tempfile.mkdtemp())
        symTargetFile = file(os.path.join(self.tempDirs[1], "foo.txt"), "w")
        symTarget1 = "link1"
        symTarget1Path = os.path.join(self.tempDirs[0], symTarget1)
        os.symlink(self.tempDirs[1], symTarget1Path)
        symTarget2 = "link2"
        symTarget2Path = os.path.join(self.tempDirs[0], symTarget2)
        os.symlink(self.tempDirs[1], symTarget2Path)
        
        expectedFiles = [ os.path.join(self.tempDirs[0], symTarget2, "foo.txt"),
                          os.path.join(self.tempDirs[0], symTarget1, "foo.txt") ]
        
        foundFiles = []
        for root, dirs, files in filetool.walk(self.tempDirs[0]):
            for filename in files:
                foundFiles.append(os.path.join(root, filename))
        
        self.failUnlessEqual(foundFiles, expectedFiles)


if __name__ == '__main__':
    unittest.main()