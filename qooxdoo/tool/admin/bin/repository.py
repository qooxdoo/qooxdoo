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
from generator.runtime.Log import Log
from generator.runtime.ShellCmd import ShellCmd
try:
  import json
except ImportError, e:
  try:
    import simplejson as json
  except ImportError, e:
    raise RuntimeError, "No JSON module found: %s" %e


class Repository:
  def __init__(self, repoDir, processLibs = None):
    global console
    console = Log(None, "info")
    global shell
    shell = ShellCmd()
    
    self.dir = repoDir
    self.libraries = self.getLibraries(processLibs)
    
  def getLibraries(self, processLibs = None):    
    console.info("Processing repository in %s" %self.dir)
    libraries = {}
    for root, dirs, files in os.walk(self.dir, topdown=True):
      for name in dirs:
        # ignore subdirectories and SVN cruft
        if root == self.dir and name[0] != ".":
        
          if processLibs:
            # only process selected libraries
            if name in processLibs:
              console.indent()
              console.info("Processing selected library %s" %name)
              lib = Library(self, name, processLibs[name])
              libraries[name] = lib
              console.outdent()                
          else:
            # find all libraries
            console.indent()
            console.info("Processing found library %s" %name)
            lib = Library(self, name, [])
            libraries[name] = lib
            console.outdent()
    return libraries
  
  def buildAllDemos(self):
    for libraryName in self.libraries:
      library = self.libraries[libraryName]
      for versionName in library.versions:
        version = library.versions[versionName]
        if version.hasDemoDir:
          demoVariants = version.getDemoVariants()
          if demoVariants:
            for variant in demoVariants:
              version.buildDemo(variant)


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
      for name in dirs:
        console.indent()
        # only check direct subfolders of the library, ignore .svn etc.
        if root == libraryPath and name[0] != ".":          
          # only get requested versions
          if len(libraryVersions) > 0:
            if name in libraryVersions:
              console.info("Processing selected version %s" %name)
              libVersion = LibraryVersion(self, name)
              versions[name] = libVersion
          elif name == "trunk" or "." in name:
            console.info("Processing found version %s" %name)
            libVersion = LibraryVersion(self, name)
            versions[name] = libVersion
        console.outdent()
    return versions


class LibraryVersion:  
  def __init__(self, library, versionDir = None):    
    if not (library and versionDir):
      raise RuntimeError, "Both the library and this version's directory must be defined!"
    
    self.library = library
    self.dir = versionDir
    self.versionPath = os.path.join(self.library.repository.dir, self.library.dir, self.dir)
    self.hasSourceDir = False
    self.hasDemoDir = False
    self.demoVariants = self.getDemoVariants()
    # TODO self.hasTestDir = False
    self.hasReadmeFile = False
    self.hasGenerator = False
    
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
    
    self.manifest = json.load(manifestFile)
    return self.manifest
  
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
    
    self.svnRevision = output.rstrip('\n')
    return self.svnRevision
  
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
    console.indent()
    console.info("Build command: %s" %cmd)
    console.outdent()
    rcode, output, errout = shell.execute_piped(cmd)
    
    if rcode > 0:
      console.error(errout)
    else:
      console.info("Demo built successfully.")