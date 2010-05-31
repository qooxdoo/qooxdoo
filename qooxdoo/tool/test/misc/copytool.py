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
import tempfile

libDir = os.path.abspath(os.path.join(os.pardir, os.pardir, "pylib"))
sys.path.append(libDir)
from misc.copytool import CopyTool

class TestCopyTool(unittest.TestCase):

    def setUp(self):
        self.copier = CopyTool()
        self.tempDir = tempfile.mkdtemp()
        self.file1 = os.path.join(self.tempDir, "file1")
        file(self.file1, "w")
        self.file2 = os.path.join(self.tempDir, "file2")
        file(self.file2, "w")
        self.dir1 = os.path.join(self.tempDir, "dir1")
        os.mkdir(self.dir1)
        self.dir2 = os.path.join(self.tempDir, "dir2")
        os.mkdir(self.dir2)

    def tearDown(self):
        shutil.rmtree(self.tempDir)
    
    def testNoSource(self):
        target = os.getcwd()
        self.copier.parse_args(["nothing.txt", target])
        self.failUnlessRaises(IOError, self.copier.do_work)
    
    def testNoTarget(self):
        self.copier.parse_args(["--no-new-dirs", self.file1, "nothing"])
        self.failUnlessRaises(IOError, self.copier.do_work)
    
    def testInvalidTarget(self):
        self.copier.parse_args([self.file1, self.file2])
        self.failUnlessRaises(Exception, self.copier.do_work)
    
    def testFile(self):
        self.copier.parse_args([self.file1, self.dir1])
        self.copier.do_work()
        self.failUnless(os.path.isfile(os.path.join(self.dir1, self.file1)), "Source file was not copied to target directory!")
    
    def testCreateDir(self):
        self.copier.parse_args([self.file1, "newDir"])
        self.copier.do_work()
        self.failUnless(os.path.isdir("newDir"), "Directory was not created!")
        shutil.rmtree("newDir")
    
    def testOverwriteProtectedFile(self):
        source = file(self.file1, "w")
        source.write("source")
        source.close()
        
        targetPath = os.path.join(self.dir2, "file1")
        target = file(targetPath, "w")
        # set target read-only
        os.chmod(targetPath, stat.S_IRUSR)
        
        self.copier.parse_args([self.file1, self.dir2])
        self.copier.do_work()
        
        copied = file(targetPath, "r")
        copiedContent = copied.read()
        shutil.rmtree(targetPath, True)

        self.failUnless(copiedContent == "source", "Failed to overwrite readonly file!")
    
    def testContinueAfterFailedFileCopy(self):
        os.makedirs(os.path.join(self.dir1, "aaa"))
        file(os.path.join(self.dir1, "aaa", "file"), "w")
        os.makedirs(os.path.join(self.dir1, "zzz"))
        file(os.path.join(self.dir1, "zzz", "file"), "w")
        
        os.makedirs(os.path.join(self.dir2, "dir1"))
        os.makedirs(os.path.join(self.dir2, "dir1", "aaa"), 0444)
        os.makedirs(os.path.join(self.dir2, "dir1", "zzz"))
        
        self.copier.parse_args([self.dir1, self.dir2])
        self.copier.do_work()
        self.failUnless(os.path.exists(os.path.join(self.dir2, "dir1", "zzz", "file")), "Stopped working after failed copy!")
    
    def testUpdate(self):
        source = file(self.file1, "w")
        source.write("source")
        source.close()
        sourceMtime = os.stat(self.file1).st_mtime
        # make source file older
        os.utime(self.file1, (sourceMtime - 20000000, sourceMtime - 20000000))
        
        targetPath = os.path.join(self.dir2, "file1")
        file(targetPath, "w")
        
        self.copier.parse_args(["--update-only", self.file1, self.dir2])
        self.copier.do_work()
        
        target = file(targetPath, "r")
        targetContent = target.read()
        shutil.rmtree(targetPath, True)

        self.failIf(targetContent == "source", "Newer target file was overwritten!")
        
        copier = CopyTool()
        copier.parse_args([self.file1, self.dir2])
        copier.do_work()

        target = file(targetPath, "r")
        targetContent = target.read()
        shutil.rmtree(targetPath, True)

        self.failIf(targetContent != "source", "Newer target file was not overwritten!")
    
    def testDirectorySimple(self):
        self.copier.parse_args([self.dir1, self.dir2])
        self.copier.do_work()
        self.failUnless(os.path.isdir(os.path.join(self.dir2, "dir1")), "Source file was not copied to target!")
    
    def testDirectoryDeep(self):
        file(os.path.join(self.dir1, "file1"), "w")
        file(os.path.join(self.dir1, "file2"), "w")
        os.makedirs(os.path.join(self.dir1, "dir1_1", "dir1_1_1"))
        file(os.path.join(self.dir1, "dir1_1", "file1"), "w")
        file(os.path.join(self.dir1, "dir1_1", "file2"), "w")
        file(os.path.join(self.dir1, "dir1_1", "dir1_1_1", "file1"), "w")
        file(os.path.join(self.dir1, "dir1_1", "dir1_1_1", "file2"), "w")
        
        self.copier.parse_args([self.dir1, self.dir2])
        self.copier.do_work()
        comp = filecmp.cmp(os.path.join(self.dir1, "file1"), os.path.join(self.dir2, "dir1", "file1"))
        self.failUnless(comp, "Source file was not copied to target!")
        comp = filecmp.cmp(os.path.join(self.dir1, "file2"), os.path.join(self.dir2, "dir1", "file2"))
        self.failUnless(comp, "Source file was not copied to target!")
        comp = filecmp.cmp(os.path.join(self.dir1, "dir1_1", "file1"), os.path.join(self.dir2, "dir1", "dir1_1", "file1"))
        self.failUnless(comp, "Source file was not copied to target!")
        comp = filecmp.cmp(os.path.join(self.dir1, "dir1_1", "file2"), os.path.join(self.dir2, "dir1", "dir1_1", "file2"))
        self.failUnless(comp, "Source file was not copied to target!")
        comp = filecmp.cmp(os.path.join(self.dir1, "dir1_1", "dir1_1_1", "file1"), os.path.join(self.dir2, "dir1", "dir1_1", "dir1_1_1", "file1"))
        self.failUnless(comp, "Source file was not copied to target!")
        comp = filecmp.cmp(os.path.join(self.dir1, "dir1_1", "dir1_1_1", "file2"), os.path.join(self.dir2, "dir1", "dir1_1", "dir1_1_1", "file2"))
        self.failUnless(comp, "Source file was not copied to target!")    
    
    def testDirectoryUpdate(self):
        sourceDir = os.path.join(self.dir1, "dir1_1")
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
        
        targetDir = os.path.join(self.dir2, "dir1", "dir1_1")
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
        
        self.copier.parse_args(["--update-only", self.dir1, self.dir2])
        self.copier.do_work()
        targetOlder = file(targetOlderPath, "r")
        targetOlderContent = targetOlder.read()
        self.failIf(targetOlderContent == "targetOlder", "Older target file was not updated!")
        
        targetNewer = file(targetNewerPath, "r")
        targetNewerContent = targetNewer.read()
        self.failIf(targetNewerContent == "sourceOlder", "Newer target file was overwritten!")
    
    def testExclude(self):
        self.copier.parse_args(["-x", "dir1", self.dir1, self.dir2])
        self.copier.do_work()
        self.failIf(os.path.exists(os.path.join(self.dir2, "dir1")), "Excluded directory was copied!")
        copier = CopyTool()
        copier.parse_args(["-x", "file1", self.dir1, self.dir2])
        copier.do_work()
        self.failIf(os.path.exists(os.path.join(self.dir2, "file1")), "Excluded file was copied!")
        
    def testSynchronizeDirectories(self):
        syncSourcePath = os.path.join(self.dir1, "sourceFile")
        syncSource = file(syncSourcePath, "w")
        syncTargetPath = os.path.join(self.dir2, "sourceFile")
        
        self.copier.parse_args(["--synchronize", self.dir1, self.dir2])
        self.copier.do_work()
        self.failIf(os.path.isdir(os.path.join(self.dir2, "dir1")), "Directory was copied but should have been synchronized!")
        self.failUnless(os.path.isfile(syncTargetPath), "Directory contents not synchronized!")
        
    def testSynchronizeDirectoriesCreate(self):
        syncSourceDir = os.path.join(self.dir1, "subDir")
        os.makedirs(syncSourceDir)
        syncSourcePath = os.path.join(syncSourceDir, "sourceFile")
        syncSource = file(syncSourcePath, "w")
        
        syncTargetPath = os.path.join(self.dir2, "subDir", "sourceFile")
        
        self.copier.parse_args(["--synchronize", self.dir1, self.dir2])
        self.copier.do_work()
        self.failUnless(os.path.isfile(syncTargetPath), "Directory contents not synchronized!")
    

if __name__ == '__main__':
    unittest.main()