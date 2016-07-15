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
#    MIT: https://opensource.org/licenses/MIT
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Daniel Wagner (d_wagner)
#
################################################################################

import os
import sys
import optparse
import codecs
import copy
import tempfile

scriptDir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(scriptDir, "../../pylib"))

import demjson
from generator.runtime.Log import Log
from generator.runtime.ShellCmd import ShellCmd
from misc import filetool

global console
console = Log(None, "info")
global shell
shell = ShellCmd()

qxPatchReleases = {
  "3.0": "3.0.2",
  "2.1": "2.1.1",
  "2.0": "2.0.4",
  "1.6": "1.6.1",
  "1.5": "1.5.1",
  "1.4": "1.4.2",
  "1.3": "1.3.1",
  "1.2": "1.2.2",
  "1.1": "1.1.2",
  "1.0": "1.0.2"
}


class Repository:
    def __init__(self, repoDir, config=None):
        self.dir = os.path.abspath(repoDir)
        self.validator = LibraryValidator(config)
        self.data = []
        self.issues = {}

        if not self.hasExplicitIncludes():
            manifests = self.scanRepository()
        else:
            try:
                manifests = self.getExplicitManifests()
                if len(manifests) == 0:
                    manifests = self.scanRepository()
                else:
                    console.info("Got an explicit include list, skipping repository scan")
            except Exception:
                manifests = self.scanRepository()

        self.children = self.getLibraries(manifests)

    def hasExplicitIncludes(self):
        for (key, value) in self.validator.config["libraries"]["include"].iteritems():
            if key == "*" or not "versions" in value:
                return False
            for ver in value["versions"]:
                if ver == "*":
                        return False
        return True

    def getExplicitManifests(self):
        manifests = []
        for (key, value) in self.validator.config["libraries"]["include"].iteritems():
            if not "versions" in value:
                raise Exception("Insufficient configuration details for getExplicitManifests")
            for ver in value["versions"]:
                manifestPath = os.path.join(self.dir, key, ver, "Manifest.json")
                if not os.path.isfile(manifestPath):
                    raise Exception("getExplicitManifest failed: Manifest not in expected location: %s" % manifestPath)
                manifests.append(manifestPath)
        return manifests

    def scanRepository(self):
        console.info("Scanning %s" % self.dir)
        console.indent()
        demoDir = "%sdemo%s" % (os.sep, os.sep)
        manifestPaths = []

        for root, dirs, files in filetool.walk(self.dir, topdown=True):
            for dir in dirs:

                if dir == "qooxdoo" or dir == "demo":
                    dirs.remove(dir)
                    continue

                path = os.path.join(root, dir)
                manifestPath = os.path.join(path, "Manifest.json")

                if demoDir in manifestPath:
                    dirs.remove(dir)
                    continue

                if os.path.isfile(manifestPath):
                    console.debug("Found manifest: " + repr(manifestPath))
                    manifestPaths.append(manifestPath)

        console.info("Found %s manifests" % len(manifestPaths))
        console.outdent()
        return manifestPaths

    def getLibraries(self, manifests):
        console.info("Checking manifests to find valid libraries...")
        libraries = {}
        console.indent()
        for manifestPath in manifests:
            try:
                manifest = getDataFromJsonFile(manifestPath)
            except Exception, e:
                if not "manifestUnreadable" in self.issues:
                    self.issues["manifestUnreadable"] = []
                self.issues["manifestUnreadable"].append(manifestPath)
                console.error("Couldn't read manifest file %s" % manifestPath)
                console.indent()
                console.error(str(e))
                console.outdent()
                continue

            if not "info" in manifest:
                if not "manifestIncomplete" in self.issues:
                    self.issues["manifestIncomplete"] = []
                self.issues["manifestIncomplete"].append(manifestPath)
                console.warn("Manifest file %s has no 'info' section, skipping the library." % manifestPath)
                continue

            libraryName = manifest["info"]["name"]
            libraryVersion = manifest["info"]["version"]
            libraryQxVersions = manifest["info"]["qooxdoo-versions"]

            #skip any libraries that are only compatible with legacy qooxdoo versions
            newQx = False
            for qxVersion in libraryQxVersions:
                if qxVersion[:2] != "0.":
                    newQx = True
            if not newQx:
                console.info("Skipping library %s since it's only compatible with legacy qooxdoo versions (<1.*)." % libraryName)
                continue

            try:
                libraryType = manifest["provides"]["type"]
            except KeyError:
                libraryType = None

            if not self.validator.isValid(libraryName, libraryType, libraryVersion, libraryQxVersions):
                console.debug("Skipping excluded library %s")
                continue

            versionPath = os.path.abspath(os.path.dirname(manifestPath))

            if libraryName not in libraries:
                console.info("Adding library %s" % libraryName)
                libraryPath = os.path.split(versionPath)[0]
                libraries[libraryName] = Library(libraryName, libraryPath, self)

            console.info("Adding library %s version %s..." % (libraryName, libraryVersion), False)
            if libraryVersion not in libraries[libraryName].children:
                # create LibraryVersion instance
                libVer = LibraryVersion(libraryVersion, versionPath, libraries[libraryName])
                #libVer.manifest = manifest
                libraries[libraryName].children[libraryVersion] = libVer
                console.write(" Done.", "info")
            else:
                libraries[libraryName].issues.append("additionalManifest for version %s: %s" % (libraryVersion, manifestPath))
                console.write("")
                console.indent()
                console.error("Found additional manifest for version %s of library %s: %s" % (libraryVersion, libraryName, manifestPath))
                console.outdent()

        console.outdent()
        return libraries

    def buildAllDemos(self, buildTarget="build"):
        console.info("Generating demos for all known libraries")
        console.indent()

        buildQueue = {}
        for libraryName, library in self.children.iteritems():
            libraryQueue = library.buildAllDemos(buildTarget)
            for qxVersion, jobData in libraryQueue.iteritems():
                if not qxVersion in buildQueue:
                    buildQueue[qxVersion] = []
                buildQueue[qxVersion].extend(jobData)

        for qxVersion, jobData in buildQueue.iteritems():
            if len(jobData) > 0:
                console.info("Linking %s demos against qooxdoo %s" % (repr(len(jobData)), qxVersion))
                for job in jobData:
                    runBuildJob(job, qxVersion)

        console.outdent()

    def storeData(self, path):

        def getChildrenData(item, itemData):
            for childName, child in item.children.iteritems():
                childData = copy.deepcopy(child.data)
                childData["issues"] = child.issues

                #recursion
                if hasattr(child, "children"):
                    childData = getChildrenData(child, childData)

                if type(itemData) == list:
                    itemData.append(childData)
                elif "children" in itemData:
                    itemData["children"].append(childData)
                elif "tests" in itemData:
                    #itemData["tests"].append(childData)
                    pass

            return itemData

        data = getChildrenData(self, copy.deepcopy(self.data))

        if not os.path.isdir(path):
            os.makedirs(path)
        fpath = os.path.join(path, "demodata.json")
        storeDemoData(data, fpath)

    def lintCheckAll(self):
        for libraryName, library in self.children.iteritems():
            for versionName, libraryVersion in library.children.iteritems():
                console.info("Lint results for %s %s:" % (libraryName, versionName))
                result = libraryVersion.getLintResult()
                logLintResult(result)

    def runGeneratorForAll(self, job, macro=False):
        console.indent()
        for libraryName, library in self.children.iteritems():
            for versionName, libraryVersion in library.children.iteritems():
                if options.demobrowser and options.copydemos:
                    macro["BUILD_PATH"] = os.path.join(options.demobrowser, "demo", libraryName, versionName, job)
                console.info("Running job %s on %s %s..." % (job, libraryName, versionName))
                ret, out, err = runGenerator(libraryVersion.path, job, macro)
                console.debug(out)
                if ret > 0:
                    libraryVersion.issues.append({job: err})
                    console.error(err)
                else:
                    libraryVersion.data["jobsExecuted"].append(job)
        console.outdent()


def getReadmeContent(path):
    readmePath = False
    readmeNames = ["README", "README.TXT", "README.txt", "readme", "readme.txt", "readme.TXT"]
    for readme in readmeNames:
        readmeFull = os.path.join(path, readme)
        if os.path.isfile(readmeFull):
            readmePath = readmeFull
    if readmePath:
        readmeFile = file(readmePath, "r")
        readme = ""
        for line in readmeFile.readlines():
            readme += line.replace("\n", r'\n')
        return readme
    else:
        return False


def getDataFromJsonFile(path):
    try:
        jsonFile = codecs.open(path, "r", "UTF-8")
    except:
        raise Exception("File %s not found" % path)

    data = jsonFile.read()
    jsonFile.close()

    try:
        return demjson.decode(data, allow_comments=True)
    except Exception:
        raise Exception("Couldn't parse JSON from file %s" % path)


class Library:
    def __init__(self, name, path, repository):
        self.name = name
        self.path = path
        self.parent = repository
        self.children = {}
        self.issues = []
        self.readme = self._getReadme()
        self.data = {
            "classname": name,
            "children": [],
            "readme": self.readme
        }

    def _getReadme(self):
        readme = getReadmeContent(self.path)
        if readme:
            return readme
        else:
            self.issues.append("readmeMissing")
            return "No readme file found."

    def buildAllDemos(self, buildTarget):
        buildQueue = {}
        for versionName, version in self.children.iteritems():
            versionQueue = version.buildAllDemos(buildTarget)
            for qxVersion, jobData in versionQueue.iteritems():
                if not qxVersion in buildQueue:
                    buildQueue[qxVersion] = []
                buildQueue[qxVersion].extend(jobData)
        return buildQueue


class LibraryVersion:
    def __init__(self, name, path, library):
        self.name = name
        self.path = path
        self.parent = library
        self.manifest = self._getManifest()
        self.issues = []
        self.readme = self._getReadme()
        self.data = {
            "classname": self.name,
            "tests": [],
            "manifest": self.manifest,
            "readme": self.readme,
            "jobsExecuted": []
        }

        self._checkStructure()

        self.children = {}
        if self.hasDemoDir:
            self.children = self._getDemos()

    def _checkStructure(self):
        self.hasDemoDir = False
        if os.path.isdir(os.path.join(self.path, "demo")):
            self.hasDemoDir = True

        self.hasReadmeFile = False
        if os.path.isfile(os.path.join(self.path, "README")):
            self.hasReadmeFile = True

        self.hasGenerator = False
        if os.path.isfile(os.path.join(self.path, "generate.py")):
            self.hasGenerator = True

        self.hasUnitTests = self._checkUnitTests()

    def _getManifest(self):
        try:
            return self.manifest
        except AttributeError:
            pass

        manifestPath = os.path.join(self.path, "Manifest.json")

        return getDataFromJsonFile(manifestPath)

    def _getReadme(self):
        readme = getReadmeContent(self.path)
        if readme:
            return readme
        else:
            self.issues.append("readmeMissing")
            return "No readme file found."

    def _checkUnitTests(self):
        try:
            classPath = self.manifest["provides"]["class"]
            namespace = self.manifest["provides"]["namespace"]
            fullClassPath = os.path.join(self.path, classPath, namespace)
            testPath = os.path.join(fullClassPath, "test")
            if os.path.isdir(testPath):
                testPathContents = os.listdir(testPath)
                for entry in testPathContents:
                    if entry[-3:] == ".js" and entry != "DemoTest.js":
                        return True
        except:
            pass

        return False

    def getLintResult(self):
        if not self.hasGenerator:
            raise Exception("%s %s has no generate.py script!" % (self.parent.name, self.name))

        from lintRunner import QxLint

        class LintOpts:
            def __init__(self, workdir, mailto=None):
                self.workdir = workdir
                self.mailto = mailto
                self.outputfile = None
                self.ignoreErrors = ["Protected data field"]

        lintOpts = LintOpts(self.path)
        lint = QxLint(lintOpts)
        self.issues.append({"lint": lint.data})

        return lint.data

    def getSvnRevision(self):
        try:
            return self.svnRevision
        except:
            pass

        cmd = "svnversion %s" % self.path
        rcode, output, errout = shell.execute_piped(cmd)

        if rcode > 0:
            raise Exception("Error while retrieving SVN version: " + errout)

        svnRevision = output.rstrip('\n')
        return svnRevision

    def _getDemos(self):
        if not self.hasDemoDir:
            return False

        demos = {}
        demoPath = os.path.join(self.path, "demo")
        for root, dirs, files in filetool.walk(demoPath, topdown=True):
            for name in dirs:
                path = os.path.join(root, name)
                manifestPath = os.path.join(path, "Manifest.json")
                if os.path.isfile(manifestPath):
                    foundDemo = Demo(name, path, self)
                    demos[name] = foundDemo

        return demos

    def buildAllDemos(self, buildTarget="build"):
        if options.demobrowser:
            demoBrowser = os.path.abspath(options.demobrowser)
        else:
            demoBrowser = None
        buildQueue = {}
        qxVersions = self.manifest["info"]["qooxdoo-versions"]
        qxVersions.sort()
        qxVersions.reverse()
        # Only build the source version against one qx version
        if buildTarget == "source":
            del qxVersions[1:]

        for variantName, variant in self.children.iteritems():
            #get the compatible qooxdoo versions of the library version
            for qxVersion in qxVersions:
                if qxVersion[:2] == "0.":
                    console.info("Skipping build against legacy qooxdoo version %s for %s %s %s" % (qxVersion, self.parent.name, self.name, variantName))
                    continue
                if qxVersion in qxPatchReleases:
                    qxVersion = qxPatchReleases[qxVersion]
                if not qxVersion in buildQueue:
                    buildQueue[qxVersion] = []

                qxPath = os.path.join(self.parent.parent.dir, "qooxdoo", qxVersion)

                if not (demoBrowser and options.copydemos):
                    buildPath = qxVersion
                else:
                    demoPath = os.path.join(demoBrowser, "demo", self.parent.name, self.name)
                    buildPath = os.path.join(demoPath, variantName, qxVersion)

                if options.cachedir and os.path.isdir(options.cachedir):
                    tempdir = options.cachedir
                else:
                    tempdir = tempfile.gettempdir()
                macro = {
                    "BUILD_PATH": buildPath,
                    "QOOXDOO_PATH": qxPath,
                    "CACHE": tempdir + "/cache/" + qxVersion
                }

                jobData = (variant, buildTarget, macro, demoBrowser)
                buildQueue[qxVersion].append(jobData)

        return buildQueue

    # creates an HTML file for the demo in the demobrowser's "demo" dir by
    # modifying the demo_template.html file in the demobrowser's resource dir.
    # This file simply does a meta redirect to the generated demo.
    def _copyHtmlFile(self, variantName, demoVersion, demoBrowser, qxVersion):
        #get some needed info from the demobrowser's manifest
        dbManifest = getDataFromJsonFile(os.path.join(demoBrowser, "Manifest.json"))
        dbResourcePath = dbManifest["provides"]["resource"]
        dbNamespace = dbManifest["provides"]["namespace"]

        sourceFilePath = os.path.join(demoBrowser, dbResourcePath, dbNamespace, "demo_template.html")
        sourceFile = codecs.open(sourceFilePath, 'r', 'utf-8')

        targetDir = os.path.join(demoBrowser, demoVersion, "demo", self.parent.name, self.name, variantName)
        if qxVersion:
            targetDir = os.path.join(targetDir, qxVersion)

        if not os.path.isdir(targetDir):
            os.makedirs(targetDir)
        targetFilePath = os.path.join(targetDir, "index.html")
        console.info("Copying HTML file for demo %s %s %s %s (qx version %s) to the demobrowser" % (self.parent.name, self.name, variantName, demoVersion, qxVersion))
        targetFile = codecs.open(targetFilePath, "w", "utf-8")
        demoPath = os.path.join(self.path, "demo", variantName, demoVersion)

        demoUrl = "../../../../../../" + self._getDemoUrl(demoBrowser, demoPath)
        demoUrl += "/index.html"

        for line in sourceFile:
            targetFile.write(line.replace("$LIBRARY", demoUrl))

        targetFile.close()

    # attempts to calculate a relative link from the Demo Browser to the Demo.
    def _getDemoUrl(self, demoBrowser, demo):
        demoUrl = ""

        demoBrowserList = demoBrowser.split(os.sep)
        try:
            demoBrowserList.remove("")
        except:
            pass

        demoList = demo.split(os.sep)
        try:
            demoList.remove("")
        except:
            pass

        depth = 0
        for i in range(0, len(demoBrowserList)):
            if demoBrowserList[i] == demoList[i]:
                    depth = depth + 1
            else:
                    break

        for j in range(0, len(demoBrowserList[depth:])):
            demoUrl += "../"
        uniquePart = "/".join(demoList[depth:])
        demoUrl += uniquePart

        return demoUrl


class Demo:
    def __init__(self, name, path, libraryVersion):
        self.name = name
        self.path = path
        self.parent = libraryVersion
        self.manifest = self._getManifest()
        self.data = self._getData()
        self.issues = []

    def build(self, target="build", macro=None):
        try:
            rcode, output, errout = runGenerator(self.path, target, macro)
        except Exception, e:
            self.issues.append({target: str(e)})
            console.write("Error running generator")
            console.error(e)
            return

        if rcode > 0:
            console.error(errout)
            console.info(output)
            if not errout:
                errout = "Unknown error"
            self.issues.append({target: errout})

    def _getData(self):
        libName = self.parent.parent.name
        libVersion = self.parent.name
        demoDict = {
            "name": self.name,
            "nr": self.name.capitalize(),
            "title": libName + " " + libVersion + " " + self.name,
            "tags": [libName, libVersion],
            "manifest": self.manifest
        }

        return demoDict

    def _getManifest(self):
        manifestPath = os.path.join(self.path, "Manifest.json")
        return getDataFromJsonFile(manifestPath)


def runBuildJob(jobData, qxVersion):
    variant = jobData[0]
    buildTarget = jobData[1]
    macro = jobData[2]

    if options.demobrowser:
        demoBrowser = os.path.abspath(options.demobrowser)
    else:
        demoBrowser = False

    console.info("Generating %s version of demo variant %s for library %s version %s..." % (buildTarget, variant.name, variant.parent.parent.name, variant.parent.name))
    variant.build(buildTarget, macro)
    buildOk = True

    for issue in variant.issues:
        if buildTarget in issue:
            buildOk = False
            console.warn("%s %s demo %s %s generation against qooxdoo %s failed!" % (variant.parent.parent.name, variant.parent.name, variant.name, buildTarget, qxVersion))
            console.warn(repr(issue[buildTarget]))

    if demoBrowser and buildOk:
        demoData = copy.deepcopy(variant.data)
        demoData["tags"].append("qxVersion_" + qxVersion)
        variant.parent.data["tests"].append(demoData)

        if buildTarget == "source":
            demoBrowserBase = os.path.split(demoBrowser)[0]
            variant.parent._copyHtmlFile(variant.name, buildTarget, demoBrowserBase, qxVersion)


def runGenerator(path, job, macro=False):
    startPath = os.getcwd()
    console.debug("Changing working dir to " + path)
    os.chdir(path)
    cmd = sys.executable + " "
    if not macro:
        cmd += "generate.py "
    else:
        if "QOOXDOO_PATH" in macro:
            cmd += macro["QOOXDOO_PATH"] + "/tool/bin/generator.py "
        else:
            cmd += "generate.py "
        for key, value in macro.iteritems():
            cmd += '-m "%s:%s" ' % (key, value)
    cmd += job
    console.debug("Running generator: %s" % cmd)
    rcode, output, errout = shell.execute_piped(cmd)
    console.debug("Returning to original dir: " + startPath)
    os.chdir(startPath)

    return (rcode, output, errout)


def storeDemoData(data, outPath):
    jsonData = demjson.encode(data, strict=False, compactly=False)
    console.info("Generating demobrowser data: %s" % outPath)
    rFile = codecs.open(outPath, 'w', 'utf-8')
    rFile.write(jsonData)
    rFile.close()


def logLintResult(data):
    if len(data) == 0:
        console.info("No issues found.")
        return

    for category, messages in data.iteritems():
        console.info(category + ":")
        console.indent()
        for message in messages:
            for key, value in message.iteritems():
                console.info("%s: %s" % (key, value))
        console.outdent()


def getComputedConf():
    parser = optparse.OptionParser()

    parser.add_option(
        "-c", "--config-file", dest="configfile", default=None, type="string",
        help="Path of a JSON configuration file that specifies which libraries/versions should be processed."
    )

    parser.add_option(
        "-r", "--repository-path", dest="workdir", default=".", type="string",
        help="Path of the repository to be scanned."
    )

    parser.add_option(
        "-j", "--job-list", dest="joblist", default=None, type="string",
        help="List of jobs to run on the repository."
    )

    parser.add_option(
        "-d", "--demobrowser-path", dest="demobrowser", default=None, type="string",
        help="Path of the Demobrowser that will display the repository's demo apps."
    )

    parser.add_option(
        "--copy-demos", dest="copydemos", action="store_true",
        help="Copy the generated build version of each demo to the demobrowser's demo directory."
    )

    parser.add_option(
        "-s", "--store-issues", dest="storeissues", action="store_true",
        help="Store any errors encountered during job processing in a JSON file (issues.json)."
    )

    parser.add_option(
        "-C", "--cache-dir", dest="cachedir", default=None, type="string",
        help="Cache directory to be used for all build jobs."
    )

    (options, args) = parser.parse_args()

    return (options, args)


class LibraryValidator():
    def __init__(self, config={}):
        self.config = self.setDefaults(config)
        self.includes = self.config["libraries"]["include"]

    def setDefaults(self, config):
        if not config:
            config = {}

        if not "libraries" in config:
            config["libraries"] = {
                "include": {
                    "*": {}
                }
            }

        if not "include" in config["libraries"]:
            config["libraries"]["include"] = {
                "*": {}
            }

        for libName, lib in config["libraries"]["include"].iteritems():
            if not "types" in lib:
                lib["types"] = ["*"]
            if not "versions" in lib:
                lib["versions"] = ["*"]
            if not "qooxdoo-versions" in lib:
                lib["qooxdoo-versions"] = ["*"]

        return config

    def isValidKey(self, key, inc, exc={}):
        if ("*" in inc or key in inc) and not ("*" in exc or key in exc):
            return True
        else:
            return False

    def isValidAttribute(self, libName, key, value):
        if libName in self.includes:
            includes = self.includes[libName][key]
        elif "*" in self.includes:
            includes = self.includes["*"][key]
        else:
            return False

        try:
            excludes = self.config["libraries"]["exclude"][libName][key]
        except KeyError:
            excludes = {}

        return self.isValidKey(value, includes, excludes)

    def isValidLibrary(self, libName):
        return self.isValidKey(libName, self.includes)

    def isValidVersion(self, libName, version):
        return self.isValidAttribute(libName, "versions", version)

    def isValidType(self, libName, type):
        return self.isValidAttribute(libName, "types", type)

    def isValidQxVersion(self, libName, qxVersions):
        for qxVer in qxVersions:
            if self.isValidAttribute(libName, "qooxdoo-versions", qxVer):
                return True
        return False

    def isValid(self, libName, type, version, qxVersions):
        isValidLib = self.isValidLibrary(libName)
        isValidType = self.isValidType(libName, type)
        isValidVersion = self.isValidVersion(libName, version)
        isValidQxVersion = self.isValidQxVersion(libName, qxVersions)
        return isValidLib and isValidType and isValidVersion and isValidQxVersion


def main():
    global options
    (options, args) = getComputedConf()

    config = None
    if options.configfile:
        config = getDataFromJsonFile(options.configfile)

    repository = Repository(options.workdir, config)

    if options.demobrowser:
        if not os.path.isabs(options.demobrowser):
            options.demobrowser = os.path.abspath(options.demobrowser)

    if options.joblist:
        jobs = options.joblist.split(",")
        for job in jobs:
            # build all demos
            if job[:6] == "demos-":
                repository.buildAllDemos(job[6:])

            # store repository data JSON file in the demobrowser's script directory
            elif job == "store-data":
                outPath = os.path.join(options.demobrowser, "script")
                repository.storeData(outPath)

            # run a lint check on all libraries
            elif job == "lint-check":
                repository.lintCheckAll()

            # any other job: run it on all library versions
            else:
                if options.cachedir and os.path.isdir(options.cachedir):
                    tempdir = options.cachedir
                else:
                    tempdir = tempfile.gettempdir()
                macro = {
                    "QOOXDOO_PATH": "../../qooxdoo/trunk",
                    "CACHE": tempdir + "/cache/trunk"
                }
                repository.runGeneratorForAll(job, macro)


if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "    * Keyboard Interrupt"
        sys.exit(1)
