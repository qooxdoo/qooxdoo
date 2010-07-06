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

import os, sys, re, optparse, codecs, demjson
import qxenviron
from generator.runtime.Log import Log
from generator.runtime.ShellCmd import ShellCmd
from misc.copytool import CopyTool
from misc import filetool

global console
console = Log(None, "info")
global shell
shell = ShellCmd()

class Repository:
  def __init__(self, repoDir, config=None):
    self.dir = os.path.abspath(repoDir)
    self.validator = LibraryValidator(config)
    
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
      
    self.libraries = self.getLibraries(manifests)
    
  def hasExplicitIncludes(self):
    explicit = False
    for (key, value) in self.validator.config["libraries"]["include"].iteritems():
      if key == "*" or not "versions" in value:
        return False
      for ver in value["versions"]:
        if ver == "*":
            return False
        else:
          explicit = True
    return explicit
  
  def getExplicitManifests(self):
    manifests = []
    for (key, value) in self.validator.config["libraries"]["include"].iteritems():
      if not "versions" in value:
        raise Exception("Insufficient configuration details for getExplicitManifests")
      for ver in value["versions"]:
        manifestPath = os.path.join(self.dir, key, ver, "Manifest.json")
        if not os.path.isfile(manifestPath):
          raise Exception("getExplicitManifest failed: Manifest not in expected location: %s" %manifestPath)
        manifests.append(manifestPath)
    return manifests
  
  def scanRepository(self):
    console.info("Scanning %s" %self.dir)
    console.indent()
    demoDir = "%sdemo%s" %(os.sep,os.sep)
    manifestPaths = []
    
    for root, dirs, files in filetool.walk(self.dir, topdown=True):
      for dir in dirs:
        path = os.path.join(root,dir)
        manifestPath = os.path.join(path, "Manifest.json")
        
        if demoDir in manifestPath:
          dirs.remove(dir)
          continue
        
        if os.path.isfile(manifestPath):
          console.debug("Found manifest: " + repr(manifestPath) )
          manifestPaths.append(manifestPath)

    console.info("Found %s manifests" %len(manifestPaths))
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
        console.error("Could not read manifest file %s" %manifestPath)
        console.indent()
        console.error(str(e))
        console.outdent()
        continue
      
      if not "info" in manifest:
        console.warn("Manifest file %s has no 'info' section, skipping the library." %manifestPath)
        continue
      
      libraryName = manifest["info"]["name"]
      libraryVersion = manifest["info"]["version"]
      libraryQxVersions = manifest["info"]["qooxdoo-versions"]
      
      try:
        libraryType = manifest["provides"]["type"]
      except KeyError:
        libraryType = None
        
      if not self.validator.isValid(libraryName, libraryType, libraryVersion, libraryQxVersions):
        console.debug("Skipping excluded library %s")
        continue
      
      if libraryName not in libraries:
        libraries[libraryName] = {}
      
      console.info("Adding library %s version %s..." %(libraryName,libraryVersion), False)
      if libraryVersion not in libraries[libraryName]:
        # create LibraryVersion instance
        versionPath = os.path.abspath(os.path.dirname(manifestPath))
        libVer = LibraryVersion(libraryVersion, libraryName, versionPath)
        libVer.manifest = manifest
        libraries[libraryName][libraryVersion] = libVer
        console.write(" Done.", "info")
      else:
        console.write("")
        console.indent()
        console.error("Found additional manifest for version %s of library %s: %s" %(libraryVersion,libraryName,manifestPath))
        console.outdent()
    
    console.outdent()
    return libraries


  def getReadmeContent(self, path):
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


  def buildAllDemos(self, demoVersion="build", demoBrowser=None, copyDemos=False):
    if demoBrowser:
      demoBrowser = os.path.abspath(demoBrowser)
    console.info("Generating demos for all known libraries")
    repositoryData = []
    console.indent()
    
    for libraryName in self.libraries:
      library = self.libraries[libraryName]
      libraryData = {
        "classname": libraryName,
        "children" : []
      }
      
      validDemo = False
      for versionName in library:
        version = library[versionName]
        
        versionData = {
          "classname" : versionName,
          "tags" : [libraryName],
          "tests" : [],
          "manifest" : version.getManifest()
        }
        
        qooxdooVersions = version.getManifest()["info"]["qooxdoo-versions"]
        for ver in qooxdooVersions:
          versionData["tags"].append("qxVersion_" + ver)
        
        # getting the library's top-level readme here since we only have path
        # information for the library versions
        if not "readme" in libraryData:
          libDir = os.path.dirname(version.path) 
          readme = self.getReadmeContent(libDir)
          if readme:
            libraryData["readme"] = readme
          else:
            libraryData["readme"] = "No readme file found."
        
        # get the version's readme
        if not "readme" in versionData:
          readme = self.getReadmeContent(version.path)
          if readme:
            versionData["readme"] = readme
          else:
            versionData["readme"] = "No readme file found."
        
        if not version.hasDemoDir:
          continue
        
        demoVariants = version.getDemoVariants()
        if not demoVariants:
          continue
        
        for variant in demoVariants:
          # source/build dirs at this level means the demo has a non-standard structure
          if variant == "source" or variant == "build":
            continue
          status = version.buildDemo(variant, demoVersion)
          #DEBUG:
          #status = {"buildError" : None}
          if demoBrowser and not status["buildError"]:
            if copyDemos:
              sourceDir = os.path.join(version.path, "demo", variant, demoVersion)
              targetDir = os.path.join(demoBrowser, demoVersion, "demo", libraryName, versionName, variant)
              #self.copyDemo(sourceDir, targetDir)
              copier = CopyTool()
              copier.parse_args(["-u", sourceDir, targetDir])
              copier.do_work()
              self.copyHtmlFile(libraryName, versionName, variant, demoVersion, demoBrowser, local=True)
            else:
              self.copyHtmlFile(libraryName, versionName, variant, demoVersion, demoBrowser)
            
            demoData = self.getDemoData(libraryName, versionName, variant)
            demoData["manifest"] = version.getDemoManifest(variant)
            versionData["tests"].append(demoData)
            validDemo = True
      
      if validDemo:
        libraryData["children"].append(versionData)
        repositoryData.append(libraryData)

    if demoBrowser:
      jsonData = demjson.encode(repositoryData, strict=False, compactly=False)
      dbScriptDir = os.path.join(demoBrowser, demoVersion, "script")
      if not os.path.isdir(dbScriptDir):
        os.mkdir(dbScriptDir)
      outPath = os.path.join(dbScriptDir, "demodata.json")
      console.info("Generating demobrowser data: %s" %outPath)
      rFile = codecs.open(outPath, 'w', 'utf-8')
      rFile.write(jsonData)
      rFile.close() 
    
    console.outdent()            
  
  
  def buildAllTestrunners(self, job="test"):
    console.indent()
    for libraryName, library in self.libraries.iteritems():
      for versionName, libraryVersion in library.iteritems():
        libraryVersion.buildTestrunner(job)
  
  
  def runGeneratorForAll(self, job, subPath=None, cwd=False):
    console.indent()
    for libraryName, library in self.libraries.iteritems():
      for versionName, libraryVersion in library.iteritems():
        console.info("Running job %s on %s %s..." %(job, libraryName, versionName))
        ret, out, err = libraryVersion.runGenerator(job, subPath, cwd)
        console.debug(out)
        if ret > 0:
          console.error(err)
    console.outdent()


  # creates an HTML file for the demo in the demobrowser's "demo" dir by 
  # modifying the demo_template.html file in the demobrowser's resource dir.
  # This file simply does a meta redirect to the generated demo. 
  def copyHtmlFile(self, libraryName, versionName, variantName, demoVersion, demoBrowser, local=False):    
    #get some needed info from the demobrowser's manifest
    dbManifest = getDataFromJsonFile(os.path.join(demoBrowser, "Manifest.json"))
    dbResourcePath = dbManifest["provides"]["resource"]
    dbNamespace = dbManifest["provides"]["namespace"]
    
    sourceFilePath = os.path.join(demoBrowser, dbResourcePath, dbNamespace, "demo_template.html")
    sourceFile = codecs.open(sourceFilePath, 'r', 'utf-8')
    
    targetDir = os.path.join(demoBrowser, demoVersion, "demo", libraryName, versionName)
    
    if not os.path.isdir(targetDir):
      os.makedirs(targetDir)
    targetFilePath = os.path.join(targetDir, variantName +  ".html")
    console.info("Copying HTML file for demo %s %s %s %s to the demobrowser" %(libraryName,versionName,variantName,demoVersion))
    targetFile = codecs.open(targetFilePath, "w", "utf-8")
    
    demoPath = os.path.join( self.libraries[libraryName][versionName].path, "demo", variantName, demoVersion)
    # the demo's HTML file lives under source|build/demo/libraryName
    if local:
      demoUrl = "/".join([variantName, demoVersion])
    else:
      demoUrl = "../../../../" + self.getDemoUrl(demoBrowser, demoPath)
    demoUrl += "/index.html"
    
    for line in sourceFile:
      targetFile.write(line.replace("$LIBRARY", demoUrl))
    
    targetFile.close()


  # attempts to calculate a relative link from the Demo Browser to the Demo.
  def getDemoUrl(self, demoBrowser, demo):    
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
  
  
  def getDemoData(self, library, version, variant):
    demoDict = {
      "name": variant + ".html",
      "nr": variant.capitalize(),
      "title": library + " " + version + " " + variant
    }

    return demoDict


def getDataFromJsonFile(path):
  try:
    jsonFile = codecs.open(path, "r", "UTF-8")
  except:
    raise Exception("File %s not found" %path)
    
  data = jsonFile.read()
  jsonFile.close()
  
  try:
    return demjson.decode(data, allow_comments=True)
  except Exception, e:
    raise Exception("Couldn't parse JSON from file %s" %path)    


class LibraryVersion:  
  def __init__(self, versionName, libraryName, path):    
    self.versionName = versionName
    self.libraryName = libraryName
    self.path = path
    
    self.checkStructure()
    self.demoVariants = self.getDemoVariants()
    self.demoBuildStatus = {}
    
  
  def checkStructure(self):        
    self.hasDemoDir = False
    self.demoVariants = []
    if os.path.isdir(os.path.join(self.path, "demo")):
      self.hasDemoDir = True
      self.demoVariants = self.getDemoVariants()
    
    self.hasReadmeFile = False
    if os.path.isfile(os.path.join(self.path, "README")):
      self.hasReadmeFile = True
    
    self.hasGenerator = False
    if os.path.isfile(os.path.join(self.path, "generate.py")):
      self.hasGenerator = True
  
  
  def getManifest(self):
    try:
      return self.manifest
    except AttributeError:
      pass
    
    manifestPath = os.path.join(self.path, "Manifest.json")
    
    return getDataFromJsonFile(manifestPath)
  
  
  def getDemoManifest(self, demoVariant = "default"):
    manifestPath = os.path.join(self.path, "demo", demoVariant, "Manifest.json")
    return getDataFromJsonFile(manifestPath)
  
  
  def hasUnitTests(self):    
    try:
      classPath = self.getManifest()["provides"]["class"]
      namespace = self.getManifest()["provides"]["namespace"]
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
  
  
  def buildTestrunner(self, job="test"):
    console.info("Building Testrunner for %s %s... " %(self.libraryName, self.versionName))
    if not (self.hasGenerator and self.hasUnitTests()):
      console.write("Nothing to do.", "info")
      return
    
    rcode, output, errout = self.runGenerator(job)
    if rcode > 0:
      console.write("ERROR: ")
      console.indent()
      console.error(errout)
      console.outdent()
    else:
      console.write(" Done.", "info")
  
  
  def getLintResult(self):    
    if not self.hasGenerator:
      raise Exception("%s %s has no generate.py script!" %(self.libraryName, self.versionName))
    
    from lintRunner import QxLint
    
    class LintOpts:
      def __init__(self,workdir,mailto = None):
        self.workdir = workdir
        self.mailto = mailto
        self.outputfile = None
        
    lintOpts = LintOpts(self.path)
    lint = QxLint(lintOpts)
    self.lintResult = lint.data
    
    return self.lintResult
  
  
  def getSvnRevision(self):
    try:
      return self.svnRevision
    except:
      pass
    
    cmd = "svnversion %s" %self.path
    rcode, output, errout = shell.execute_piped(cmd)
    
    if rcode > 0:
      raise Exception("Error while retrieving SVN version: " + errout)
    
    svnRevision = output.rstrip('\n')
    return svnRevision
  
  
  def getDemoVariants(self):
    if not self.hasDemoDir:
      return False
    
    demoVariants = []
    demoPath = os.path.join(self.path, "demo")
    for root, dirs, files in filetool.walk(demoPath, topdown=True):
      for name in dirs:        
        if root == demoPath and name[0] != ".":
          demoVariants.append(name)
    
    return demoVariants
  
  
  def runGenerator(self, job, subPath=None):
    if not self.hasGenerator:
      raise Exception("%s %s has no generate.py script!" %(self.libraryName, self.versionName))
    path = self.path
    if subPath:
      path = os.path.join(path, subPath)
    startPath = os.getcwd()
    os.chdir(path)
    cmd = "python generate.py %s" %job
    rcode, output, errout = shell.execute_piped(cmd)
    os.chdir(startPath)
    return (rcode,output,errout)
  
  
  def buildDemo(self, demoVariant = "default", demoVersion = "build"):
    demoBuildStatus = {}
    try:
      demoBuildStatus["svnRevision"] = self.getSvnRevision()
    except:
      pass
    
    if not self.hasDemoDir:
      msg = "Library %s version %s has no demo folder!" %(self.library.dir, self.dir)
      console.error(msg)
      demoBuildStatus["buildError"] = msg 
      return demoBuildStatus
    
    console.info("Generating %s version of demo variant %s for library %s version %s" %(demoVersion,demoVariant, self.libraryName, self.versionName) )
    subPath = os.path.join("demo", demoVariant)
    try:
      rcode, output, errout = self.runGenerator(demoVersion, subPath)
    except Exception, e:
      msg = "Error running generator: " + str(e)
      console.error(e)
      demoBuildStatus["buildError"] = msg 
      return demoBuildStatus
    
    #some demos don't produce a qooxdoo application, so they're ignored
    #for the demobrowser
    demoScriptPath = os.path.join(self.path, "demo", demoVariant, demoVersion, "script")
    hasScriptDir = os.path.isdir(demoScriptPath)
    
    if rcode > 0:
      console.error(errout)
      console.info(output)
      if not errout:
        errout = "Unknown error"
      demoBuildStatus["buildError"] = errout
    elif not hasScriptDir:
      console.warn("No script directory created!")
      demoBuildStatus["buildError"] = "No script directory created"
    else:
      console.info("Demo built successfully.")
      demoBuildStatus["buildError"] = None
      
    self.demoBuildStatus = demoBuildStatus
    return demoBuildStatus


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
        "include" : {
          "*" : {}
        }
      }
      
    if not "include" in config["libraries"]:
      config["libraries"]["include"] = {
        "*" : {}
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
  (options,args) = getComputedConf()
  
  config = None
  if options.configfile:
    config = getDataFromJsonFile(options.configfile)

  repository = Repository(options.workdir, config)
  
  if options.joblist:
    jobs = options.joblist.split(",")
    for job in jobs:
      if job[:6] == "demos-":
        if options.demobrowser:
          if not os.path.isabs(options.demobrowser):
            options.demobrowser = os.path.abspath(options.demobrowser)
          repository.buildAllDemos(job[6:], options.demobrowser, options.copydemos)
        else:
          repository.buildAllDemos(job[6:])

if __name__ == '__main__':
  try:
    main()

  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    sys.exit(1)