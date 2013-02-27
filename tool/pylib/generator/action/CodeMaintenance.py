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
# Actions that help Maintain Source Code (lint, ...).
##

import os, sys, re, types, string, codecs
from misc          import textutil, filetool
from misc.ExtMap   import ExtMap
from ecmascript.transform.check      import lint
from generator     import Context
from generator.runtime.ShellCmd      import ShellCmd

def runLint(jobconf, classes):

    def getFilteredClassList(classes, includePatt_, excludePatt_):
        # Although lint-check doesn't work with dependencies, we allow
        # '=' in class pattern for convenience; strip those now
        intelli, explicit = textutil.splitPrefixedStrings(includePatt_)
        includePatt = intelli + explicit
        intelli, explicit = textutil.splitPrefixedStrings(excludePatt_)
        excludePatt = intelli + explicit
        if len(includePatt):
            incRegex = map(textutil.toRegExpS, includePatt)
            incRegex = re.compile("|".join(incRegex))
        else:
            incRegex = re.compile(".")  # catch-all
        if len(excludePatt):
            excRegex = map(textutil.toRegExpS, excludePatt)
            excRegex = re.compile("|".join(excRegex))
        else:
            excRegex = re.compile("^$")  # catch-none

        classesFiltered = (c for c in classes if incRegex.search(c) and not excRegex.search(c))
        return classesFiltered

    # ----------------------------------------------------------------------

    if not jobconf.get('lint-check', False) or not jobconf.get('lint-check/run', False):
        return

    console = Context.console
    lib_class_names = classes.keys()
    console.info("Checking Javascript source code...")
    console.indent()

    # Options
    lintJob        = jobconf
    opts = lint.defaultOptions()
    opts.include_patts    = lintJob.get('include', [])  # this is for future use
    opts.exclude_patts    = lintJob.get('exclude', [])

    classesToCheck = list(getFilteredClassList(lib_class_names, opts.include_patts, opts.exclude_patts))
    opts.library_classes  = lib_class_names
    opts.class_namespaces = [x[:x.rfind(".")] for x in opts.library_classes if x.find(".")>-1]
    # the next requires that the config keys and option attributes be identical (modulo "-"_")
    for option, value in lintJob.get("lint-check").items():
        setattr(opts, option.replace("-","_"), value)
    lint_classes((classes[name] for name in classesToCheck), opts)
    console.outdent()

##
# Mid-level interface for Generator actions that want lint checking, mainly for
# the types of the arguments.
#
# classesObj  - list of Class() objects
# opts        - read-to use lint options
def lint_classes(classesObj, opts):
    console = Context.console
    for classObj in classesObj:
        console.debug("Checking %s" % classObj.id)
        tree = classObj.tree()
        lint.lint_check(tree, classObj.id, opts)


def runMigration(jobconf, libs):

    if not jobconf.get('migrate-files', False):
        return

    console = Context.console
    console.info("Please heed the warnings from the configuration file parsing")
    console.info("Migrating Javascript source code to most recent qooxdoo version...")
    console.indent()

    migSettings     = jobconf.get('migrate-files')
    shellCmd  = ShellCmd()

    migratorCmd = os.path.join(os.path.dirname(filetool.root()), "bin", "migrator.py")

    libPaths = []
    for lib in libs:
        lib._init_from_manifest() # Lib()'s aren't initialized yet
        libPaths.append(os.path.join(lib.path, lib.classPath))

    mig_opts = []
    if migSettings.get('from-version', False):
        mig_opts.extend(["--from-version", migSettings.get('from-version')])
    if migSettings.get('migrate-html'):
        mig_opts.append("--migrate-html")
    mig_opts.extend(["--class-path", ",".join(libPaths)])

    shcmd = " ".join(textutil.quoteCommandArgs([sys.executable, migratorCmd] + mig_opts))
    console.debug("Invoking migrator as: '%s'" % shcmd)
    shellCmd.execute(shcmd)

    console.outdent()


def runFix(jobconf, classesObj):

    def fixPng():
        return

    def removeBOM(fpath):
        content = open(fpath, "rb").read()
        if content.startswith(codecs.BOM_UTF8):
            console.debug("removing BOM: %s" % filePath)
            open(fpath, "wb").write(content[len(codecs.BOM_UTF8):])
        return

    # - Main ---------------------------------------------------------------

    if not isinstance(jobconf.get("fix-files", False), types.DictType):
        return

    console = Context.console
    classes = classesObj.keys()
    fixsettings = ExtMap(jobconf.get("fix-files"))

    # Fixing JS source files
    console.info("Fixing whitespace in source files...")
    console.indent()

    console.info("Fixing files: ", False)
    numClasses = len(classes)
    eolStyle = fixsettings.get("eol-style", "LF")
    tabWidth = fixsettings.get("tab-width", 2)
    for pos, classId in enumerate(classes):
        console.progress(pos+1, numClasses)
        classEntry   = classesObj[classId]
        filePath     = classEntry.path
        fileEncoding = classEntry.encoding
        fileContent  = filetool.read(filePath, fileEncoding)
        # Caveat: as filetool.read already calls any2Unix, converting to LF will
        # not work as the file content appears unchanged to this function
        if eolStyle == "CR":
            fixedContent = textutil.any2Mac(fileContent)
        elif eolStyle == "CRLF":
            fixedContent = textutil.any2Dos(fileContent)
        else:
            fixedContent = textutil.any2Unix(fileContent)
        fixedContent = textutil.normalizeWhiteSpace(textutil.removeTrailingSpaces(textutil.tab2Space(fixedContent, tabWidth)))
        if fixedContent != fileContent:
            console.debug("modifying file: %s" % filePath)
            filetool.save(filePath, fixedContent, fileEncoding)
        # this has to go separate, as it requires binary operation
        removeBOM(filePath)

    console.outdent()

    # Fixing PNG files -- currently just a stub!
    if fixsettings.get("fix-png", False):
        console.info("Fixing PNGs...")
        console.indent()
        fixPng()
        console.outdent()

    return


