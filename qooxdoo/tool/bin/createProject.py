#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Fabian Jakobs (fjakobs)
#
################################################################################

import os
import sys
import optparse
import shutil
from string import Template

import qxenviron
from generator.runtime.Log import Log
from misc import Path


SCRIPT_DIR    = qxenviron.scriptDir
FRAMEWORK_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, os.pardir, os.pardir))
SKELETON_DIR  = os.path.normpath(os.path.join(FRAMEWORK_DIR, "component", "skeleton"))


def createProject(name, out, namespace):
    outDir = os.path.join(out, name)
    copySkeleton(outDir, namespace)
    patchSkeleton(outDir, name, namespace)
    
    
def copySkeleton(dir, namespace):
    console.log("Copy skeleton into the output directory: %s" % dir)
   
    try:
        shutil.copytree(SKELETON_DIR, dir)
    except OSError:
        console.error("Failed to copy skeleton")
        sys.exit(1)
       
    # rename namespace
    os.rename(
        os.path.join(dir, "source", "class", "custom"),
        os.path.join(dir, "source", "class", namespace)
    )

    os.rename(
        os.path.join(dir, "source", "resource", "sample"),
        os.path.join(dir, "source", "resource", namespace)
    )
    
    #clean svn directories
    for root, dirs, files in os.walk(dir, topdown=False):
        if ".svn" in dirs:
            shutil.rmtree(os.path.join(root, ".svn"), ignore_errors=True)  
            

def patchSkeleton(dir, name, namespace):
    files = [
        "config.json",
        "generate.py",
        "Manifest.json",
        os.path.join("source", "index.html"),
        os.path.join("source", "class", namespace, "Application.js")
    ]

    for file in files:
        outFile = os.path.join(dir, file)
        inFile = os.path.join(dir, file + ".tmpl")
        console.log("Patching file '%s'" % outFile)
    
        absPath = FRAMEWORK_DIR
        if absPath[-1] in ["/", "\\"]:
            absPath = absPath[:-1]
        
        relPath = Path.rel_from_to(dir, FRAMEWORK_DIR)
        if relPath[-1] in ["/", "\\"]:
            relPath = relPath[:-1]
        
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


def main():
    parser = optparse.OptionParser()
    
    parser.set_usage("%prog --name ProjectName [--out dir] [--namespace custom] [-l logfile]")
    parser.set_description("qooxdoo project creator");
    parser.add_option(
        "-n", "--name", dest="name", metavar="PROJECTNAME",
        help="Name of the qooxdoo project. The top level directory will named by this name."
    )
    parser.add_option(
        "-o", "--out", dest="out", metavar="DIRECTORY", default=".",
        help="The directory to write the program files into (Defaults to the current directory)"
    )
    parser.add_option(
        "--namespace", dest="namespace", default="custom",
        help="The applications's top level namespace (defaults to 'custom')"
    )
    parser.add_option(
        "-l", "--logfile", dest="logfile", metavar="FILENAME",
        default=None, type="string", help="log file"
    )
    
    (options, args) = parser.parse_args(sys.argv[1:])

    if not options.name:
        parser.print_help()
        sys.exit(1)

    # Initialize console
    global console
    console = Log(options.logfile, "info")
        
    createProject(options.name, options.out, options.namespace)


if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        sys.exit(1)
