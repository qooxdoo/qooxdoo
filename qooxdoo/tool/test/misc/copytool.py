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
import os
import sys
import shutil
import stat
import filecmp

libDir = os.path.abspath(os.path.join(os.pardir, os.pardir, "pylib"))
sys.path.append(libDir)
from misc.copytool import CopyTool

class TestCopyTool(unittest.TestCase):

    def setUp(self):
        file("file1", "w")
        file("file2", "w")
        os.mkdir("dir1")
        os.mkdir("dir2")

    def tearDown(self):
        os.remove("file1")
        os.remove("file2")
        shutil.rmtree("dir1", True)
        shutil.rmtree("dir2", True)
    
    def testNoSource(self):
        target = os.getcwd()
        copier = CopyTool("nothing.txt", target)
        self.failUnlessRaises(IOError, copier.copy)
    
    def testNoTarget(self):
        copier = CopyTool("file1", "nothing", create=False)
        self.failUnlessRaises(IOError, copier.copy)
        
    def testInvalidTarget(self):
        copier = CopyTool("file1", "file2")
        self.failUnlessRaises(Exception, copier.copy)
        
    def testFile(self):
        copier = CopyTool("file1", "dir1")
        copier.copy()
        self.failUnless(os.path.isfile(os.path.join("dir1", "file1")), "Source file was not copied to target directory!")
    
    def testCreateDir(self):
        copier = CopyTool("file1", "newDir")
        copier.copy()
        self.failUnless(os.path.isdir("newDir"), "Directory was not created!")
        shutil.rmtree("newDir")
        
    def testOverwriteProtectedFile(self):
        source = file("file1", "w")
        source.write("source")
        source.close()
        
        targetPath = os.path.join("dir2", "file1")
        target = file(targetPath, "w")
        # set target read-only
        os.chmod(targetPath, stat.S_IRUSR)
        
        copier = CopyTool("file1", "dir2")
        copier.copy()
        
        copied = file(targetPath, "r")
        copiedContent = copied.read()
        shutil.rmtree(targetPath, True)

        self.failUnless(copiedContent == "source", "Failed to overwrite readonly file!")
    
    def testContinueAfterFailedFileCopy(self):
        os.makedirs(os.path.join("dir1", "aaa"))
        file(os.path.join("dir1", "aaa", "file"), "w")
        os.makedirs(os.path.join("dir1", "zzz"))
        file(os.path.join("dir1", "zzz", "file"), "w")
        
        os.makedirs(os.path.join("dir2", "dir1"))
        os.makedirs(os.path.join("dir2", "dir1", "aaa"), 0444)
        os.makedirs(os.path.join("dir2", "dir1", "zzz"))
        
        copier = CopyTool("dir1", "dir2")
        copier.copy()
        self.failUnless(os.path.exists(os.path.join("dir2", "dir1", "zzz", "file")), "Stopped working after failed copy!")
    
    #TODO:
    #def testContinueAfterFailedDirCreation
    
    def testUpdate(self):
        source = file("file1", "w")
        source.write("source")
        source.close()
        sourceMtime = os.stat("file1").st_mtime
        # make source file older
        os.utime("file1", (sourceMtime - 20000000, sourceMtime - 20000000))
        
        targetPath = os.path.join("dir2", "file1")
        file(targetPath, "w")
        
        copier = CopyTool("file1", "dir2", update=True)
        copier.copy()
        
        target = file(targetPath, "r")
        targetContent = target.read()
        shutil.rmtree(targetPath, True)

        self.failIf(targetContent == "source", "Newer target file was overwritten!")
        
        copier = CopyTool("file1", "dir2", update=False)
        copier.copy()

        target = file(targetPath, "r")
        targetContent = target.read()
        shutil.rmtree(targetPath, True)

        self.failIf(targetContent != "source", "Newer target file was not overwritten!")
        
    def testDirectorySimple(self):
        copier = CopyTool("dir1", "dir2")
        copier.copy()
        self.failUnless(os.path.isdir(os.path.join("dir2", "dir1")), "Source file was not copied to target!")
        
    def testDirectoryDeep(self):
        file(os.path.join("dir1", "file1"), "w")
        file(os.path.join("dir1", "file2"), "w")
        os.makedirs(os.path.join("dir1", "dir1_1", "dir1_1_1"))
        file(os.path.join("dir1", "dir1_1", "file1"), "w")
        file(os.path.join("dir1", "dir1_1", "file2"), "w")
        file(os.path.join("dir1", "dir1_1", "dir1_1_1", "file1"), "w")
        file(os.path.join("dir1", "dir1_1", "dir1_1_1", "file2"), "w")
        
        copier = CopyTool("dir1", "dir2")
        copier.copy()
        comp = filecmp.cmp(os.path.join("dir1", "file1"), os.path.join("dir2", "dir1", "file1"))
        self.failUnless(comp, "Source file was not copied to target!")
        comp = filecmp.cmp(os.path.join("dir1", "file2"), os.path.join("dir2", "dir1", "file2"))
        self.failUnless(comp, "Source file was not copied to target!")
        comp = filecmp.cmp(os.path.join("dir1", "dir1_1", "file1"), os.path.join("dir2", "dir1", "dir1_1", "file1"))
        self.failUnless(comp, "Source file was not copied to target!")
        comp = filecmp.cmp(os.path.join("dir1", "dir1_1", "file2"), os.path.join("dir2", "dir1", "dir1_1", "file2"))
        self.failUnless(comp, "Source file was not copied to target!")
        comp = filecmp.cmp(os.path.join("dir1", "dir1_1", "dir1_1_1", "file1"), os.path.join("dir2", "dir1", "dir1_1", "dir1_1_1", "file1"))
        self.failUnless(comp, "Source file was not copied to target!")
        comp = filecmp.cmp(os.path.join("dir1", "dir1_1", "dir1_1_1", "file2"), os.path.join("dir2", "dir1", "dir1_1", "dir1_1_1", "file2"))
        self.failUnless(comp, "Source file was not copied to target!")    
    
    def testDirectoryUpdate(self):
        sourceDir = os.path.join("dir1", "dir1_1")
        os.mkdir(sourceDir)
        sourceOlderPath = os.path.join(sourceDir, "file1")
        sourceOlder = file(sourceOlderPath, "w")
        sourceOlder.write("sourceOlder")
        sourceOlder.close()
        sourceMtime = os.stat(sourceOlderPath).st_mtime
        #make source file older
        os.utime(sourceOlderPath, (sourceMtime - 20000000, sourceMtime - 20000000))
        sourceNewer = file(os.path.join(sourceDir, "file2"), "w")
        sourceNewer.write("sourceNewer")
        sourceNewer.close()
        
        targetDir = os.path.join("dir2", "dir1", "dir1_1")
        os.makedirs(targetDir)
        targetNewerPath = os.path.join(targetDir, "file1")
        targetNewer = file(targetNewerPath, "w")
        targetNewer.write("targetNewer")
        targetNewer.close()
        targetOlderPath = os.path.join(targetDir, "file2")
        targetOlder = file(targetOlderPath, "w")
        targetOlder.write("targetOlder")
        targetOlder.close()
        targetMtime = os.stat(targetOlderPath).st_mtime
        #make source file older
        os.utime(targetOlderPath, (sourceMtime - 20000000, sourceMtime - 20000000))
        
        copier = CopyTool("dir1", "dir2", update=True)
        copier.copy()
        targetOlder = file(targetOlderPath, "r")
        targetOlderContent = targetOlder.read()
        self.failIf(targetOlderContent == "targetOlder", "Older target file was not updated!")
        
        targetNewer = file(targetNewerPath, "r")
        targetNewerContent = targetNewer.read()
        self.failIf(targetNewerContent == "sourceOlder", "Newer target file was overwritten!")
        
    def testExclude(self):
        copier = CopyTool("dir1", "dir2", exclude=["dir1"])
        copier.copy()
        self.failIf(os.path.exists(os.path.join("dir2", "dir1")), "Excluded directory was copied!")
        copier = CopyTool("file1", "dir2", exclude=["file1"])
        copier.copy()
        self.failIf(os.path.exists(os.path.join("dir2", "file1")), "Excluded file was copied!")


if __name__ == '__main__':
    unittest.main()