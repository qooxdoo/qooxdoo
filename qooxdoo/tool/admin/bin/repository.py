#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007-2009 1&1 Internet AG, Germany, http://www.1und1.de
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

##
# repository.py -- represents a repository (e.g. qooxdoo-contrib) containing a 
# number of libraries.
##

import os, sys, re, optparse
import qxenviron
import simplejson as json
import codecs
from generator.runtime.Log import Log
from generator.runtime.ShellCmd import ShellCmd

class Repository:
  """Represents a repository containing qooxdoo libraries."""
  def __init__(self, repoDir, config=None):
    """Create a new repository instance by scanning a directory containing
    qooxdoo libraries. By default, all libraries found will be included. 
    Optionally, specific libraries or versions thereof can be selected using a
    configuration dictionary - see config.demo.json in the contrib demobrowser
    for an example. 

    Keyword arguments:
    repoDir -- File system path of the directory to scan
    config -- (optional) Configuration dictionary
    """
    global console
    console = Log(None, "info")
    global shell
    shell = ShellCmd()
    
    processLibs = None
    if config:
      if "libraries" in config:
        processLibs = config["libraries"]
    
    self.dir = repoDir
    if not os.path.isabs(self.dir):
      self.dir = os.path.abspath(self.dir)
    
    self.libraries = self.getLibraries(processLibs)
    
  def getLibraries(self, processLibs):
    console.info("Processing repository in %s" %self.dir)
    libraries = {}
    for root, dirs, files in os.walk(self.dir, topdown=True):
      for name in dirs[:]:
        # ignore subdirectories and SVN cruft
        if root != self.dir or name[0] == ".":
          dirs.remove(name)
          console.outdent()
          continue        
        
        # only process selected libraries
        console.indent()
        
        if processLibs:
          if name in processLibs:
            console.info("Processing library %s" %name)
            lib = Library(self, name, processLibs[name])
            libraries[name] = lib
          elif "*" in processLibs:
            console.info("Processing library %s" %name)
            lib = Library(self, name, processLibs["*"])
            libraries[name] = lib      
        else:
          # find all libraries
          console.info("Processing library %s" %name)
          lib = Library(self, name, [])
          libraries[name] = lib
        
        console.outdent()
    
    console.info("Found %s libraries." %len(libraries))
    return libraries
  
  def buildAllDemos(self, demoVersion="build", demoBrowser=None):
    demoData = []
    
    for libraryName in self.libraries:
      library = self.libraries[libraryName]
      libraryData = {
        "classname": libraryName, 
        "tests": []
      }
      validDemo = False
      for versionName in library.versions:
        version = library.versions[versionName]
        
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
      jsonData = json.dumps(demoData, sort_keys=True, indent=4)
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
    
    qooxdooVersions = self.libraries[library].versions[version].getManifest()["info"]["qooxdoo-versions"]
    for ver in qooxdooVersions:
      demoDict["tags"].append("qxVersion_" + ver)

    return demoDict

class Library:
  def __init__(self, repository = None, libraryDir = None, restrictions = None):
    if not (libraryDir and repository):
      raise RuntimeError, "Repository and library directory must be defined!"
    self.repository = repository
    self.dir = libraryDir
    self.path = os.path.join(self.repository.dir, self.dir)
    self.versions = self.getVersions(restrictions)
    
  def getVersions(self, restrictions):
    versions = {}
    libraryPath = os.path.join(self.repository.dir, self.dir)
    for root, dirs, files in os.walk(libraryPath, topdown=True):
      for name in dirs[:]:
        console.indent()
        # only check direct subfolders of the library, ignore .svn etc.
        if root != libraryPath or name[0] == ".":
          dirs.remove(name)
          console.outdent()
          continue
             
        if self.isValidVersion(name, libraryPath, restrictions):
          console.info("Processing library version %s" %name)
          try:
            libVersion = LibraryVersion(self, name)
            versions[name] = libVersion
          except Exception, e:
            console.warn("%s version %s not added: %s" %(self.dir,name,e.message))
        
        console.outdent()
    return versions
  
  def isValidVersion(self, versionName, libraryPath, restrictions):
    if not restrictions:
      return True
    
    if "versions" in restrictions:
      if len(restrictions["versions"]) > 0 and (not "*" in restrictions["versions"]):
        if versionName not in restrictions["versions"]:
          return False
        
    if "qooxdoo-versions" in restrictions:
      if len(restrictions["qooxdoo-versions"]) > 0 and (not "*" in restrictions["qooxdoo-versions"]):
        manifestPath = os.path.join(libraryPath, versionName, "Manifest.json")
        
        try:
          versionManifest = getDataFromJsonFile(manifestPath)
        except Exception:
          return False
        compatibleWith = versionManifest["info"]["qooxdoo-versions"]
        foundCompatible = False
        for qxVersion in restrictions["qooxdoo-versions"]:
          if qxVersion in compatibleWith:
            foundCompatible = True
        if not foundCompatible:
          return False
    
    return True


class LibraryVersion:  
  def __init__(self, library, versionDir = None):
    if not (library and versionDir):
      raise RuntimeError, "Both the library and this version's directory must be defined!"
    
    self.library = library
    self.dir = versionDir
    self.path = os.path.join(self.library.repository.dir, self.library.dir, self.dir)
    try:
      self.manifest = self.getManifest()
    except Exception:
      raise RuntimeError, "Couldn't get manifest for version %s" %self.dir
    
    self.svnRevision = self.getSvnRevision()
    self.hasSourceDir = False
    self.hasDemoDir = False
    self.demoVariants = self.getDemoVariants()
    self.demoBuildStatus = {}
    # TODO self.hasTestDir = False
    self.hasReadmeFile = False
    self.hasGenerator = False
    self.checkStructure()

  def checkStructure(self):    
    if os.path.isdir(os.path.join(self.path, "source")):
      self.hasSourceDir = True
    
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
    try:
      return self.lintResult
    except AttributeError:
      pass
    
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
  
  def buildDemo(self, demoVariant = "default", demoVersion = "build"):
    if not self.hasDemoDir:
      console.error("Library %s version %s has no demo folder!" %(self.library.dir, self.dir))
      return
    
    cmd = "python " + os.path.join(self.path, "demo", demoVariant, "generate.py") + " " + demoVersion 
    console.info("Building %s version of demo variant %s for library %s version %s" %(demoVersion,demoVariant, self.library.dir, self.dir) )
    rcode, output, errout = shell.execute_piped(cmd)
    
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


def getDataFromJsonFile(path):
  try:
    jsonFile = codecs.open(path, "r", "UTF-8")
  except:
    raise RuntimeError, "File %s not found" %jsonFile
    
  try:
    return json.load(jsonFile)
  except Exception, e:
    raise RuntimeError, "Couldn't parse JSON from file %s" %jsonFile


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
    configFile = codecs.open(options.configfile, 'r', 'utf-8')
    configJson = configFile.read()
    config = json.loads(configJson)

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