#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2012 1&1 Internet AG, Germany, http://www.1und1.de
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

##
# File-system related Actions.
##

import sys, os, re, types, string, glob
from misc import Path, filetool, copytool
from generator import Context
from generator.code.Class     import Class
from generator.action.ActionLib import ActionLib

def runResources(confObj, script):
    jobconf = script.jobconfig
    if not jobconf.get("copy-resources", False):
        return
    console = Context.console

    console.info("Copying resources...")
    classList     = script.classesObj
    resTargetRoot = jobconf.get("copy-resources/target", "build")
    resTargetRoot = confObj.absPath(resTargetRoot)
    #generator.approot  = resTargetRoot  # doesn't seem necessary anymore

    # map resources to class.resources
    classList = Class.mapResourcesToClasses(script.libraries, classList, jobconf.get("asset-let", {}))

    console.indent()
    # make resources to copy unique
    resources_to_copy = set(_res for cls in classList for _res in cls.resources)
    # Copy resources
    #for lib in libs:
    for res in resources_to_copy:
        # construct target path
        resTarget = os.path.join(resTargetRoot, 'resource', res.id)
        # Copy
        _copyResources(res.path, os.path.dirname(resTarget))

    console.outdent()


def runCopyFiles(jobconf, confObj):
    # Copy application files
    if not jobconf.get("copy-files/files", False):
        return
    console = Context.console

    filePatts = jobconf.get("copy-files/files",[])
    if filePatts:
        buildRoot  = jobconf.get("copy-files/target", "build")
        buildRoot  = confObj.absPath(buildRoot)
        sourceRoot = jobconf.get("copy-files/source", "source")
        sourceRoot  = confObj.absPath(sourceRoot)
        console.info("Copying application files...")
        console.indent()
        for patt in filePatts:
            appfiles = glob.glob(os.path.join(sourceRoot, patt))
            for srcfile in appfiles:
                console.debug("copying %s" % srcfile)
                srcfileSuffix = Path.getCommonPrefix(sourceRoot, srcfile)[2]
                destfile = os.path.join(buildRoot,srcfileSuffix)
                if (os.path.isdir(srcfile)):
                    destdir = destfile
                else:
                    destdir = os.path.dirname(destfile)
                _copyResources(srcfile, destdir)

        console.outdent()


##
# create a list ['-x', '.svn', '-x', '.git', '-x', ...] for version dir patts
# used in _copyResources
#skip_list = reduce(operator.concat,
#                   [['-x', x.strip("^\\$")] for x in filetool.VERSIONCONTROL_DIR_PATTS],
#                   [])

#skip_list = [x.strip("^\\$") for x in filetool.VERSIONCONTROL_DIR_PATTS]
skip_list = filetool.VERSIONCONTROL_DIR_PATTS


##
# Invokes CopyTool.
#
# targPath *has* to be directory  -- there is now way of telling a
# non-existing target file from a non-existing target directory :-)
#
def _copyResources(srcPath, targPath):
    console = Context.console
    #console.debug("_copyResource: %s => %s" % (srcPath, targPath))
    copier = copytool.CopyTool(console)
    args      = ['-s', '-x'] + [",".join(skip_list)] + [srcPath, targPath]
    copier.parse_args(args)
    copier.do_work()


def runClean(jobconf, confObj, cacheObj):

    def isLocalPath(path):
        return confObj.absPath(path).startswith(confObj.absPath(jobconf.get("let/ROOT")))

    # -------------------------------------------

    if not jobconf.get('clean-files', False):
        return

    console = Context.console
    console.info("Cleaning up files...")
    console.indent()

    # Handle caches
    #print "-- cache: %s; root: %s" % (confObj.absPath(jobconf.get("cache/compile")), confObj.absPath(jobconf.get("let/ROOT")))

    if (jobconf.name == "clean" and not isLocalPath(jobconf.get("cache/compile"))): # "clean" with non-local caches
        pass
    else:
        cacheObj.cleanCompileCache()
    if (jobconf.name == "clean" and not isLocalPath(jobconf.get("cache/downloads"))): # "clean" with non-local caches
        pass
    else:
        cacheObj.cleanDownloadCache()
    # Clean up other files
    ActionLib(confObj, console).clean(jobconf.get('clean-files'))

    console.outdent()


