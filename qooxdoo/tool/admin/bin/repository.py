#! /usr/bin/env python

import os, sys, re, optparse
import qxenviron
import demjson
import codecs
from generator.runtime.Log import Log
from generator.runtime.ShellCmd import ShellCmd

global console
console = Log(None, "info")
global shell
shell = ShellCmd()

class Repository:
  def __init__(self, repoDir, config=None):
    self.dir = os.path.abspath(repoDir)
    self.filter = config
    
    manifests = self.scanRepository()
    self.libraries = self.getLibraries(manifests)
    
    
  def scanRepository(self):
    console.indent()
    console.info("Scanning %s" %self.dir)
    demoDir = "%sdemo%s" %(os.sep,os.sep)
    manifestPaths = []
    for root, dirs, files in os.walk(self.dir, topdown=True):
      for name in files[:]:
        #if "Bugs" in root:
        #  dirs = []
        #  files = []
        if name == "Manifest.json" and root != self.dir:           
          console.debug("Found manifest: " + os.path.join(root, name))
          manifestPath = os.path.join(root,name)
          if not demoDir in manifestPath:
            manifestPaths.append(manifestPath)
          dirs = []
          files = []
    console.info("Found %s manifests" %len(manifestPaths))
    console.outdent()
    return manifestPaths
  
  
  def getLibraries(self, manifests):
    libraries = {}
    for manifestPath in manifests:
      try:
        manifest = getDataFromJsonFile(manifestPath)
      except RuntimeError, e:
        console.error(repr(e))
      
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
        
      if not self.isSelected(libraryName, libraryVersion, libraryType, libraryQxVersions):        
        continue
      
      if libraryName not in libraries:
        libraries[libraryName] = {}
      
      if libraryVersion not in libraries[libraryName]:
        console.info("Adding library %s version %s" %(libraryName,libraryVersion))
        # create LibraryVersion instance
        versionPath = os.path.dirname(manifestPath)
        libVer = LibraryVersion(libraryVersion, libraryName, versionPath)
        libVer.manifest = manifest
        libraries[libraryName][libraryVersion] = libVer
      else:
        console.warn("Found additional manifest for version %s of library %s!" %(libraryVersion,libraryName))
    return libraries
    
  
  def isSelectedLibrary(self, libraryName):
    if not "libraries" in self.filter:
      return True
    wantedLibraries = self.filter["libraries"]
    if "*" in wantedLibraries or libraryName in wantedLibraries:
      return True
    else:
      return False
  
  
  def isSelectedVersion(self, libraryName, libraryVersion):    
    if not "libraries" in self.filter:
      return True
    if "*" in self.filter["libraries"]:
      libraryFilter = self.filter["libraries"]["*"]
    else:
      libraryFilter = self.filter["libraries"][libraryName]
    
    if not "versions" in libraryFilter:
      return True
    
    wantedVersions = libraryFilter["versions"]
    
    if "*" in wantedVersions:
      return True
    
    if libraryVersion in wantedVersions:
      return True
    else:
      return False
  
    
  def isSelected(self, libraryName, libraryVersion, libraryType, libraryQxVersion):
    if not self.filter:
      return True
    if not self.isSelectedLibrary(libraryName):
      return False
    if not self.isSelectedVersion(libraryName, libraryVersion):
      return False
    else:
      return True


  def buildAllDemos(self, demoVersion="build", demoBrowser=None):
    demoData = []
    
    for libraryName in self.libraries:
      library = self.libraries[libraryName]
      libraryData = {
        "classname": libraryName, 
        "tests": []
      }
      validDemo = False
      for versionName in library:
        version = library[versionName]
        
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
          if demoBrowser and not status["buildError"]:
            htmlfile = self.copyHtmlFile(libraryName, versionName, variant, demoVersion, demoBrowser)
            libraryData["tests"].append(self.getDemoData(libraryName, versionName, variant))
            validDemo = True
      
      if validDemo:
        demoData.append(libraryData)

    if demoBrowser:      
      #jsonData = json.dumps(demoData, sort_keys=True, indent=4)
      jsonData = demjson.encode(demoData, strict=False, compactly=False)
      dbScriptDir = os.path.join(demoBrowser, demoVersion, "script")
      if not os.path.isdir(dbScriptDir):
        os.mkdir(dbScriptDir)
      outPath = os.path.join(dbScriptDir, "demodata.json")
      console.info("Generating demobrowser data: %s" %outPath)
      rFile = codecs.open(outPath, 'w', 'utf-8')
      rFile.write(jsonData)
      rFile.close() 
                
  
  # creates an HTML file for the demo in the demobrowser's "demo" dir by 
  # modifying the demo_template.html file in the demobrowser's resource dir.
  # This file simply does a meta redirect to the generated demo. 
  def copyHtmlFile(self, libraryName, versionName, variantName, demoVersion, demoBrowser):    
    #get some needed info from the demobrowser's manifest
    dbManifest = getDataFromJsonFile(os.path.join(demoBrowser, "Manifest.json"))
    dbResourcePath = dbManifest["provides"]["resource"]
    dbNamespace = dbManifest["provides"]["namespace"]
    
    sourceFilePath = os.path.join(demoBrowser, dbResourcePath, dbNamespace, "demo_template.html")
    sourceFile = codecs.open(sourceFilePath, 'r', 'utf-8')
    
    targetDir = os.path.join(demoBrowser, demoVersion, "demo", libraryName) 
    
    if not os.path.isdir(targetDir):
      os.makedirs(targetDir)
    targetFilePath = os.path.join(targetDir, versionName + "-" + variantName +  ".html")
    console.info("Copying HTML file for demo %s %s %s %s to the demobrowser" %(libraryName,versionName,variantName,demoVersion))
    targetFile = codecs.open(targetFilePath, "w", "utf-8")
    
    for line in sourceFile: 
      demoUrl = "../../../../../%s/%s/demo/%s/%s/" %(libraryName,versionName,variantName,demoVersion)
      targetFile.write(line.replace("$LIBRARY", demoUrl))
    
    targetFile.close()
    return targetFilePath
  
  def getDemoData(self, library, version, variant):
    demoDict = {
      "name": version + "-" + variant + ".html",
      "nr": variant.capitalize(),
      "tags": [library],
      "title": library + " " + version + " " + variant
    }
    
    qooxdooVersions = self.libraries[library][version].getManifest()["info"]["qooxdoo-versions"]
    for ver in qooxdooVersions:
      demoDict["tags"].append("qxVersion_" + ver)

    return demoDict


def getDataFromJsonFile(path):
  try:
    jsonFile = codecs.open(path, "r", "UTF-8")
  except:
    raise RuntimeError, "File %s not found" %jsonFile
    
  data = jsonFile.read()
  jsonFile.close()
  
  try:
    return demjson.decode(data, allow_comments=True)
  except Exception, e:
    raise RuntimeError, "Couldn't parse JSON from file %s" %jsonFile    


class LibraryVersion:  
  def __init__(self, versionName, libraryName, path):    
    self.versionName = versionName
    self.libraryName = libraryName
    self.path = path
    
    self.hasDemoDir = False
    self.demoVariants = self.getDemoVariants()
    self.demoBuildStatus = {}
    self.checkStructure()
    
  
  def checkStructure(self):        
    if os.path.isdir(os.path.join(self.path, "demo")):
      self.hasDemoDir = True
      self.demoVariants = self.getDemoVariants()
    
    if os.path.isfile(os.path.join(self.path, "README")):
      self.hasReadmeFile = True
    
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
  
  
  def getLintResult(self):    
    if not self.hasGenerator:
      raise RuntimeError, "%s %s has no generate.py script!" %(self.libraryName, self.versionName)
    
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
      raise RuntimeError, "Error while retrieving SVN version: " + errout
    
    svnRevision = output.rstrip('\n')
    return svnRevision
  
  
  def getDemoVariants(self):
    if not self.hasDemoDir:
      return False
    
    demoVariants = []
    demoPath = os.path.join(self.path, "demo")
    for root, dirs, files in os.walk(demoPath, topdown=True):
      for name in dirs:        
        if root == demoPath and name[0] != ".":
          demoVariants.append(name)
    
    return demoVariants
  
  
  def runGenerator(self, job, subPath=None, cwd=False):
    if not self.hasGenerator:
      raise RuntimeError, "%s %s has no generate.py script!" %(self.libraryName, self.versionName)
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
    if not self.hasDemoDir:
      console.error("Library %s version %s has no demo folder!" %(self.library.dir, self.dir))
      return
    
    console.info("Building %s version of demo variant %s for library %s version %s" %(demoVersion,demoVariant, self.libraryName, self.versionName) )
    subPath = os.path.join("demo", demoVariant)
    rcode, output, errout = self.runGenerator(demoVersion, subPath)
    
    demoBuildStatus = {
      "svnRevision" : self.getSvnRevision()
    }
    
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
  
  (options, args) = parser.parse_args()

  return (options, args)


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
          repository.buildAllDemos(job[6:], options.demobrowser)
        else:
          repository.buildAllDemos(job[6:])

if __name__ == '__main__':
  try:
    main()

  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    sys.exit(1)