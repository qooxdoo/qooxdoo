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

import sys, os, time, codecs
sys.path.append( os.path.join('..', '..', 'bin') )

##
# <p>This class holds the test configuration and provides methods that set up 
# and control the actual Selenium test runs. It can be used for tests against
# a local qooxdoo trunk checkout as well as tests against qooxdoo applications 
# located on a remote server.</p>
# 
# @param testType {str} "local" or "remote"
# @param seleniumConf {dict} Selenium RC server configuration details
# @param testConf {dict} Basic test settings
# @param autConf {dict} Information about the applications to be tested
# @param browserConf {dict} Information about the browsers to be used for 
#   testing
# @param mailConf {dict} Report email configuration

class QxTest:
  def __init__(self, testType="remote", seleniumConf=None, testConf=None, 
               autConf=None, browserConf=None, mailConf=None):
    
    defaultSeleniumConf = {
      'seleniumDir'         : '../../selenium',
      'seleniumVersion'     : 'current',
      'seleniumJar'         : 'selenium-server.jar',
      'seleniumHost'        : 'http://localhost:4444',
      'ieSingleWindow'      : True
    }
    
    defaultTestConf = {
      'simulateTest'        : False,
      'getReportFrom'       : 'testLog',
      'testLogDir'          : '../../logs',
      'testReportDir'       : '../../reports',
      #'classPath'           : '../../selenium/current/selenium-java-client-driver.jar:../../rhino/current/js.jar',
      'seleniumClientDriverJar' : '../../selenium/current/selenium-java-client-driver.jar',
      'rhinoJar'            : '../../rhino/current/js.jar',
      'classPathSeparator'  : ';', 
      'proxyEnable'         : 'wscript ../../tool/proxyEnable.vbs',
      'proxyDisable'        : 'wscript ../../tool/proxyDisable.vbs',
      'compatEnable'        : 'wscript ../../tool/compatEnable.vbs',
      'compatDisable'       : 'wscript ../../tool/compatDisable.vbs',
      'killSelenium'        : 'wscript ../../tool/killselenium.vbs'
    }
    
    self.testType = testType
    self.seleniumConf = self.getConfig(defaultSeleniumConf, seleniumConf)
    self.testConf = self.getConfig(defaultTestConf, testConf)
    self.mailConf = mailConf
    self.autConf = autConf
    self.browserConf = browserConf
    self.trunkrev = None
    self.buildStatus = {}

    self.timeFormat = '%Y-%m-%d_%H-%M-%S'
    self.startTimeString = time.strftime(self.timeFormat)

    self.logFile = self.getLogFile(self.testConf["testLogDir"])
    self.logFile.write("################################################################################\n")
    self.log("Starting " + self.testType + " test session.")    

    if (self.testType == "local"):
      self.getLocalRevision()
    else:
      self.getRemoteRevision()
      self.getRemoteBuildStatus()
    
    self.sim = False      
    if ('simulateTest' in self.testConf):
      self.sim = testConf['simulateTest']

    self.os = self.getOperatingSystem()

    import socket
    socket.setdefaulttimeout(10)

  ##
  # Opens a new log file and returns the file object. Attempts to create the log
  # directory if it doesn't already exist. 
  #
  # @param logDirectory {str} The directory to create the log file in
  def getLogFile(self, logDirectory):
    try:
      if not os.path.isdir(logDirectory):
        os.mkdir(logDirectory)
      filename = "testLog_" + self.startTimeString + ".txt"
      fullpath = os.path.join(logDirectory, filename)
      logFile = codecs.open(fullpath, 'a', 'utf-8')
      return logFile 
    except Exception, e:
      errMsg = ""
      if (e.args):
        errMsg = repr(e.args)
      print("ERROR: Unable to open log file, quitting " + errMsg)
      sys.exit(1)

  
  ##
  # Adds options from the default configuration dictionary to the custom
  # configuration dictionary if they're not already defined. 
  #
  # @param default {dict} The default configuration
  # @param custom {dict} The custom configuration 
  def getConfig(self, default, custom):
    for option in default:
      if not option in custom:
        custom[option] = default[option]
    return custom

  ##
  # Writes a message to the test log file
  #
  # @param msg {str} The message to be logged 
  def log(self, msg):
    timeFormatLog = '%Y-%m-%d %H:%M:%S'
    logMsg = time.strftime(timeFormatLog) + " " + msg
    print(logMsg)
    if (self.logFile):      
      self.logFile.write(logMsg + "\n")    


  ##
  # Attempts to determine the name of the operating system by using os.uname(),
  # falling back to platform.system()
  def getOperatingSystem(self):
    oSys = "Unknown"
    msg = "ERROR: Couldn't determine operating system!"

    try:   
      oSys = os.uname()[0]      
    except AttributeError:
      try:
        import platform
        oSys = platform.system()
        self.log("Operating system: " + oSys)
      except:
        self.logError(e, msg)
    except Exception, e:
      self.logError(e, msg)

    return oSys
  
  ##
  # Starts the Selenium RC server and checks its status. If the server doesn't
  # respond correctly after 20 seconds, another attempt is made. If this also 
  # fails the script is ended.
  #
  # @param single {bool} Start the server with the -singleWindow option 
  def startSeleniumServer(self, single=False, version=None):
    seleniumVersion = version or self.seleniumConf["seleniumVersion"]
    
    cmd = "java -jar " + self.seleniumConf["seleniumDir"] + "/" 
    cmd += seleniumVersion + "/"
    cmd += self.seleniumConf["seleniumJar"]

    if (self.sim):
      if single:
        self.log("SIMULATION: Starting Selenium RC server in single window mode.")
      else:
        self.log("SIMULATION: Starting Selenium RC server in default mode.")
      return

    import subprocess, time
    if (self.isSeleniumServer()):
      self.log("Selenium server already running.")
    else:
      self.log("Starting Selenium server...")      
      if 'seleniumLog' in self.seleniumConf:
        cmd += " -browserSideLog -log " + self.seleniumConf['seleniumLog']
      if single:
        cmd += " -singlewindow"
      selserv = subprocess.Popen(cmd, shell=True)
    
      # wait a while for the server to start up
      time.sleep(10)
    
      # check if it's up and running
      if ( not(self.isSeleniumServer()) ):
        self.log("Selenium server not responding, waiting a little longer...")
        time.sleep(30)
        if ( not(self.isSeleniumServer()) ):
          self.log("ERROR: Selenium server not responding.")
          sys.exit(1)

  ##
  # Terminates the Selenium server process using a VBScript (Windows) or the
  # pkill shell command (Linux/OS X)
  def killSeleniumServer(self):
    if (self.sim):
      self.log("SIMULATION: Killing Selenium server process")
      return
    else:
      self.log("Killing Selenium server process")

    if self.os == "Linux":      
      invokeExternal("pkill -f selenium-server")
      return
    if self.os == "Darwin":
      invokeExternal("pkill selenium-server")
    else:
      invokeExternal(self.testConf['killSelenium'])

  ##
  # Sends a shutdown command to the Selenium server
  #
  # @return Whether the server was shut down (Bool)
  def shutdownSeleniumServer(self):
    from urllib2 import Request, urlopen, URLError
    self.log("Shutting down Selenium server")

    req = Request(self.seleniumConf['seleniumHost'] + "/selenium-server/driver/?cmd=shutDownSeleniumServer")
    try:
      response = urlopen(req)
      content = response.read()
      if "OK" in content:
        self.log("Selenium server acknowledged shutdown request.")
        return True
    except URLError, e:
      self.log("Selenium server shutdown failed: " + repr(e))
      if hasattr(e, 'code'):
        self.log("Shutdown request status code: " + repr(e.code))
    except Exception, e:
      self.logError(e, "Shutting down Selenium server")

    return False

  ##
  # Checks the status of the Selenium RC server by sending an HTTP request.
  #
  # @return Whether the server is running (Bool)
  def isSeleniumServer(self):
    from urllib2 import Request, urlopen, URLError
    status = False
    #self.log("Checking Selenium server")
    req = Request(self.seleniumConf['seleniumHost'])
    try:
      response = urlopen(req)
      # Selenium should always refuse this request, so we should never get here
    except URLError, e:
      if hasattr(e, 'code'):
        if (e.code == 403):
          status = True
    except Exception, e:
      self.logError(e, "Checking if Selenium server is active")

    return status

  ##
  # Starts the build process for one or more targets. Logs errors during build 
  # and writes the current trunk revision number and build status to files.
  #
  # @param buildConf {dict} Build configuration 
  def build(self, buildConf):
    defaultBuildConf = {
      'buildLogLevel'       : 'error',
      'buildLogDir'         : '../../logs/build'
    }
    
    buildConf = self.getConfig(defaultBuildConf, buildConf)

    generate = "./generate.py "
    if self.os == "Windows":
      generate = "generate.py "

    for target in buildConf['targets']:
      targetConf = buildConf["targets"][target]
      # Prepare log file
      buildLogFile = self.getBuildLogFile(buildConf["buildLogDir"])
      
      if target[0] == target[0].capitalize():
        targetDir = os.path.join(self.testConf["qxPathAbs"], targetConf["path"])
        os.chdir(targetDir)
      
      buildLogLevel = "error"
      if "buildLogLevel" in targetConf:
        buildLogLevel = targetConf["buildLogLevel"]
      else:
        if "buildLogLevel" in buildConf:
          buildLogLevel = buildConf["buildLogLevel"]
        
        distclean = False
        if "distclean" in targetConf:
          distclean = targetConf["distclean"]
        else: 
          if "distclean" in buildConf:
            distclean = buildConf["distclean"]
          
        if distclean:
          if (self.sim):
            self.log("SIMULATION: Running distclean in directory " + targetDir)
          else:
            self.log("Running distclean in directory " + targetDir)
            if buildLogLevel == "debug":
              invokeLog(generate + "distclean", buildLogFile)
            else:
              invokeExternal(generate + "distclean")
        
        cmd = generate + targetConf["job"]
        
        self.buildStatus[target] = {
          "SVNRevision" : False,
          "BuildError"  : False
        }
        
        if self.sim:
          self.log("SIMULATION: Building " + target + "\n  " + cmd)
        else:
          self.log("Building " + target + "\n  " + cmd)
          if buildLogLevel == "debug":
              invokeLog(cmd, buildLogFile)
          else:
            # Start build, only log errors
            status, std, err = invokePiped(cmd)
            if (status > 0):
              self.logBuildErrors(buildLogFile, cmd, err)
              
              self.buildStatus[target]["BuildError"] = "Unknown build error"
              
              """Get the last line of batbuild.py's STDERR output which contains
              the actual error message. """
              import re
              nre = re.compile('[\n\r](.*)$')
              m = nre.search(err)
              if m:
                self.buildStatus[target]["BuildError"] = m.group(1)
            else:
              self.log(target + " build finished without errors.")
              
          self.buildStatus[target]["SVNRevision"] = self.getLocalRevision()
      
      buildLogFile.close()

    self.trunkrev = self.getLocalRevision()
    self.storeRevision()
    self.storeBuildStatus()


  ##
  # Opens a new build log file and returns the file object. Attempts to create 
  # the log directory if it doesn't already exist. 
  #
  # @param buildLogDir {str} The directory to create the log file in
  def getBuildLogFile(self, buildLogDir):
    try:
      if not os.path.isdir(buildLogDir):
        os.mkdir(buildLogDir)
    except Exception, e:
      self.logError(e, "Creating build log directory")
      return False
    
    buildLog = os.path.join(buildLogDir, target + '_' + self.startTimeString + '.log')
    self.log("Opening build log file " + buildLog)
    try:      
      buildLogFile = codecs.open(buildLog, 'a', 'utf-8')
    except Exception, e:
      self.logError(e, "Opening build log file")
    
    return buildLogFile


  ##
  # Writes build Errors to the log file
  def logBuildErrors(self, buildLogFile, cmd, err):
    self.log("Error while building " + target + ", see " 
          + buildLog + " for details.")
    err = err.rstrip('\n')
    err = err.rstrip('\r')
    buildLogFile.write(target + "\n" + cmd + "\n" + err)
    buildLogFile.write("\n========================================================\n\n")
  
  
  ##
  # Starts the SVN udpdate/build process for one or more targets. Logs errors
  # during build and writes the current trunk revision number and build status
  # to files.
  #
  # @param buildConf {dict} Build configuration 
  def buildAll(self, buildConf):
    defaultBuildConf = {
      'buildLogLevel'       : 'error',
      'buildLogDir'         : '../../logs/build',
      'batbuild'            : 'tool/admin/app/batserver/batbuild.py'
    }
    
    buildConf = self.getConfig(defaultBuildConf, buildConf)
    
    for target in buildConf['targets']:
      # Prepare log file
      if ('buildLogDir' in buildConf):
        if not os.path.isdir(buildConf['buildLogDir']):
          os.mkdir(buildConf['buildLogDir'])
        buildLog = os.path.join(buildConf['buildLogDir'], target + '_' + self.startTimeString + '.log')
        self.log("Opening build log file " + buildLog)      
        buildLogFile = codecs.open(buildLog, 'w', 'utf-8')      
      
      # Assemble batbuild command line
      if (os.path.isabs(buildConf['batbuild'])):
        cmd = buildConf['batbuild']
      else:
        cmd = os.path.join(self.testConf['qxPathAbs'], buildConf['batbuild']) 
      cmd += " -w " + buildConf['stageDir']
      if target[0] == target[0].capitalize():
        cmd += " " + buildConf['targets'][target]
        self.log("Building " + target + "\n  " + cmd)
        self.buildStatus[target] = {
          "SVNRevision" : False,
          "BuildError"  : False
        }
        if (self.sim):
          status = 0
          self.log("SIMULATION: Invoking build command:\n  " + cmd)
        else:
          if (buildConf['buildLogLevel'] == "debug" and 'buildLogDir' in buildConf):
            # Start build with full logging
            invokeLog(cmd, buildLogFile)
          else:
            # Start build, only log errors
            status, std, err = invokePiped(cmd)
            if (status > 0):
              self.logBuildErrors(buildLogFile, cmd, err)
              
              self.buildStatus[target]["BuildError"] = "Unknown build error"
              
              """Get the last line of batbuild.py's STDERR output which contains
              the actual error message. """
              import re
              nre = re.compile('[\n\r](.*)$')
              m = nre.search(err)
              if m:
                self.buildStatus[target]["BuildError"] = m.group(1)
            else:
              self.log(target + " build finished without errors.")
              
          self.buildStatus[target]["SVNRevision"] = self.getLocalRevision()
      
      if ('buildLogDir' in buildConf):        
        buildLogFile.close()

    self.trunkrev = self.getLocalRevision()
    self.storeRevision()
    self.storeBuildStatus()

  ##
  # Runs an SVN update on a Simulator contribution checkout
  def updateSimulator(self):
    if (self.sim):
      self.log("SIMULATION: Updating Simulator checkout: "
                + self.testConf["simulatorSvn"])
    else:
      self.log("Updating Simulator checkout.")
      ret,out,err = invokePiped("svn up " + self.testConf["simulatorSvn"])
      if (out):
        self.log(out)
      if (err):
        self.log(err)

  ##
  # Converts the buildStatus map to JSON and stores it in a file in the root 
  # directory of the local qooxdoo checkout where remote test runs can access 
  # it.
  def storeBuildStatus(self):
    import simplejson  
    json = simplejson.dumps(self.buildStatus, sort_keys=True, indent=2)
    fPath = os.path.join(self.testConf['qxPathAbs'],'buildStatus.json')
    if (self.sim):
      self.log("SIMULATION: Storing build status in file " + fPath)
    else:  
      self.log("Storing build status in file " + fPath)
      rFile = codecs.open(fPath, 'w', 'utf-8')
      rFile.write(json)
      rFile.close()

      
  ##
  # Reads the build status from a file on a remote test host
  #
  # @return Build status dictionary
  def getRemoteBuildStatus(self):
    import urllib
    status = {}
    try:
      import simplejson
    except ImportError, e:      
      self.log("ERROR: simplejson module not found, unable to retrieve remote build status!")
      return status
    remoteFile = self.autConf['autHost']
    if 'autQxPath' in self.autConf:
      remoteFile += self.autConf['autQxPath']
    remoteFile += '/buildStatus.json'
    self.log("Retrieving remote build status from file " + remoteFile)
    try:
      json = urllib.urlopen(remoteFile)
    except IOError, e:
      self.log("ERROR: Unable to open remote build status file " + remoteFile + ": "
               + e.message)
      return status
    except Exception, e:
      self.logError(e, "Opening remote build file")
      return status
    
    # Try to determine the requests's HTTP status (Python >= 2.6 only).
    try:
      reqStat = json.getcode()
      if (reqStat != 200):
        self.log("ERROR: Request to remote build status file returned status " + repr(reqStat))
    except AttributeError:
      pass
    
    try:
      status = simplejson.load(json)
      self.buildStatus = status
      self.log("Remote build status retrieved successfully.")
    except ValueError, e:    
      self.log("ERROR: Unable to parse buildStatus JSON: " + repr(e))
    except Exception, e:
      self.logError(e, "Parsing remote build file")
      
    return status


  ##
  # Retrieves a local qooxdoo SVN checkout's revision number
  #
  # @return The revision number (String)
  def getLocalRevision(self):
    ret,out,err = invokePiped("svnversion " + self.testConf["qxPathAbs"])
    rev = out.rstrip('\n')
    self.trunkrev = rev
    self.log("Local qooxdoo checkout at revision " + self.trunkrev)
    return rev
  

  ##
  # Writes the current revision number of the local qooxdoo checkout to a file
  # named 'revision.txt' in the qooxdoo checkout's root directory.
  def storeRevision(self):
    fPath = os.path.join(self.testConf['qxPathAbs'],'revision.txt')
    if (self.sim):
      self.log("SIMULATION: Storing revision number " + self.trunkrev 
               + " in file " + fPath)
    else:  
      self.log("Storing revision number " + self.trunkrev + " in file " + fPath)
      rFile = codecs.open(fPath, 'w', 'utf-8')
      rFile.write(self.trunkrev)
      rFile.close()


  ##
  # Reads the qooxdoo checkout's revision number from a file on a remote test 
  # host
  #
  # @return The revision number (String)
  def getRemoteRevision(self):
    import urllib, re
    remoteFile = self.autConf['autHost']
    if 'autQxPath' in self.autConf:
      remoteFile += self.autConf['autQxPath']
      remoteFile += '/revision.txt'
      try:
        rev = urllib.urlopen(remoteFile).read()
      except IOError, e:
        self.log("ERROR: Unable to open remote revision file " + remoteFile + ": "
                 + e.message)
        return False
      except Exception, e:
        self.logError(e, "Opening remote revision file")
        return False

      reg = re.compile("\D+")
      found = reg.search(rev)
      if found:
        self.log("ERROR: Unexpected character(s) in remote revision file")
      else:
        self.trunkrev = rev
        self.log("Remote qooxdoo checkout at revision " + self.trunkrev)
        return rev


  ##
  # Generates a fake test log file so that a report email can be generated even
  # if the test didn't run due to build errors.
  #
  # @param appConf {dict} Settings for the application(s) to be tested
  # @return {file} The file handle of the dummy log 
  def getDummyLog(self, appConf):
    import random

    dummyLogFile = os.path.join(self.testConf['testLogDir'], appConf['appName'], "DUMMY_" + appConf['appName'] + self.startTimeString + ".log")        
    dummyLog = codecs.open(dummyLogFile, "w", "utf-8")

    for browser in appConf['browsers']:
      prefix = "qxSimulator_" + str(random.randint(100000, 999999)) + ": "
      dummyLog.write(prefix + "<h1>" + appConf['appName'] + " results from " + self.startTimeString + "</h1>\n")
      platform = self.os
      if platform == "Windows":
        platform = "Win32"
      dummyLog.write(prefix + "<p>Platform: " + platform + "</p>\n")
      dummyLog.write(prefix + "<p>User agent: " + browser['browserId'] + "</p>\n")
      dummyLog.write(prefix + "<div class=\"qxappender\"><div class=\"level-error\">BUILD ERROR: " + self.buildStatus[appConf['appName']]["BuildError"] + "</div></div>\n")
    dummyLog.close()

    return dummyLogFile


  ##
  # Launches the actual tests (Simulations) for defined applications
  #
  # @param appConf {dict} Settings for the application(s) to be tested
  def runTests(self, appConf):
    import time

    getReportFrom = self.testConf['getReportFrom']
    
    if getReportFrom == 'testLog':
      logPath = os.path.join(self.testConf['testLogDir'], appConf['appName'])
      if not os.path.isdir(logPath):
        os.mkdir(logPath)
      tf = '%Y-%m-%d_%H-%M-%S'
      testStartDate = time.strftime(self.timeFormat)
      logFile = os.path.join(logPath, testStartDate + ".log")
    
    reportPath = os.path.join(self.testConf['testReportDir'], appConf['appName'])
    if not os.path.isdir(reportPath):
        os.mkdir(reportPath)
    reportFile = os.path.join( reportPath, testStartDate + '.html')

    if appConf['appName'] in self.buildStatus:
      if self.buildStatus[appConf['appName']]["BuildError"]:
        self.log("ERROR: Skipping " + appConf['appName'] + " test because there "
                 + "was an error during build:\n  " + self.buildStatus[appConf['appName']]["BuildError"])

        sendReport = True
        if 'sendReport' in appConf:
          sendReport = appConf['sendReport']
        
        if sendReport:
          dummyLogFile = self.getDummyLog(appConf)
          logFormatted = self.formatLog(dummyLogFile, reportFile)
          if logFormatted:
            self.sendReport(appConf['appName'], reportFile)
          else:
            self.log("No report HTML to send.")        

        return    
    
    clearLogs = True
    if 'clearLogs' in appConf:
      clearLogs = appConf['clearLogs']
    
    if clearLogs:
      self.clearLogs()
      
    seleniumVersion = self.seleniumConf["seleniumVersion"]
    if 'seleniumVersion' in appConf:
      seleniumVersion = appConf["seleniumVersion"]
    
    individual = True
    if 'individualServer' in appConf:
      individual = appConf['individualServer']      
    
    if not individual:
      self.log("individualServer set to False, using one server instance for "
               + "all tests")
      self.startSeleniumServer(False, seleniumVersion)

    for browser in appConf['browsers']:
      # Use single window mode? (Necessary for IE with Selenium 1.*)
      single = False
      if "iexplore" in self.browserConf[browser['browserId']] and self.seleniumConf['ieSingleWindow']:
        single = True
      
      seleniumVersion = self.seleniumConf["seleniumVersion"]
      if 'seleniumVersion' in appConf:
        seleniumVersion = appConf["seleniumVersion"]
      
      if "seleniumVersion" in browser:
        seleniumVersion = browser["seleniumVersion"]
      
      killBrowser = True 
      if "kill" in browser:
        killBrowser = browser['kill'] 
      
      if individual:
        self.log("individualServer set to True, using one server instance per "
                 + "test run")
        self.startSeleniumServer(single, seleniumVersion)
      
      options = False
      if "options" in browser:
        options = browser["options"]
      else:
        if "options" in appConf:
          options = appConf["options"]
          
      simulationScript = False
      if "simulationScript" in browser:
        simulationScript = browser["simulationScript"]
      else:
        if "simulationScript" in appConf:
          simulationScript = appConf["simulationScript"]

      cmd = self.getStartCmd(appConf['appName'], browser['browserId'], options, simulationScript)
      if getReportFrom == 'testLog':
        cmd += " logFile=" + logFile
      
      try:
        if (browser['setProxy']):
          self.setProxy(True)
      except KeyError:
          pass

      try:
        if (browser['setIE8Compatibility']):
          self.setIE8Compatibility(True)
      except KeyError:
        pass
      
      if (self.sim):
        self.log("SIMULATION: Starting test:\n  " + cmd)
      else:
        self.log("Testing: " + appConf['appName'] + " on " 
                 + browser['browserId'] + "\n  " + cmd)
        invokeExternal(cmd)
      
      try:
        if (browser['setProxy']):
          self.setProxy(False)
      except KeyError:
          pass

      try:
        if (browser['setIE8Compatibility']):
          self.setIE8Compatibility(False)
      except KeyError:
          pass

      try:
        if (killBrowser):
          self.killBrowser(browser['browserId'])
      except KeyError:
          pass
      
      if individual:
        self.shutdownSeleniumServer()
        time.sleep(5)
        if self.isSeleniumServer(): 
          self.killSeleniumServer()
            

    if not individual:
      self.shutdownSeleniumServer()
      time.sleep(5)
      if self.isSeleniumServer(): 
        self.killSeleniumServer()

    sendReport = True
    if 'sendReport' in appConf:
      sendReport = appConf['sendReport']
    
    if sendReport:
      if (self.sim):
        self.log("SIMULATION: Formatting log and sending report.\n")
      else:
        if getReportFrom == 'testLog':
          self.formatLog(logFile, reportFile)
        else:
          self.formatLog(None, reportFile)

        self.sendReport(appConf['appName'], reportFile)


  ##
  # Assembles the shell command used to launch the Simulation
  #
  # @param aut {str} The name of the application to be tested. Must correspond 
  #   to the name of a subdirectory of "/trunk/tool/selenium/simulation/" in the 
  #   local Simulator contrib checkout
  # @param browser {str} A browser identifier (one of the keys in browserConf)
  # @param options {arr} An array of options to be passed to the test script,
  # e.g. ["ignore=qx.test.ui","foo=bar"]
  # @param scriptPath {str} Optional: Path to the Simulation script to be used.
  # By default, the script found in the Simulator contrib checkout under 
  # /trunk/tool/selenium/simulation/[APPNAME]/test_[APPNAME].js is used
  # @return {str} The shell command
  def getStartCmd(self, aut, browser, options, simulationScript=None):
    cmd = "java"

    if ('seleniumClientDriverJar' in self.testConf or 'rhinoJar' in self.testConf):
      cmd += " -cp "
      if ('seleniumClientDriverJar' in self.testConf):
        cmd += self.testConf['seleniumClientDriverJar']
      if ('seleniumClientDriverJar' in self.testConf and 'rhinoJar' in self.testConf):
        if ('classPathSeparator' in self.testConf):
          cmd += self.testConf['classPathSeparator']
        else:
          cmd += ";"  
      if ('rhinoJar' in self.testConf):
        cmd += self.testConf['rhinoJar']

    cmd += " org.mozilla.javascript.tools.shell.Main"
    
    script = ""
    if simulationScript:
      script = simulationScript
    else:
      script = self.testConf['simulatorSvn'] + "/trunk/tool/selenium/simulation/" + aut.lower() + "/test_" + aut.lower() + ".js"
        
    cmd += " " + script
    
    cmd += " autHost=" + self.autConf['autHost']
    cmd += " autPath="

    if 'autQxPath' in self.autConf:
      cmd += self.autConf['autQxPath']

    cmd += self.autConf['autPath' + aut]
    cmd += " simulatorSvn=" + self.testConf['simulatorSvn']

    if (self.os == "Windows"):
      cmd += " testBrowser=" + self.browserConf[browser]
    else:
      cmd += " testBrowser='" + self.browserConf[browser] + "'"

    cmd += " browserId='" + browser + "'"

    if options:
      for opt in options:
        cmd += ' "' + opt + '"'

    return cmd


  ##
  # Sends the generated test report file by email.
  #
  # @param aut {str} The name of the tested application
  def sendReport(self, aut, reportfile):    
    import re
    
    self.log("Preparing to send " + aut + " report: " + reportfile)
    if ( not(os.path.exists(reportfile)) ):
      self.log("ERROR: Report file not found, quitting.")
      sys.exit(1)
  
    self.mailConf['subject'] = "[qooxdoo-test] " + aut
  
    reportFile = open(reportfile, 'rb')
    self.mailConf['html'] = reportFile.read()
    reportFile.seek(0)    
  
    osRe = re.compile('<p>Platform: (.*)</p>')
    failedTestsRe = re.compile('<p class="failedtests">([\d]*)')
    totalErrorsRe = re.compile('<p class="totalerrors">Total errors in report: ([\d]*)</p>')
  
    osystem = ""
    failed = ""
    totalE = ""
    for line in reportFile:
      osys = osRe.search(line)
      if (osys):
        osystem = osys.group(1)
        # Some browsers return "Linux i686" as the platform 
        if "Linux" in osystem:
          osystem = "Linux"
        else:
          if "Win" in osystem:
            osystem = "Win32"
  
      failedTests = failedTestsRe.search(line)
      if (failedTests):
        failed = failedTests.group(1)
  
      totalErrors = totalErrorsRe.search(line)
      if (totalErrors):
        totalE = totalErrors.group(1)
  
    self.mailConf['subject'] += " " + osystem
    
    if ('hostId' in self.mailConf):
      self.mailConf['subject'] += " " + self.mailConf['hostId']
    if (self.trunkrev):
      self.mailConf['subject'] += " (trunk r" + self.trunkrev + ")"
    if (aut in self.buildStatus):
      if (self.buildStatus[aut]["BuildError"]):
        self.mailConf['subject'] += " BUILD ERROR"
    if (failed != ""):
      self.mailConf['subject'] += ": " + failed + " test run(s) failed!"
    else:
      self.mailConf['subject'] += ": " + totalE + " issues"    

    # Send mail
    if (self.sim):
      self.log("SIMULATION; Prepared report email:\n" 
               + "  Subject: " + self.mailConf['subject'] + "\n"
               + "  Recipient: " + self.mailConf['mailTo'])    
    if (osystem !=""):
      try:
        sendMultipartMail(self.mailConf)
      except Exception, e:    
        self.logError(e, "Sending report email")
      else:
        self.log("Report email sent successfully")

    else:
      self.log("ERROR: Report file seems incomplete, report not sent.")


  ##
  # Runs logFormatter on a file containg "qxSimulator" entries. Uses the 
  # Selenium RC server's log file as a fallback if the specified file doesn't 
  # exist or is empty.
  #  
  # @param inputfile {str} Path to the log file to be formatted. 
  def formatLog(self, inputfile=None, reportfile=None):
    from logFormatter import QxLogFormat

    class FormatterOpts:
      def __init__(self,logfile,htmlfile):
        self.logfile = logfile
        self.htmlfile = htmlfile

    if not inputfile:
      if 'seleniumLog' in self.seleniumConf:
        inputfile = self.seleniumConf['seleniumLog']

    if inputfile:
      try:
        if os.path.isfile(inputfile):
          if os.path.getsize(inputfile) != "0L":            
            log = inputfile
      except:        
        pass    

    if not inputfile:
      self.log("ERROR: No log file to work with")
      return False

    options = FormatterOpts(inputfile, reportfile)

    if (self.sim):
      self.log("SIMULATION: Formatting log file " + inputfile)
    else:
      self.log("Formatting log file " + inputfile)  
      logformat = QxLogFormat(options)

    return True


  ##
  # Clears the Selenium RC server log file.
  def clearLogs(self):
    if ('seleniumLog' in self.seleniumConf and os.path.exists(self.seleniumConf['seleniumLog'])):
      f = open(self.seleniumConf['seleniumLog'], 'w')
      if (self.sim):
        self.log("SIMULATION: Emptying server log file " + self.seleniumConf['seleniumLog'])
      else:  
        self.log("Emptying server log file " + self.seleniumConf['seleniumLog'])
        f.write('')
      f.close()

  
  ##
  # Kills a browser process to make sure subsequent tests can launch the same 
  # browser. This is somewhat unreliable as it tries to determine the process
  # name from the command used to tell Selenium which browser to use.
  #
  # @param browser {str} A browser identifier (one of the keys in browserConf) 
  def killBrowser(self, browser):    
    browserFull = self.browserConf[browser].lower()
    procName = None

    if "opera" in browserFull:
      procName = "opera"

    if "safari" in browserFull:
      procName = "safari"

    if "chrome" in browserFull:
      procName = "chrome"

    if "arora" in browserFull:
      procName = "arora"

    if "iexplore" in browserFull:
      procName = "iexplore"

    if "firefox" in browserFull:
      procName = "firefox"

    time.sleep(3)
    
    if procName:
      if self.os == "Linux" or self.os == "Darwin":
        if (self.sim):
          self.log("SIMULATION: Killing Linux browser process: " + procName)
        else:  
          self.log("Killing Linux browser process: " + procName)      
          invokeExternal("pkill " + procName)
      else:
        script = "kill" + procName + ".vbs"
        if (os.path.isfile(script)):
          if (self.sim):
            self.log("SIMULATION: Killing Windows browser process: " + procName)
          else:  
            self.log("Killing Windows browser process: " + procName)
            invokeExternal("wscript " + script)
    
    else:
      self.log("ERROR: Unable to determine browser process name")    


  ##
  # Executes a shell command that should (de)activate the proxy setting in the 
  # Windows registry for browsers started with the *custom launcher (Safari, 
  # Chrome, etc.)
  #
  # @param prox {bool} Enable (True) or disable (False) the proxy setting 
  def setProxy(self, prox):        
    if (prox):
      if (self.os == "Windows"):
        if (self.sim):
          self.log("SIMULATION: Activating proxy setting in Windows registry: "
                   + self.testConf['proxyEnable'])
        else:
          self.log("Activating proxy setting in Windows registry")
          invokeExternal(self.testConf['proxyEnable'])
      else:
        self.log("ERROR: Can't enable proxy on non-Windows system!")
    else:
      if (self.os == "Windows"):
        if (self.sim):
          self.log("SIMULATION: Deactivating proxy setting in Windows registry: " 
                + self.testConf['proxyDisable'])
        else:  
          self.log("Deactivating proxy setting in Windows registry")
          invokeExternal(self.testConf['proxyDisable'])
      else:
        self.log("Error: Can't disable proxy on non-Windows system!")


  ##
  # Executes a shell command that should (de)activate the IE8 compatibility 
  # setting in the Windows registry
  #
  # @param compat {bool} Enable (True) or disable (False) the compatibility
  #   setting  
  def setIE8Compatibility(self, compat):
    if (compat):
      if (self.os == "Windows"):
        if (self.sim):
          self.log("SIMULATION: Activating IE8 compatibility mode in Windows registry: "
                   + self.testConf['compatEnable'])
        else:
          self.log("Activating IE8 compatibility mode in Windows registry")
          invokeExternal(self.testConf['compatEnable'])
      else:
        self.log("ERROR: Can't enable IE8 compatibility mode on non-Windows system!")
    else:
      if (self.os == "Windows"):
        if (self.sim):
          self.log("SIMULATION: Deactivating IE8 compatibility mode in Windows registry: " 
                + self.testConf['compatDisable'])
        else:  
          self.log("Deactivating IE8 compatibility mode in Windows registry")
          invokeExternal(self.testConf['compatDisable'])
      else:
        self.log("Error: Can't disable IE8 compatibility mode on non-Windows system!")
      
  
  ##
  # Invokes lintRunner on one ore more targets
  #
  # @param lintConf {dict} Lint run configuration
  def runLint(self,lintConf):
    from lintRunner import QxLint

    class LintOpts:
      def __init__(self,workdir,mailto):
        self.workdir = workdir
        self.mailto = mailto
        self.outputfile = None
    
    for key in lintConf:
      for target in lintConf[key]:

        options = LintOpts(None,self.mailConf['mailTo'])

        if (key != "other"):
          options.workdir = os.path.join(self.testConf['qxPathAbs'], key, target['directory'])
        else:
           options.workdir = os.path.join(self.testConf['qxPathAbs'], target['directory'])
        
        if ('ignoreClasses' in target):
          options.ignoreClasses = target['ignoreClasses']

        if ('ignoreErrors' in target):
          options.ignoreErrors = target['ignoreErrors']

        if (self.sim):
          self.log("SIMULATION: Starting Lint runner:\n  " + options.workdir)
        else:
          self.log("Running Lint for " + options.workdir)  
          qxlint = QxLint(options)


  def logError(self, e, desc=""):
    msg ="ERROR: " + desc
    if not desc == "":
      msg += " "    
    if type(e).__name__ == "str":
      self.log(msg + e)

    if e.__class__:      
      msg += e.__class__.__name__
      if (e.args):
        msg += " " + repr(e.args)        
        
    self.log(msg)
    


##
# Invokes a shell command, waits for it to finish, then returns its STDOUT and 
# STDERR output.
#
# @param cmd {str} The command to be executed
# @return {tuple} The command's return code, STDOUT output and STDERR output
def invokePiped(cmd):
  import subprocess
  p = subprocess.Popen(cmd, shell=True,
                       stdout=subprocess.PIPE,
                       stderr=subprocess.PIPE,
                       universal_newlines=True)
  output, errout = p.communicate()
  rcode = p.returncode

  return (rcode, output, errout)


##
# Invokes a shell command and waits for it to finish.
#
# @param cmd {str} The command to be executed
# @return {int} The exit code of the process
def invokeExternal(cmd):
  import subprocess
  p = subprocess.Popen(cmd, shell=True,
                       stdout=sys.stdout,
                       stderr=sys.stderr)
  return p.wait()


##
# Invokes a shell command and get its STDOUT/STDERR output while the process is 
# running. Optionally writes the output to a file.
#
# @param cmd {str} The command to be executed
def invokeLog(cmd, file=None):
  import subprocess
  p = subprocess.Popen(cmd, shell=True,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.STDOUT,
                         universal_newlines=True)

  while True:
    line = p.stdout.readline()
    if (not line): 
      break
    print(line.rstrip("\n"))
    if file:
      file.write(line)


##
# Sends a multipart text/html e-mail
#
# @param configuration {dict} Mail settings 
def sendMultipartMail(configuration):
  import smtplib
  from email.MIMEMultipart import MIMEMultipart
  from email.MIMEText import MIMEText
  
  msg = MIMEMultipart()
  msg['Subject'] = configuration['subject']
  msg['From'] = configuration['mailFrom']
  msg['To'] = configuration['mailTo']
  msg.preamble = 'Test Results'

  msgText = MIMEText(configuration['html'], 'html')
  msg.attach(msgText)
  
  print("Sending report. Subject: " + configuration['subject'] + " Recipient: " 
        + configuration['mailTo'])
  
  mailServer = smtplib.SMTP(configuration['smtpHost'], configuration['smtpPort'])  
  mailServer.ehlo()
  mailServer.starttls()
  mailServer.ehlo()
  mailServer.sendmail(configuration['mailFrom'], configuration['mailTo'], msg.as_string())
  mailServer.close()

