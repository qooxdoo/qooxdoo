#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2008 - 2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    MIT: https://opensource.org/licenses/MIT
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Fabian Jakobs (fjakobs)
#    * Andreas Ecker (ecker)
#
################################################################################
from __future__ import print_function

import re, os, sys, optparse, shutil, errno, stat, codecs, glob, types, subprocess, tempfile
from string import Template
from collections import defaultdict

import qxenviron
from ecmascript.frontend import lang
from generator.runtime.Log import Log
from generator.runtime.ShellCmd import ShellCmd
from misc import Path


SCRIPT_DIR    = qxenviron.scriptDir
FRAMEWORK_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, os.pardir, os.pardir).decode('utf-8'))
SKELETON_DIR  = unicode(os.path.normpath(os.path.join(FRAMEWORK_DIR, "component", "skeleton")))
GENERATE_PY   = unicode(os.path.normpath(os.path.join(FRAMEWORK_DIR, "tool", "data", "generator", "generate.tmpl.py")))
APP_DIRS      = [x for x in os.listdir(SKELETON_DIR) if not re.match(r'^\.',x)]

R_ILLEGAL_NS_CHAR   = re.compile(r'(?u)[^\.\w]')  # allow unicode, but disallow $
R_SHORT_DESC        = re.compile(r'(?m)^short::\s*(.*)$')  # to search "short:: ..." in skeleton's 'readme.txt'
R_COPY_FILE         = re.compile(r'(?m)^copy_file::\s*(.*)$')  # special files to copy from SDK for this skeleton
R_ILLEGAL_NODE_VERS = re.compile(r'^v0\.\d\.') # require Node.js version >= 0.10.0
QOOXDOO_VERSION     = ''  # will be filled later


def getAppInfos():
    appInfos = {}
    for dir_ in APP_DIRS:
        readme = os.path.join(SKELETON_DIR, dir_, "readme.txt")
        appinfo = defaultdict(unicode)
        if os.path.isfile(readme):
            cont = open(readme, "rU").readlines()
            for line in cont:
                # short::
                mo   = R_SHORT_DESC.search(line)
                if mo:
                    appinfo['short'] = mo.group(1)
                # copy_file:: - could be multiple
                mo   = R_COPY_FILE.search(line)
                if mo:
                    if not isinstance(appinfo['copy_file'], types.ListType):
                        appinfo['copy_file'] = []
                    appinfo['copy_file'].append(mo.group(1))
        appInfos[dir_] = appinfo
    return appInfos

APP_INFOS = getAppInfos()


def getQxVersion():
    global QOOXDOO_VERSION
    versionFile = os.path.join(FRAMEWORK_DIR, "version.txt")
    version = codecs.open(versionFile,"r", "utf-8").read()
    version = version.strip()
    QOOXDOO_VERSION = version
    return



def copyGenericIfNoSpecific(specificFilename, genericFilepath, destFilepath, appType):
    if not os.path.isfile(os.path.join(destFilepath, specificFilename)):
      shutil.copy(genericFilepath, destFilepath)

def createApplication(options):
    out = options.out
    if sys.platform == 'win32' and re.match( r'^[a-zA-Z]:$', out):
        out = out + '\\'
    else:
        out = os.path.expanduser(out)

    if not os.path.isdir(out):
        if os.path.isdir(normalizePath(out)):
            out = normalizePath(out)
        else:
            console.error("Output directory '%s' does not exist" % out)
            sys.exit(1)


    outDir = os.path.join(out, options.name)

    if not options.type in APP_INFOS:
        console.warn("No such skeleton: %s" % options.type)
        listSkeletons(console, APP_INFOS)
        sys.exit(1)

    appDir = outDir
    app_infos = APP_INFOS[options.type]

    # copy the template structure
    copySkeleton(options.skeleton_path, options.type, outDir, options.namespace)

    # copy generic file if no more specific is available
    copyGenericIfNoSpecific("", GENERATE_PY, appDir, options.type)

    # copy files
    if isinstance(app_infos['copy_file'], types.ListType):
        for pair in app_infos['copy_file']:
            src, dest = pair.split(None, 1)
            src_path = os.path.join(FRAMEWORK_DIR, src)
            dst_path = os.path.join(appDir, dest)
            if os.path.isfile(src_path):
                if not os.path.isdir(os.path.dirname(dst_path)):
                    os.makedirs(os.path.dirname(dst_path))
                shutil.copy(src_path, dst_path)
            else:
                msg = "Warning: Source file \"{0}\" not available - please see the skeleton's readme.txt".format(src_path)
                print(msg, file=sys.stderr) # just keep on with the others

    # rename files
    rename_folders(appDir, options.namespace)
    # clean out unwanted
    cleanSkeleton(appDir)

    # patch file contents
    patchSkeleton(appDir, FRAMEWORK_DIR, options)

    return appDir


def rename_folders(root_dir, namespace):
    console.log("Renaming stuff...")
    # rename name space parts of paths

    # rename in class path
    source_dir = os.path.join(root_dir, "source", "class", "custom")
    out_dir    = os.path.join(root_dir, "source", "class")
    expand_dir(source_dir, out_dir, namespace)

    # rename in theme path
    source_dir = os.path.join(root_dir, "source", "theme", "custom")
    out_dir    = os.path.join(root_dir, "source", "theme")
    expand_dir(source_dir, out_dir, namespace)

    # rename in resource path
    resource_dir = os.path.join(root_dir, "source", "resource", "custom")
    out_dir      = os.path.join(root_dir, "source", "resource")
    expand_dir(resource_dir, out_dir, namespace)

    # rename in script path
    script_dir   = os.path.join(root_dir, "source", "script")
    script_files = glob.glob(os.path.join(script_dir, "custom.*js"))
    if script_files:
        for script_file in script_files:
            os.rename(script_file, script_file.replace("custom", namespace))


def copySkeleton(skeleton_path, app_type, dir_, namespace):
    console.log("Copy skeleton into the output directory: %s" % dir_)

    template = os.path.join(skeleton_path, app_type)
    if not os.path.isdir(template):
        console.error("Unknown application type '%s'." % app_type)
        sys.exit(1)

    try:
        shutil.copytree(template, dir_)
    except OSError:
        console.error("Failed to copy skeleton, maybe the directory already exists")
        sys.exit(1)


def cleanSkeleton(dir_):
    #clean svn directories
    for root, dirs, files in os.walk(dir_, topdown=False):
        if ".svn" in dirs:
            filename = os.path.join(root, ".svn")
            shutil.rmtree(filename, ignore_errors=False, onerror=handleRemoveReadonly)


def expand_dir(indir, outroot, namespace):
    "appends namespace parts to outroot, and renames indir to the last part"
    if not (os.path.isdir(indir) and os.path.isdir(outroot)):
        return
    ns_parts = namespace.split('.')
    target   = outroot
    for part in ns_parts:
        target = os.path.join(target, part)
        if part == ns_parts[-1]: # it's the last part
            os.rename(indir, target)
        else:
            os.mkdir(target)


def patchSkeleton(appDir, framework_dir, options):
    absPath = determineAbsPathToSdk(framework_dir)
    relPath = determineRelPathToSdk(appDir, framework_dir, options)

    # collect all files to modify
    filePaths = collectTmplInOutFilePaths(appDir)

    # render all 
    renderTemplates(filePaths, options, relPath, absPath)
    chmodPyFiles(appDir)


def determineAbsPathToSdk(framework_dir):
    absPath = normalizePath(framework_dir)
    if absPath[-1] == "/":
        absPath = absPath[:-1]

    return absPath


def determineRelPathToSdk(appDir, framework_dir, options):
    relPath = ''
    if sys.platform == 'cygwin':
        if re.match( r'^\.{1,2}\/', appDir):
            relPath = Path.rel_from_to(normalizePath(appDir), framework_dir)
        elif re.match( r'^/cygdrive\b', appDir):
            relPath = Path.rel_from_to(appDir, framework_dir)
        else:
            relPath = Path.rel_from_to(normalizePath(appDir), normalizePath(framework_dir))
    else:
        relPath = Path.rel_from_to(normalizePath(appDir), normalizePath(framework_dir))

    relPath = re.sub(r'\\', "/", relPath)
    if relPath[-1] == "/":
        relPath = relPath[:-1]

    if not os.path.isdir(os.path.join(appDir, relPath)):
        console.error("Relative path to qooxdoo directory is not correct: '%s'" % relPath)
        sys.exit(1)

    return relPath


def chmodPyFiles(appDir):
    for root, dirs, files in os.walk(appDir):
        for file in [file for file in files if file.endswith(".py")]:
            os.chmod(os.path.join(root, file), (stat.S_IRWXU
                                               |stat.S_IRGRP |stat.S_IXGRP
                                               |stat.S_IROTH |stat.S_IXOTH)) # 0755



def renderTemplates(inAndOutFilePaths, options, relPathToSdk, absPathToSdk):
    for inFile, outFile in inAndOutFilePaths:
        console.log("Patching file '%s'" % outFile)

        #config = MyTemplate(open(inFile).read())
        config = Template(open(inFile).read())
        out = open(outFile, "w")

        context = {
          "Name": options.name,
          "Namespace": options.namespace,
          "NamespacePath" : (options.namespace).replace('.', '/'),
          "REL_QOOXDOO_PATH": relPathToSdk,
          "ABS_QOOXDOO_PATH": absPathToSdk,
          "QOOXDOO_VERSION": QOOXDOO_VERSION,
          "Cache" : options.cache,
        }

        out.write(config.substitute(context).encode('utf-8'))
        out.close()
        os.remove(inFile)


def collectTmplInOutFilePaths(appDir):
    tmplFiles = []
    for root, dirs, files in os.walk(appDir):
        for file in files:
            split = file.split(".")
            if len(split) >= 3 and split[-2] == "tmpl":
                outFile = os.path.join(root, ".".join(split[:-2] + split[-1:]))
                inFile = os.path.join(root, file)
                tmplFiles.append((inFile, outFile))

    return tmplFiles


def handleRemoveReadonly(func, path, exc):
# For Windows the 'readonly' must not be set for resources to be removed
    excvalue = exc[1]
    if func in (os.rmdir, os.remove) and excvalue.errno == errno.EACCES:
        os.chmod(path, stat.S_IRWXU| stat.S_IRWXG| stat.S_IRWXO) # 0777
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


def checkNamespace(options):

    # check availability and spelling
    if not options.namespace:
        if R_ILLEGAL_NS_CHAR.search(options.name):
            convertedName = R_ILLEGAL_NS_CHAR.sub("_", options.name)
            console.log("WARNING: Converted illegal characters in name (from %s to %s)" % (options.name, convertedName))
            options.name = convertedName
            options.namespace = convertedName.lower()
        else:
            options.namespace = options.name.lower()

    else:
        options.namespace = options.namespace.decode('utf-8')
        if R_ILLEGAL_NS_CHAR.search(options.namespace):
            convertedNamespace = R_ILLEGAL_NS_CHAR.sub("_", options.namespace)
            console.log("WARNING: Converted illegal characters in namespace (from %s to %s)" % (options.namespace, convertedNamespace))
            options.namespace = convertedNamespace

    for namepart in options.namespace.split("."):
        # check well-formed identifier
        if not re.match(lang.IDENTIFIER_REGEXP, namepart):
            console.error("Name space part must be a legal JS identifier, but is not: '%s'" % namepart)
            sys.exit(1)

        # check reserved words
        if namepart in (lang.GLOBALS + lang.RESERVED.keys()):
            console.error("JS reserved word '%s' is not allowed as name space part" % namepart)
            sys.exit(1)


def skeletonsHelpString():
    helpString = "Type of the application to create, one of: "
    helpString += str(map(str, sorted(APP_INFOS.keys()))) + "."
    helpString += str("; ".join(["'%s' -- %s" % (x, y) for x,y in sorted([(k,i['short']) for k,i in APP_INFOS.items()])]))
    helpString += ". (Default: %default)"
    return helpString


def listSkeletons(console, info):
    console.info("Available skeletons:")
    console.indent()
    for skeleton in sorted(info.keys()):
        sdesc = ""
        if "short" in info[skeleton]:
            sdesc = "%s -- %s" % ((12 - len(skeleton)) * " ", info[skeleton]["short"])
        console.info(skeleton + sdesc)


def main():
    parser = optparse.OptionParser()

    parser.set_usage('''\
%prog --name APPLICATIONNAME [--out DIRECTORY]
                             [--namespace NAMESPACE] [--type TYPE]
                             [-logfile LOGFILE] [--skeleton-path PATH]

Script to create a new qooxdoo application.

Example: For creating a regular GUI application \'myapp\' you could execute:
  %prog --name myapp''')

    parser.add_option(
        "-n", "--name", dest="name", metavar="APPLICATIONNAME",
        help="Name of the application. An application folder with identical name will be created. (Required)"
    )
    parser.add_option(
        "-o", "--out", dest="out", metavar="DIRECTORY", default=".",
        help="Output directory for the application folder. (Default: %default)"
    )
    parser.add_option(
        "-s", "--namespace", dest="namespace", metavar="NAMESPACE", default=None,
        help="Applications's top-level namespace. (Default: APPLICATIONNAME)"
    )
    parser.add_option(
        "-t", "--type", dest="type", metavar="TYPE", default="desktop",
        help=skeletonsHelpString()
     )
    parser.add_option(
        "-l", "--logfile", dest="logfile", metavar="LOGFILE",
        default=None, type="string", help="Log file"
    )
    parser.add_option(
        "-p", "--skeleton-path", dest="skeleton_path", metavar="PATH", default=SKELETON_DIR,
        help="(Advanced) Path where the script looks for skeletons. " +
          "The directory must contain sub directories named by " +
          "the application types. (Default: %default)"
    )
    parser.add_option(
        "--cache", dest="cache", metavar="PATH", default="${TMPDIR}/qx${QOOXDOO_VERSION}/cache",
        help="Path to the cache directory; will be entered into config.json's CACHE macro (Default: %default)"
    )

    (options, args) = parser.parse_args(sys.argv[1:])

    if not options.name:
        parser.print_help()
        sys.exit(1)
    else:
        options.name = options.name.decode('utf-8')

    # Initialize console
    global console
    console = Log(options.logfile, "info")

    checkNamespace(options)
    getQxVersion()
    outDir = createApplication(options)

    console.log("DONE")
    return


pattern = r"""
%(delim)s(?:
  (?P<escaped>%(delim)s) |   # Escape sequence of two delimiters
  (?P<named>%(id)s)      |   # delimiter and a Python identifier
  {(?P<braced>%(id)s)}   |   # delimiter and a braced identifier
  (?P<invalid>)              # Other ill-formed delimiter exprs
)
"""

class MyTemplate(Template):
     #delimiter = "%"
    pattern = r"""
    \$(?:
      (?P<escaped>\$) |   # Escape sequence of two delimiters
      {(?P<braced>[_a-z][_a-z0-9]*)}   |   # delimiter and a braced identifier
      (?P<invalid>)              # Other ill-formed delimiter exprs
    )
    """

if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print()
        print("Keyboard interrupt!")
        sys.exit(1)
