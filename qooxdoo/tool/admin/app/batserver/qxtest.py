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

import sys, os
sys.path.append( os.path.join('..', '..', 'bin') )
from lintRunner import QxLint
from logFormatter import QxLogFormat

class QxTest():
  def __init__(self, testType="remote", seleniumConf=None, testConf=None, autConf=None, browserConf=None, mailConf=None):
    self.testType = testType
    self.seleniumConf = seleniumConf
    self.testConf = testConf
    self.autConf = autConf
    self.browserConf = browserConf
    self.mailConf = mailConf
    self.trunkrev = None

    if (self.testType == "local"):
      self.getLocalRevision()
    else:
      self.getRemoteRevision()

    import socket
    socket.setdefaulttimeout(10)


  # Start the Selenium RC server and check its status.
  def startSeleniumServer(self):
    import subprocess, time
    print "Starting Selenium server..."
    selserv = subprocess.Popen(self.seleniumConf['startSelenium'] 
                               + self.seleniumConf['seleniumLog'], shell=True)
  
    # wait a while for the server to start up
    time.sleep(20)
  
    # check if it's up and running
    if ( not(self.isSeleniumServer()) ):
      print "Selenium server not responding, waiting a little longer..."
      time.sleep(20)
      if ( not(isSeleniumServer()) ):
        print "Selenium server not responding."
        sys.exit(1)


  # Send an HTTP request to the Selenium proxy. A 403 response means it's running.
  def isSeleniumServer(self):
    from urllib2 import Request, urlopen, URLError
    status = False
    print("Checking Selenium server")
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
      if (target != "batbuild" and target != "buildErrorLog"):
        print("Building " + target)      
        cmd += " " + buildConf[target]
        status, std, err = invokePiped(cmd)
        if (status > 0):
          print("Error while building " + target + ", see " 
                + buildConf['buildErrorLog'] + " for details.")        
          buildLogFile.write(target + "\n" + err)
          buildLogFile.write("\n========================================================\n\n")
        else:
          print(target + " build finished without errors.")
    buildLogFile.close()    
    self.trunkrev = self.getLocalRevision()
    self.storeRevision()


  # Returns the SVN checkout's revision number
  def getLocalRevision(self):
    ret,out,err = invokePiped("svnversion" + self.testConf["qxPathAbs"])
    rev = out.rstrip('\n')
    self.trunkrev = rev
    print("Local qooxdoo checkout at revision " + self.trunkrev)
    return rev    
  

  # Writes the revision number of a local qooxdoo checkout to a file
  def storeRevision(self):
    fPath = os.path.join(self.testConf['qxPathAbs'],'revision.txt')
    print("Storing revision number " + self.trunkrev + " in file " + fPath)
    rFile = open(fPath, 'w')
    rFile.write(self.trunkrev)
    rFile.close()  


  # Reads the qooxdoo checkout's revision number from a file on the test host
  def getRemoteRevision(self):
    import urllib
    rev = urllib.urlopen(self.autConf['autHost'] + '/revision.txt').read()
    self.trunkrev = rev
    print("Remote qooxdoo checkout at revision " + self.trunkrev)
    return rev


  # Run tests for defined applications
  def runTests(self, appConf):
    for app in appConf:
      
      if appConf[app]['clearLogs']:
        self.clearLogs()
      
      for browser in appConf[app]['browsers']:
        print("Testing: " + app + " on " + browser)        
        cmd = self.getStartCmd(app, browser)
        #print(cmd)
        invokeExternal(cmd)
        
        if appConf[app]['killBrowser']:
          self.killBrowser(browser)
      
      if (appConf[app]['sendReport']):
        self.formatLog()
        self.sendReport(app)


  # Assembles the shell command that launches the actual test in Rhino.
  def getStartCmd(self, aut, browser):
    cmd = "java"
    if ('classPath' in self.testConf):
        cmd += " -cp " + self.testConf['classPath']
    cmd += " org.mozilla.javascript.tools.shell.Main"    
    cmd += " " + self.testConf['simulatorSvn'] + "/trunk/tool/selenium/simulation/" + aut.lower() + "/test_" + aut.lower() + ".js"
    cmd += " autHost=" + self.autConf['autHost']
    cmd += " autPath=" + self.autConf['autPath' + aut]
    cmd += " testBrowser='" + self.browserConf[browser] + "'"
    return cmd


  # Sends the generated test report file by email.
  def sendReport(self, aut):    
    import re
    
    print("Preparing to send " + aut + " report: " + self.mailConf['reportFile'])
    if ( not(os.path.exists(self.mailConf['reportFile'])) ):
      print "Report file not found, quitting."
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
  
    if (self.trunkrev):
      self.mailConf['subject'] += " " + osystem + " (trunk r" + self.trunkrev + "): "
    else:
      self.mailConf['subject'] += " " + osystem + ": "
    if (failed != ""):
      self.mailConf['subject'] += failed + " test runs failed!"
    else:
      self.mailConf['subject'] += totalE + " issues"    
  
    # Send mail
    if (osystem !=""):

      sendMultipartMail(self.mailConf)
      
    else:
      print("Report file seems incomplete, report not sent.")

    # Rename report file, adding current date.
    """from datetime import datetime
    now = datetime.today()
    datestring = now.strftime("%Y-%m-%d_%H.%M")
    newname_temp = "selenium-report_" + datestring + ".html"
    newname = os.path.join(os.path.dirname(self.mailConf['reportFile']),newname_temp)
    print("Renaming report file to " + newname)
    os.rename(self.mailConf['reportFile'], newname)
    print("Moving report file to " + self.mailConf['archiveDir'])    
    shutil.move(newname, self.mailConf['archiveDir'])"""


  # Run logFormatter on Selenium log file 
  def formatLog(self):
    
    class FormatterOpts():
      def __init__(self,logfile,htmlfile):
       self.logfile = logfile
       self.htmlfile = htmlfile
       
    options = FormatterOpts(self.seleniumConf['seleniumLog'], self.seleniumConf['seleniumReport'])      
    print("Formatting log file " + self.seleniumConf['seleniumLog'])  
    logformat = QxLogFormat(options)


  # Clear Selenium log file and report HTML file
  def clearLogs(self):
    if (os.path.exists(self.seleniumConf['seleniumLog'])):
      f = open(self.seleniumConf['seleniumLog'], 'w')
      print("Emptying server log file " + self.seleniumConf['seleniumLog'])
      f.write('')
      f.close()

    if (os.path.exists(self.seleniumConf['seleniumReport'])):
      f = open(self.seleniumConf['seleniumReport'], 'w')
      print("Emptying Selenium report file " + self.seleniumConf['seleniumReport'])
      f.write('')
      f.close()


# Kill a browser process to make sure subsequent tests can launch the same browser
  def killBrowser(self, browser):    
    browserFull = self.browserConf[browser]
    procName = None
    
    if "firefox" in browserFull:
      procName = "firefox"
      
    if "opera" in browserFull:
      procName = "opera"
      
    if "iexplore" in browserFull:
      procName = "iexplore"
      
    if "afari" in browserFull:
      procName = "Safari"
    
    if "hrome" in browserFull:
      procName = "chrome"
    
    if procName:
      if os.uname()[0] == "Linux":
        print("Killing Linux browser process: " + procName)      
        invokeExternal("pkill " + procName)
      else:
        procName += ".exe"
        print("TODO: Killing Windows browser process: " + procName)
    
    else:
      print("Unable to determine browser process name")    


  # Run Ecmalint on targets defined in lintConf
  def runLint(self,lintConf):    
    lintTargets = []
    
    for key in lintConf:
      if (key == "applications"):
        for target in lintConf[key]:
          lintTargets.append("application/" + target)
      
      elif (key == "components"):
        for target in lintConf[key]:
          lintTargets.append("component/" + target)
      
      else:
        for target in lintConf[key]:
          lintTargets.append(target)

    for target in lintTargets:
      print("Running Lint for " + target)
      workdir = os.path.join(self.testConf['qxPathAbs'], target)
      
      class LintOpts():
        def __init__(self,workdir,mailto):
          self.workdir = workdir
          self.mailto = mailto
          self.outputfile = None
      
      options = LintOpts(workdir,self.mailConf['mailTo'])      
      
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