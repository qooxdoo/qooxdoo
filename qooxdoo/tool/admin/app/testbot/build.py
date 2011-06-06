#!/usr/bin/env python
# -*- coding: utf-8 -*-

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

import os
import sys
import codecs
import time
import util

try:
    import json
except ImportError, e:
    import simplejson as json

class Builder():
    timeFormat = '%Y-%m-%d_%H-%M-%S'
  
    def __init__(self, config=None, simulate=False, logger = None):
        self.log = logger
        self.simulate = simulate
        self.config = config
        try:
            buildStatusFile = os.path.join(self.config["stageDir"], "trunk", "qooxdoo", "buildStatus.json")
            self.buildStatus = self.getBuildStatusFromFile(buildStatusFile)
        except Exception, e:
            self.buildStatus = {}
        
    
    def prepareBuildLog(self, buildLogDir, target):
        try:
            if not os.path.isdir(buildLogDir):
                os.mkdir(buildLogDir)
        except Exception, e:
            self.log.error("Failed to create build log directory %s: " %(buildLogDir, str(e)))
            return False
          
        buildLog = os.path.join(buildLogDir, target + '_' + util.getTimestamp() + '.log')
        self.log.info("Opening build log file %s" %buildLog)
        try:
            buildLogFile = codecs.open(buildLog, 'a', 'utf-8')
        except Exception, e:
            self.log.error("Error while opening build log file: %s" %str(e))
          
        return buildLogFile

    
    def buildApp(self, target):
        buildLog = None
        if "buildLogDir" in self.config:
            buildLog = self.prepareBuildLog(self.config["buildLogDir"], target)
            
        cmd = "%s -w %s %s" %(self.config["batbuild"], self.config["stageDir"], self.config["targets"][target])
        
        buildStatusFile = os.path.join(self.config["stageDir"], "trunk", "qooxdoo", "buildStatus.json")
        self.buildStatus = self.getBuildStatusFromFile(buildStatusFile)
        self.buildStatus[target] = {
          "SVNRevision" : util.getSvnVersion(os.path.join(self.config["stageDir"], "trunk")),
          "BuildError"  : False,
          "BuildStarted" : time.strftime(Builder.timeFormat),
          "BuildFinished" : False
        }
        
        if "branch" in self.config:
            self.buildStatus[target]["branch"] = self.config["branch"] 
        
        if (self.simulate):
            if buildLog:
                buildLog.write("Building target %s: %s" %(target, cmd))
                buildLog.close()
            return
          
          
        if (self.config["buildLogLevel"] == "debug" and buildLog):
            # Start build with full logging
            util.invokeLog(cmd, buildLog)
            buildLog.close()
            return
        
        # Start build, only log errors
        self.buildAppWithErrorLogging(target, cmd, buildLog)
        
        self.storeBuildStatus()
        
    def buildAppWithErrorLogging(self, target, cmd, buildLog):
        self.log.info("Building %s: %s" %(target,cmd))
        status, std, err = util.invokePiped(cmd) #@UnusedVariable
        if status > 0:
            if buildLog:
                self.logBuildErrors(buildLog, target, cmd, err)
                buildLog.close()
            
            self.buildStatus[target]["BuildError"] = "Unknown build error"
              
            """Get the last line of batbuild.py's STDERR output which contains
            the actual error message. """
            error = util.getLastLineFromString(err)
            if error:
                self.buildStatus[target]["BuildError"] = error
        else:
            self.log.info("%s build finished without errors." %target)
            self.buildStatus[target]["BuildFinished"] = time.strftime(Builder.timeFormat)
          
    
    def logBuildErrors(self, buildLogFile, target, cmd, err):
        self.log.error("Error while building %s, see build log file for details." %target)
        err = err.rstrip('\n')
        err = err.rstrip('\r')
        buildLogFile.write(target + "\n" + cmd + "\n" + err)
        buildLogFile.write("\n========================================================\n\n")
        
    
    def storeBuildStatus(self, path=None):
        if not path:
            path = os.path.join(self.config["stageDir"], "trunk", "qooxdoo")
      
        jsonData = json.dumps(self.buildStatus, sort_keys=True, indent=2)
        fPath = os.path.join(path,'buildStatus.json')
        if (self.simulate):
            self.log.debug("SIMULATION: Storing build status in file " + fPath)
        else:
            self.log.debug("Storing build status in file " + fPath)
            rFile = codecs.open(fPath, 'w', 'utf-8')
            rFile.write(jsonData)
            rFile.close()
            
    @classmethod
    def getBuildStatusFromFile(cls, path=None):
        buildStatus = {}
        
        if not os.path.isfile(path):
            return buildStatus
        
        try:        
            statusFile = codecs.open(path, 'r', 'utf-8')
            statusJson = statusFile.read()
        except Exception, e:
            log.Logger().warn("Unable to open build status file %s: %s" %(path,str(e)))
        
        try:
            buildStatus = json.loads(statusJson)
            log.Logger().debug("Build status retrieved from file %s" %path)
        except Exception, e:
            log.Logger().warn("Unable to parse build status from file %s: %s" %(path,str(e)))
        
        return buildStatus

        
    def buildAll(self):
        rootPath = os.path.join(self.config["stageDir"], "trunk", "qooxdoo")
        
        if self.config["svnRevert"]:
            try:
                util.svnRevert(rootPath)
            except Exception, e:
                self.log.error("Error reverting SVN: " + str(e))
        
        if self.config["svnUpdate"]:
            try:
                util.svnUpdate(rootPath)
                self.log.info("Updated to revision %s" %util.getSvnVersion(rootPath))
            except Exception, e:
                self.log.error("Error updating SVN: " + str(e))
        
        self.log.info("Building all configured targets.")
        for target in self.config["targets"]:
            self.buildApp(target)

    
    @classmethod
    def testGenerator(cls, config, logger):
        initialPath = os.getcwd()
        results = []
        for test in config:
            logger.debug("Changing working dir to " + test["path"])
            os.chdir(test["path"])
            logger.info("Getting list of Generator jobs")
            jobList = Builder.__getGeneratorJobs(test)
            configOption = ""
            if "config" in test:
                configOption = " -c %s" %test["config"]
            
            for job in jobList:
                cmd = "%s generate.py -s %s %s" %(sys.executable, configOption, job)
                result = Builder.__getGeneratorResultDict(job, test["path"])
                logger.info("Running job: " + cmd)
                (ret,out,err) = util.invokePiped(cmd)
                result["stopDate"] = util.getTimestamp()
                result["command"] = cmd
                result["returncode"] = ret
                result["stdout"] = out
                result["stderr"] = err 
                results.append(result)
                if ret == 0:
                    logger.info("Result: OK")
                else:
                    logger.warn("Result: Error")
                    logger.warn(err)
        os.chdir(initialPath)
        return results

    
    @classmethod
    def __getGeneratorJobs(cls, test):
        if "jobs" in test:
            return test["jobs"]
        elif "config" in test:
            jobList = []
            import re
            cmd = "%s generate.py -c %s x" %(sys.executable, test["config"])
            (ret,out,err) = util.invokePiped(cmd)
            
            reg = re.compile("^  - (.+?)(?:\s|$)")
            strParts = out.split("\n")
            for part in strParts:
                match = reg.search(part)
                if match:
                    if match.group(1):
                        jobList.append(match.group(1))
            
            return jobList

    
    @classmethod
    def __getGeneratorResultDict(cls, job, path):
        result = {
          "job" : job,
          "path" : path,
          "command" : False, 
          "startDate" : util.getTimestamp(),
          "revision" : util.getSvnVersion(path),
          "host" : util.getHostName(),
          "stopDate" : False,
          "returncode" : False,
          "stdout" : False,
          "stderr" : False
        }
        return result
