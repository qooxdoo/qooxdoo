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

import os
import shutil
import filecmp

class CopyTool:
    def __init__(self, source, targetDir, exclude=[], create=True, update=False):       
        self.source = os.path.abspath(source)
        self.targetDir = os.path.abspath(targetDir)
        self.exclude = exclude
        self.create = create
        self.update = update

  
    def copy(self):
        if not os.path.exists(self.source):
            raise IOError(2, "No such file: '%s'" %self.source)
        if os.path.exists(self.targetDir):
            if os.path.isfile(self.targetDir):
                raise Exception("Expected a directory but '%s' is a file." %self.targetDir)
        if os.path.isfile(self.source):
            self.__copyFileToDir(self.source, self.targetDir)
        if os.path.isdir(self.source):
            self.__copyDirToDir(self.source, self.targetDir)
        
    
    def __copyFileToDir(self, sourceFile, targetDir):
        sourceFileName = os.path.basename(sourceFile)
        if sourceFileName in self.exclude:
            return
        
        if not os.path.isdir(targetDir):
            if self.create:
                os.makedirs(targetDir)
            else:
                raise IOError(2, "No such directory: '%s'" %targetDir)
        
        targetPath = os.path.join(targetDir, sourceFileName)
        
        if os.path.exists(targetPath):
            if os.path.isfile(targetPath):
                if self.update:
                    sourceMod = os.stat(sourceFile).st_mtime
                    targetMod = os.stat(targetPath).st_mtime
                    if targetMod > sourceMod:
                        return 
                
                if not os.access(targetPath, os.W_OK):
                    os.remove(targetPath)
        
        try:
            shutil.copy(sourceFile, targetPath)
        except (IOError, OSError), e:
            print e
    

    def __copyDirToDir(self, sourceDir, targetDir):
        sourceDirName = os.path.basename(sourceDir)
        if sourceDirName in self.exclude:
            return
        targetPath = os.path.join(targetDir, sourceDirName)
        if not os.path.isdir(targetPath):
            if self.create:
                os.makedirs(targetPath)
            else:
                raise IOError(2, "No such directory: '%s'" %targetPath)
        
        compare = filecmp.dircmp(sourceDir, targetPath)
        for entry in compare.left_only:
            if entry in self.exclude:
                continue
            entryPath = os.path.join(sourceDir, entry)
            
            if os.path.isfile(entryPath):
                self.__copyFileToDir(entryPath, targetPath)
            if os.path.isdir(entryPath):
                self.__copyDirToDir(entryPath, targetPath)
        
        for entry in compare.common_dirs:
            if entry in self.exclude:
                continue
            entryPath = os.path.join(sourceDir, entry)  
            self.__copyDirToDir(entryPath, targetPath)
            
        for entry in compare.common_files:
            if entry in self.exclude:
                continue
            entryPath = os.path.join(sourceDir, entry)
            self.__copyFileToDir(entryPath, targetPath)
