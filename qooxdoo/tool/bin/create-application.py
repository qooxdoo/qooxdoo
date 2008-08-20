#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Fabian Jakobs (fjakobs)
#    * Andreas Ecker (ecker)
#
################################################################################

import re
import os
import sys
import optparse
import shutil, errno
from string import Template

import qxenviron
from generator.runtime.Log import Log
from misc import Path


SCRIPT_DIR    = qxenviron.scriptDir
FRAMEWORK_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, os.pardir, os.pardir))
SKELETON_DIR  = os.path.normpath(os.path.join(FRAMEWORK_DIR, "component", "skeleton"))


def createApplication(name, out, namespace, app_type, skeleton_path):

    if sys.platform == 'win32' and re.match( r'^[a-zA-Z]:$', out):
        out = out + '\\'

    if not os.path.isdir(out):
        if os.path.isdir(normalizePath(out)):
            out = normalizePath(out)
        else:
            console.error("Output directory '%s' does not exist" % out)
            sys.exit(1)
        

    outDir = os.path.join(out, name)
    copySkeleton(skeleton_path, app_type, outDir, namespace)
    patchSkeleton(outDir, name, namespace)
    
    
def copySkeleton(skeleton_path, app_type, dir, namespace):
    console.log("Copy skeleton into the output directory: %s" % dir)
   
    template = os.path.join(skeleton_path, app_type)
    if not os.path.isdir(template):
        console.error("Unknown application type '%s'." % app_type)
        sys.exit(1)
        
    try:
        shutil.copytree(template, dir)
    except OSError:
        console.error("Failed to copy skeleton, maybe the directory already exists")
        sys.exit(1)
       
    # rename namespace
    source_dir = os.path.join(dir, "source", "class", "custom") 
    if os.path.isdir(source_dir):
        os.rename(
            source_dir,
            os.path.join(dir, "source", "class", namespace)
        )

    resource_dir = os.path.join(dir, "source", "resource", "custom")
    if os.path.isdir(resource_dir):
        os.rename(
            resource_dir,
            os.path.join(dir, "source", "resource", namespace)
        )
    
    #clean svn directories
    for root, dirs, files in os.walk(dir, topdown=False):
        if ".svn" in dirs:
            filename = os.path.join(root, ".svn")
            shutil.rmtree(filename, ignore_errors=False, onerror=handleRemoveReadonly)  
            

def patchSkeleton(dir, name, namespace):
    absPath = normalizePath(FRAMEWORK_DIR)
    if absPath[-1] == "/":
        absPath = absPath[:-1]
    
    if sys.platform == 'cygwin':
        if re.match( r'^\.\.', dir ):
            relPath = Path.rel_from_to(normalizePath(dir), FRAMEWORK_DIR)
        elif re.match( r'^/cygdrive\b', dir):
            relPath = Path.rel_from_to(dir, FRAMEWORK_DIR)
        else:
            relPath = Path.rel_from_to(normalizePath(dir), normalizePath(FRAMEWORK_DIR))
    else:
        relPath = Path.rel_from_to(normalizePath(dir), normalizePath(FRAMEWORK_DIR))

    relPath = re.sub(r'\\', "/", relPath)
    if relPath[-1] == "/":
        relPath = relPath[:-1]
    
    if not os.path.isdir(os.path.join(dir, relPath)):
        console.error("Relative path to qooxdoo directory is not correct: '%s'" % relPath)
        sys.exit(1)
            
        
    for root, dirs, files in os.walk(dir):
        for file in [file[:-5] for file in files if file.endswith(".tmpl")]:
            outFile = os.path.join(root, file)
            inFile = os.path.join(root, file + ".tmpl")
            console.log("Patching file '%s'" % outFile)
        
            config = Template(open(inFile).read())
            out = open(outFile, "w")
            out.write(
                config.substitute({
                    "Name": name,
                    "Namespace": namespace,
                    "REL_QOOXDOO_PATH": relPath,
                    "ABS_QOOXDOO_PATH": absPath,
                    "QOOXDOO_VERSION": "0.8"
                })
            )
            out.close()
            os.remove(inFile)
            
    for root, dirs, files in os.walk(dir):
        for file in [file for file in files if file.endswith(".py")]:
            os.chmod(os.path.join(root, file), 0755)
            


def handleRemoveReadonly(func, path, exc):
# For Windows the 'readonly' must not be set for resources to be removed    
    excvalue = exc[1]
    if func in (os.rmdir, os.remove) and excvalue.errno == errno.EACCES:
        os.chmod(path, 0777)
        func(path)
    else:
        raise
    
    
def normalizePath(path):
# Fix Windows annoyance to randomly return drive letters uppercase or lowercase. 
# Under Cygwin the user could also supply a lowercase drive letter. For those 
# two systems, the drive letter is always converted to uppercase, the remaining 
# path to lowercase

    if not sys.platform == 'win32' and not sys.platform == 'cygwin':
        return path

    path = re.sub(r'\\+', "/", path)

    if sys.platform == 'cygwin':
        search = re.match( r'^/cygdrive/([a-zA-Z])(/.*)$', path)
        if search:
            return search.group(1).upper() + ":" + search.group(2).lower()

    search = re.match( r'^([a-zA-Z])(:.*)$', path )
    if search:
        return search.group(1).upper() + search.group(2).lower()

    return path


def main():
    parser = optparse.OptionParser()
    
    parser.set_usage("%prog --name ApplicationName [--out dir] [--namespace custom] [-l logfile]")
    parser.set_description("Script to create a new qooxdoo application");
    parser.add_option(
        "-n", "--name", dest="name", metavar="APPLICATIONNAME",
        help="Name of the application. Its top-level directory will be named accordingly."
    )
    parser.add_option(
        "-o", "--out", dest="out", metavar="DIRECTORY", default=".",
        help="The output directory for the application folder (Defaults to the current directory)"
    )
    parser.add_option(
        "--namespace", dest="namespace", default="custom",
        help="The applications's top-level namespace (Defaults to 'custom')"
    )
    parser.add_option(
        "-t", "--type", dest="type", metavar="TYPE", default="gui",
        help="The type of the application to create: 'gui', 'migration' or 'bom'. " + 
          "'gui' builds a standard qooxdoo GUI application, 'migration' should " +
          "be used to migrate 0.7 qooxdoo applications and 'bom' can be used " +
          "to build low level qooxdoo applications."
     )
    parser.add_option(
        "-l", "--logfile", dest="logfile", metavar="FILENAME",
        default=None, type="string", help="Log file"
    )
    parser.add_option(
        "--skeleton-path", dest="skeleton_path", metavar="TYPE", default=SKELETON_DIR,
        help="(Advanced) Configure the path, where the script will look for " +
          "the skeletons. The directory must contain sub directories named by " +
          "the application type containing the application templates."
    )
    
    (options, args) = parser.parse_args(sys.argv[1:])

    if not options.name:
        parser.print_help()
        sys.exit(1)

    # Initialize console
    global console
    console = Log(options.logfile, "info")
            
    createApplication(
        options.name,
        options.out,
        options.namespace,
        options.type,
        options.skeleton_path
    )
    
    console.log("DONE")


if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        sys.exit(1)
