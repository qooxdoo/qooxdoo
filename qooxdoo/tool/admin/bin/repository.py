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
# number of libraries
##

import os, sys, re
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
    Optionally, a dictionary containing library/directory names as keys and a 
    list of library version names/subdirectories can be provided, e.g.
    myRepo = Repository("/foo/bar", { "Simulator" : ["trunk"],
                                      "HtmlArea" : ["0.5"] })

    Keyword arguments:
    repoDir -- File system path of the directory to scan
    config -- (optional) Configuration dictionary 

    """
    global console
    console = Log(None, "info")
    global shell
    shell = ShellCmd()
    
    self.config = config
    processLibs = None
    if config:
      if "libraries" in config:
        processLibs = config["libraries"]
    
    self.dir = repoDir
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
        if processLibs:
          if name in processLibs:
            console.indent()
            console.info("Processing library %s" %name)
            lib = Library(self, name, processLibs[name])
            libraries[name] = lib
            console.outdent()
          elif "*" in processLibs:
            console.indent()
            console.info("Processing library %s" %name)
            lib = Library(self, name, processLibs["*"])
            libraries[name] = lib
            console.outdent()
        
        else:
          # find all libraries
          console.indent()
          console.info("Processing library %s" %name)
          lib = Library(self, name, [])
          libraries[name] = lib
          console.outdent()
    
    console.info("Found %s libraries." %len(libraries))
    return libraries
  
  def buildAllDemos(self, selectedVariant=None):
    demoData = []
    if self.config:
      if "demobrowser" in self.config:
        demoBrowser = True
    
    for libraryName in self.libraries:
      library = self.libraries[libraryName]
      for versionName in library.versions:
        version = library.versions[versionName]
        if version.hasDemoDir:
          demoVariants = version.getDemoVariants()
          if demoVariants:
            
            libraryData = {
              "classname": libraryName, 
              "tests": []
            }
            
            for variant in demoVariants:
              if selectedVariant:
                if selectedVariant == variant:
                  version.buildDemo(variant)
                  if demoBrowser:
                    demobrowserDir = self.config["demobrowser"]["path"]
                    htmlfile = self.copyHtmlFile(libraryName, variant)
                    libraryData["tests"].append(self.getDemoData(libraryName, variant))
              else:  
                version.buildDemo(variant)
                if self.config:
                  if demoBrowser:
                    demobrowserDir = self.config["demobrowser"]["path"]
                    htmlfile = self.copyHtmlFile(libraryName, variant)
                    libraryData["tests"].append(self.getDemoData(libraryName, variant))
    
            demoData.append(libraryData)

    if demoBrowser:
      jsonData = json.dumps(demoData, sort_keys=True, indent=4)
      outPath = os.path.join(self.dir, self.config["demobrowser"]["path"], "source", "script", "demodata.json")
      rFile = codecs.open(outPath, 'w', 'utf-8')
      rFile.write(jsonData)
      rFile.close() 
                
  
  def copyHtmlFile(self, category, item, demobrowserDir=None):
    if not demobrowserDir:
      demobrowserDir = os.path.join(self.dir, "demobrowser")
    sourceFilePath = os.path.join(demobrowserDir,"source", "demo", "template.html")
    sourceFile = codecs.open(sourceFilePath, 'r', 'utf-8')
    targetDir = os.path.join(demobrowserDir,"source", "demo", category)
    if not os.path.isdir(targetDir):
      os.mkdir(targetDir)
    targetFilePath = os.path.join(targetDir, item + ".html")
    targetFile = codecs.open(targetFilePath, "w", "utf-8")
    #targetFile.write(sourceFile.read())
    for line in sourceFile: 
      demoUrl = "../../../../%s/trunk/demo/%s/build/" %(category,item)
      targetFile.write(line.replace("$LIBRARY", demoUrl))
    
    targetFile.close()
    return targetFilePath
    #print "Copying html to " + targetFile
  
  def getDemoData(self, category, item):
    demoDict = {
      "name": item + ".html",
      "nr": item.capitalize(),
      "tags": [
          category
          #TODO: get more tags
      ],
      "title": category + "AFFE!!!"
    }

    return demoDict

class Library:
  def __init__(self, repository = None, libraryDir = None, libraryVersions = [] ):
    if not (libraryDir and repository):
      raise RuntimeError, "Repository and library directory must be defined!"
    self.repository = repository
    self.dir = libraryDir
    self.versions = self.getVersions(libraryVersions)
    
  def getVersions(self, libraryVersions):
    versions = {}
    libraryPath = os.path.join(self.repository.dir, self.dir)
    for root, dirs, files in os.walk(libraryPath, topdown=True):
      #print root, dirs
      for name in dirs[:]:
        console.indent()
        # only check direct subfolders of the library, ignore .svn etc.
        if root != libraryPath or name[0] == ".":
          dirs.remove(name)
          console.outdent()
          continue
        if len(libraryVersions) > 0:
          if name in libraryVersions:
            console.info("Processing selected version %s" %name)
            try:
              libVersion = LibraryVersion(self, name)
              versions[name] = libVersion
            except Exception, e:
              console.warn("%s version %s not added: %s" %(self.dir,name,e.message))
        elif name == "trunk" or "." in name:
          console.info("Processing found version %s" %name)
          try:
            libVersion = LibraryVersion(self, name)
            versions[name] = libVersion
          except Exception, e:
            console.warn("%s version %s not added: %s" %(self.dir,name,e.message))
        console.outdent()
    return versions


class LibraryVersion:  
  def __init__(self, library, versionDir = None):
    if not (library and versionDir):
      raise RuntimeError, "Both the library and this version's directory must be defined!"
    
    self.library = library
    self.dir = versionDir
    self.versionPath = os.path.join(self.library.repository.dir, self.library.dir, self.dir)
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
    #console.info("Checking library %s")
    self.checkStructure()

  def checkStructure(self):    
    if os.path.isdir(os.path.join(self.versionPath, "source")):
      self.hasSourceDir = True
    
    if os.path.isdir(os.path.join(self.versionPath, "demo")):
      self.hasDemoDir = True
      self.demoVariants = self.getDemoVariants()
    
    if os.path.isfile(os.path.join(self.versionPath, "README")):
      self.hasReadmeFile = True
    
    if os.path.isfile(os.path.join(self.versionPath, "generate.py")):
      self.hasGenerator = True
  
  def getManifest(self):
    try:
      return self.manifest
    except AttributeError:
      pass
    
    manifestPath = os.path.join(self.versionPath, "Manifest.json")
    
    try:
      manifestFile = open(manifestPath)
    except:
      raise RuntimeError, "Manifest file %s not found" %manifestPath
    
    manifest = json.load(manifestFile)
    return manifest
  
  def getDemoManifest(self, demoVariant = "default"):
    manifestPath = os.path.join(self.versionPath, "demo", demoVariant, "Manifest.json")
    
    try:
      manifestFile = open(manifestPath)
    except:
      raise RuntimeError, "Manifest file %s not found" %manifestPath
    
    manifest = json.load(manifestFile)
    return manifest
  
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
        
    lintOpts = LintOpts(self.versionPath)
    lint = QxLint(lintOpts)
    self.lintResult = lint.data
    
    return self.lintResult
  
  def getSvnRevision(self):
    try:
      return self.svnRevision
    except:
      pass
    
    cmd = "svnversion %s" %self.versionPath
    rcode, output, errout = shell.execute_piped(cmd)
    
    if rcode > 0:
      raise RuntimeError, "Error while retrieving SVN version: " + errout
    
    svnRevision = output.rstrip('\n')
    return svnRevision
  
  def getDemoVariants(self):
    if not self.hasDemoDir:
      return False
    
    demoVariants = []
    demoPath = os.path.join(self.versionPath, "demo")
    for root, dirs, files in os.walk(demoPath, topdown=True):
      for name in dirs:        
        if root == demoPath and name[0] != ".":
          demoVariants.append(name)
    
    return demoVariants
  
  def buildDemo(self, demoVariant = "default"):
    if not self.hasDemoDir:
      console.error("Library %s version %s has no demo folder!" %(self.library.dir, self.dir))
      return
    
    cmd = "python " + os.path.join(self.versionPath, "demo", demoVariant, "generate.py") + " build" 
    console.info("Building demo variant %s for library %s version %s" %(demoVariant, self.library.dir, self.dir) )
    #console.indent()
    #console.info("Build command: %s" %cmd)
    #console.outdent()
    rcode, output, errout = shell.execute_piped(cmd)
    
    demoBuildStatus = {
      "svnRevision" : self.getSvnRevision()
    }
    
    if rcode > 0:
      console.error(errout)
      console.info(output)
      demoBuildStatus["buildError"] = errout
    else:
      console.info("Demo built successfully.")
      demoBuildStatus["buildError"] = None
      
    self.demoBuildStatus = demoBuildStatus
    
