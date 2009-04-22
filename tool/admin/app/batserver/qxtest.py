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

import sys, os, time
sys.path.append( os.path.join('..', '..', 'bin') )

class QxTest:
  def __init__(self, testType="remote", seleniumConf=None, testConf=None, autConf=None, browserConf=None, mailConf=None):
    self.testType = testType
    self.seleniumConf = seleniumConf
    self.testConf = testConf
    self.autConf = autConf
    self.browserConf = browserConf
    self.mailConf = mailConf
    self.trunkrev = None

    self.timeFormat = '%Y-%m-%d %H:%M:%S'
    self.logFile = False

    if ('testLogDir' in self.testConf):
      tf = '%Y-%m-%d'
      filename = "testLog_" + time.strftime(tf) + ".txt"
      fullpath = os.path.join(self.testConf['testLogDir'], filename)
      self.logFile = open(fullpath, 'a')
      self.logFile.write("################################################################################\n")
      self.log("Starting " + self.testType + " test session.")    

    if (self.testType == "local"):
      self.getLocalRevision()
    else:
      self.getRemoteRevision()
    
    self.sim = False      
    if ('simulateTest' in self.testConf):
      self.sim = testConf['simulateTest']

    self.os = None
    try:   
      self.os = os.uname()[0]
    except AttributeError:
      try:
        import platform
        self.os = platform.system()
        self.log("Operating system: " + self.os)
      except:
        self.os = "Unknown"
        self.log("ERROR: Couldn't determine operating system!")
        sys.exit(1)

    import socket
    socket.setdefaulttimeout(10)


  def log(self, msg):
    logMsg = time.strftime(self.timeFormat) + " " + msg + "\n"
    print(logMsg)
    if (self.logFile):      
      self.logFile.write(logMsg)    

  
  # Start the Selenium RC server and check its status.
  def startSeleniumServer(self):
    import subprocess, time
    if (self.isSeleniumServer()):
      self.log("Selenium server already running.")
    else:
      self.log("Starting Selenium server...")
      selserv = subprocess.Popen(self.seleniumConf['startSelenium'] 
                                 + self.seleniumConf['seleniumLog'], shell=True)
    
      # wait a while for the server to start up
      time.sleep(20)
    
      # check if it's up and running
      if ( not(self.isSeleniumServer()) ):
        self.log("Selenium server not responding, waiting a little longer...")
        time.sleep(20)
        if ( not(isSeleniumServer()) ):
          self.log("ERROR: Selenium server not responding.")
          sys.exit(1)


  # Send an HTTP request to the Selenium proxy. A 403 response means it's running.
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
    return status


  # Builds all targets listed in buildConf.
  def buildAll(self, buildConf):
    buildLogFile = open(buildConf['buildErrorLog'], 'w')
    buildLogFile.write('')
    buildLogFile.close()
    
    buildLogFile = open(buildConf['buildErrorLog'], 'a')
    for target in buildConf:
      cmd = self.testConf['qxPathAbs'] + buildConf['batbuild'] 
      cmd += " -w " + self.testConf['qxPathAbs']
      if (target != "batbuild" and target != "buildErrorLog"):
        self.log("Building " + target)      
        cmd += " " + buildConf[target]

        if (self.sim):
          status = 0
          self.log("SIMULATION: Invoking build command:\n" + cmd)
        else:
          status, std, err = invokePiped(cmd)

        if (status > 0):
          self.log("Error while building " + target + ", see " 
                + buildConf['buildErrorLog'] + " for details.")        
          buildLogFile.write(target + "\n" + err)
          buildLogFile.write("\n========================================================\n\n")
        else:
          self.log(target + " build finished without errors.")
    buildLogFile.close()    
    self.trunkrev = self.getLocalRevision()
    self.storeRevision()


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


  # Returns the SVN checkout's revision number
  def getLocalRevision(self):
    ret,out,err = invokePiped("svnversion " + self.testConf["qxPathAbs"])
    rev = out.rstrip('\n')
    self.trunkrev = rev
    self.log("Local qooxdoo checkout at revision " + self.trunkrev)
    return rev    
  

  # Writes the revision number of a local qooxdoo checkout to a file
  def storeRevision(self):
    fPath = os.path.join(self.testConf['qxPathAbs'],'revision.txt')
    if (self.sim):
      self.log("SIMULATION: Storing revision number " + self.trunkrev 
               + " in file " + fPath)
    else:  
      self.log("Storing revision number " + self.trunkrev + " in file " + fPath)
      rFile = open(fPath, 'w')
      rFile.write(self.trunkrev)
      rFile.close()  


  # Reads the qooxdoo checkout's revision number from a file on the test host
  def getRemoteRevision(self):
    import urllib
    rev = urllib.urlopen(self.autConf['autHost'] + '/revision.txt').read()
    self.trunkrev = rev
    self.log("Remote qooxdoo checkout at revision " + self.trunkrev)
    return rev


  # Run tests for defined applications
  def runTests(self, appConf):
      
    if appConf['clearLogs']:
      self.clearLogs()

    for browser in appConf['browsers']:      
      cmd = self.getStartCmd(appConf['appName'], browser['browserId'])
      
      try:
        if (browser['setProxy']):
          self.setProxy(True)
      except KeyError:
          pass
      
      if (self.sim):
        self.log("SIMULATION: Starting test:\n" + cmd)
      else:
        self.log("Testing: " + appConf['appName'] + " on " + browser['browserId'])
        invokeExternal(cmd)
      
      try:
        if (browser['setProxy']):
          self.setProxy(False)
      except KeyError:
          pass

      try:
        if (browser['kill']):
          self.killBrowser(browser['browserId'])
      except KeyError:
          pass  

    if (appConf['sendReport']):
      self.formatLog()
      self.sendReport(appConf['appName'])


  # Assembles the shell command that launches the actual test in Rhino.
  def getStartCmd(self, aut, browser):
    cmd = "java"
    if ('classPath' in self.testConf):
        cmd += " -cp " + self.testConf['classPath']
    cmd += " org.mozilla.javascript.tools.shell.Main"    
    cmd += " " + self.testConf['simulatorSvn'] + "/trunk/tool/selenium/simulation/" + aut.lower() + "/test_" + aut.lower() + ".js"
    cmd += " autHost=" + self.autConf['autHost']
    cmd += " autPath=" + self.autConf['autPath' + aut]
    if (self.os == "Windows"):
      cmd += " testBrowser=" + self.browserConf[browser]
    else:
      cmd += " testBrowser='" + self.browserConf[browser] + "'"
    return cmd


  # Sends the generated test report file by email.
  def sendReport(self, aut):    
    import re
    
    self.log("Preparing to send " + aut + " report: " + self.mailConf['reportFile'])
    if ( not(os.path.exists(self.mailConf['reportFile'])) ):
      self.log("ERROR: Report file not found, quitting.")
      sys.exit(1)
  
    self.mailConf['subject'] = "[qooxdoo-test] " + aut
  
    reportFile = open(self.mailConf['reportFile'], 'rb')
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
      self.mailConf['subject'] += " (trunk r" + self.trunkrev + "): "
    else:
      self.mailConf['subject'] += ": "
    if (failed != ""):
      self.mailConf['subject'] += failed + " test runs failed!"
    else:
      self.mailConf['subject'] += totalE + " issues"    

    # Send mail
    if (self.sim):
      self.log("SIMULATION; Prepared report email:\n" 
               + "  Subject: " + self.mailConf['subject'] + "\n"
               + "  Recipient: " + self.mailConf['mailTo'])    
    if (osystem !=""):
      sendMultipartMail(self.mailConf)

    else:
      self.log("ERROR: Report file seems incomplete, report not sent.")

    # Rename report file, adding current date.
    """from datetime import datetime
    now = datetime.today()
    datestring = now.strftime("%Y-%m-%d_%H.%M")
    newname_temp = "selenium-report_" + datestring + ".html"
    newname = os.path.join(os.path.dirname(self.mailConf['reportFile']),newname_temp)
    self.log("Renaming report file to " + newname)
    os.rename(self.mailConf['reportFile'], newname)
    self.log("Moving report file to " + self.mailConf['archiveDir'])    
    shutil.move(newname, self.mailConf['archiveDir'])"""


  # Run logFormatter on Selenium log file 
  def formatLog(self):
    from logFormatter import QxLogFormat
    
    class FormatterOpts:
      def __init__(self,logfile,htmlfile):
       self.logfile = logfile
       self.htmlfile = htmlfile
       
    options = FormatterOpts(self.seleniumConf['seleniumLog'], self.seleniumConf['seleniumReport'])
    
    if (self.sim):
      self.log("SIMULATION: Formatting log file " + self.seleniumConf['seleniumLog'])
    else:
      self.log("Formatting log file " + self.seleniumConf['seleniumLog'])  
      logformat = QxLogFormat(options)


  # Clear Selenium log file and report HTML file
  def clearLogs(self):
    if (os.path.exists(self.seleniumConf['seleniumLog'])):
      f = open(self.seleniumConf['seleniumLog'], 'w')
      if (self.sim):
        self.log("SIMULATION: Emptying server log file " + self.seleniumConf['seleniumLog'])
      else:  
        self.log("Emptying server log file " + self.seleniumConf['seleniumLog'])
        f.write('')
      f.close()

    if (os.path.exists(self.seleniumConf['seleniumReport'])):
      f = open(self.seleniumConf['seleniumReport'], 'w')
      if (self.sim):
        self.log("SIMULATION: Emptying Selenium report file " + self.seleniumConf['seleniumReport'])
      else:
        self.log("Emptying Selenium report file " + self.seleniumConf['seleniumReport'])
        f.write('')
      f.close()


# Kill a browser process to make sure subsequent tests can launch the same browser
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

    if ("iexplore" in browserFull or "ie" in browserFull):
      procName = "iexplore"

    if ("firefox" in browserFull or "ff" in browserFull):
      procName = "firefox"
    
    if procName:
      if self.os == "Linux":
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


  # Activate the proxy setting for browsers started with the *custom launcher
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

  # Run Ecmalint on targets defined in lintConf
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
          self.log("SIMULATION: Starting Lint runner:\n" + options.workdir)
        else:
          self.log("Running Lint for " + options.workdir)  
          qxlint = QxLint(options)


# Invoke an external command and return its STDOUT and STDERR output.
def invokePiped(cmd):
  import subprocess
  p = subprocess.Popen(cmd, shell=True,
                       stdout=subprocess.PIPE,
                       stderr=subprocess.PIPE,
                       universal_newlines=True)
  output, errout = p.communicate()
  rcode = p.returncode

  return (rcode, output, errout)


# Invoke an external command and wait for it to finish.
def invokeExternal(cmd):
  import subprocess
  p = subprocess.Popen(cmd, shell=True,
                       stdout=sys.stdout,
                       stderr=sys.stderr)
  return p.wait()


# Send a multipart text/html e-mail
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