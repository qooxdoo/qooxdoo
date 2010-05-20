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

import os, sys
import optparse
import shutil
import filecmp

libPath = os.path.abspath(os.path.join(os.pardir))
sys.path.append(libPath)
from misc.ExtendAction import ExtendAction

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


def getComputedConf():
    parser = optparse.OptionParser(option_class=ExtendAction)
    
    usage_str = '''%prog [options] SOURCE TARGET
  
  copy file or directory SOURCE to directory TARGET'''
    
    parser.set_usage(usage_str)
  
    parser.add_option(
      "-u", "--update-only", dest="update", action="store_true", default=False,
      help="only overwrite existing files if the source file is newer"
    )
    
    parser.add_option(
      "-n", "--no-new-dirs", dest="create", action="store_false", default=True,
      help="do not create any source directories that don't already exist in the target path"
    )
    
    parser.add_option(
      "-x", "--exclude", dest="exclude", default=[], action="extend", type="string",
      help="list of file or directory names that should not be copied"
    )
    
    (options, args) = parser.parse_args()
  
    return (options, args)


def main():
    (options,args) = getComputedConf()
    
    if not len(args) == 2:
        print "Missing argument, use -h for help."
        sys.exit(1)

    copier = CopyTool(args[0], args[1], exclude=options.exclude, create=options.create, update=options.update)
    copier.copy()


if __name__ == '__main__':
    try:
        main()
  
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        sys.exit(1)
