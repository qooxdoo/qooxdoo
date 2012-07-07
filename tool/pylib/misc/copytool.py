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
#  This code was inspired by pyrobocopy.py, by Anand B Pillai
#  - url: http://code.activestate.com/recipes/231501/
#  - license: http://www.python.org/psf/license/
#    (see also: http://code.activestate.com/help/terms/)
#
################################################################################

import os, sys, re
import optparse
import shutil
import filecmp
import stat

sys.path.append(os.path.abspath(os.pardir))
from misc.ExtendAction import ExtendAction

class DummyConsole(object):
    def debug(self, msg):
        pass
    def error(self, msg):
        print msg


class SkipList(object):

    def __init__(self,lst):
        self._skip_elements   = lst
        self._skip_relist     = [re.compile(e) for e in lst]
        self._skip_expression = re.compile(r'%s' % '|'.join(lst))

    def __contains__(self, e):
        return bool(self._skip_expression.match(e))


class CopyTool(object):
    def __init__(self, console=DummyConsole()):
        self.__console = console

  
    def do_work(self):
        if not os.path.exists(self.__source):
            raise IOError(2, "No such file: '%s'" %self.__source)
        if os.path.exists(self.__targetDir):
            if os.path.isfile(self.__targetDir):
                raise Exception("Expected a directory but '%s' is a file." %self.__targetDir)
        if os.path.isfile(self.__source):
            self.__copyFileToDir(self.__source, self.__targetDir)
        if os.path.isdir(self.__source):
            self.__copyDirToDir(self.__source, self.__targetDir)
        
    
    def __copyFileToDir(self, sourceFile, targetDir):
        self.__console.debug("Copying file %s to directory %s." %(sourceFile, targetDir))
        sourceFileName = os.path.basename(sourceFile)
        if sourceFileName in self.__exclude:
            return
        
        if not os.path.isdir(targetDir):
            if self.__create:
                self.__console.debug("Creating directory %s." %targetDir)
                os.makedirs(targetDir)
            else:
                raise IOError(2, "No such directory: '%s'" %targetDir)
        
        targetPath = os.path.join(targetDir, sourceFileName)
        
        if os.path.exists(targetPath):
            if os.path.isfile(targetPath):
                if self.__update:
                    if not self.__isNewerThan(sourceFile, targetPath):
                        self.__console.debug("Existing file %s is newer than source file %s, ignoring it." %(targetPath, sourceFile))
                        return
                
                if not os.access(targetPath, os.W_OK):
                    self.__console.debug("Removing write-protected target File %s prior to copy." %targetPath)
                    try:
                        os.remove(targetPath)
                    except OSError:
                        try:
                            os.chmod(targetPath, stat.S_IWUSR)
                        except Exception, e:
                            self.__console.error("Unable to overwrite read-only file %s: %s" %(str(e), targetPath))
        
        try:
            shutil.copy(sourceFile, targetPath)
        except (IOError, OSError), e:
            self.__console.error("Error copying file %s to dir %s: %s" %(sourceFile, targetPath, str(e)))
    

    def __isNewerThan(self, sourceFile, targetFile):
        sourceStat = os.stat(sourceFile)
        sourceCreat = sourceStat.st_ctime
        sourceMod = sourceStat.st_mtime
        targetMod = os.stat(targetFile).st_mtime
        
        return (sourceMod > targetMod) or (sourceCreat > targetMod)
    
    
    def __copyDirToDir(self, sourceDir, targetDir, recursive=False):
        self.__console.debug("Copying directory %s to %s." %(sourceDir, targetDir))
        sourceDirName = os.path.basename(sourceDir)
        if sourceDirName in self.__exclude:
            self.__console.debug("Skipping excluded directory %s." %sourceDir)
            return
        
        if self.__synchronize and not recursive:
            targetPath = targetDir
        else:
            targetPath = os.path.join(targetDir, sourceDirName)
        
        if not os.path.isdir(targetPath):
            if self.__create:
                self.__console.debug("Creating directory %s." %targetDir)
                os.makedirs(targetPath)
            else:
                raise IOError(2, "No such directory: '%s'" %targetPath)
        
        compare = filecmp.dircmp(sourceDir, targetPath)
        for entry in compare.left_only:
            entryPath = os.path.join(sourceDir, entry)
            if entry in self.__exclude:
                self.__console.debug("Skipping excluded item %s." %entryPath)
                continue
            
            if os.path.isfile(entryPath):
                self.__copyFileToDir(entryPath, targetPath)
            if os.path.isdir(entryPath):
                self.__copyDirToDir(entryPath, targetPath, True)
        
        for entry in compare.common_dirs:
            entryPath = os.path.join(sourceDir, entry)
            if entry in self.__exclude:
                self.__console.debug("Skipping excluded directory %s." %entryPath)
                continue

            self.__copyDirToDir(entryPath, targetPath, True)
            
        for entry in compare.common_files:
            entryPath = os.path.join(sourceDir, entry)
            if entry in self.__exclude:
                self.__console.debug("Skipping excluded file %s." %entryPath)
                continue
            
            self.__copyFileToDir(entryPath, targetPath)
    
    
    def parse_args(self, argumentList=sys.argv[1:]):
        parser = optparse.OptionParser(option_class=ExtendAction)
        
        usage_str = '''%prog [options] SOURCE TARGET
      
copy file or directory SOURCE to directory TARGET'''
        
        parser.set_usage(usage_str)
      
        parser.add_option(
          "-s", "--synchronize", dest="synchronize", action="store_true", default=False,
          help="synchronize the contents of the source and target directories"
        )
        
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
        
        (options, args) = parser.parse_args(argumentList)
        
        if not len(args) == 2:
            raise RuntimeError( "Missing argument, use -h for help.")
        
        self.__source = os.path.abspath(args[0])
        self.__targetDir = os.path.abspath(args[1])
        self.__synchronize = options.synchronize
        self.__exclude = SkipList(options.exclude)
        self.__create = options.create
        self.__update = options.update



def main():
    copier = CopyTool()
    copier.parse_args()
    copier.do_work()


if __name__ == '__main__':
    try:
        main()
  
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        sys.exit(1)
