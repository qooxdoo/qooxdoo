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

# NAME
#  Automated Test Script - Remote
#
# DESCRIPTION
#  This script controls automated tests of qooxdoo applications and components 
#  located on a remote server.
#  The test setup can be configured by manipulating the configuration
#  dictionaries and by adding and removing method calls to and from the main()
#  method.

import subprocess, sys, os, re, time, httplib, socket
from urllib2 import Request, urlopen, URLError

socket.setdefaulttimeout(10)

testConf = {
  'seleniumLog'         : 'selenium.log',
  'seleniumReport'      : 'selenium-report.html',
  'archiveDir'          : 'C:/test/reports',
  'logFormat'            : 'C:/test/logFormatter.py selenium.log',
  'startSelenium'       : 'java -jar C:/test/selenium-server.jar -browserSideLog -log ',
  'seleniumHost'        : 'http://localhost:4444',
  #'classPath'           : '/home/dwagner/qxselenium/selenium-java-client-driver.jar:/home/dwagner/rhino1_7R1/js.jar',
  'simulatorSvn'        : 'C:/qooxdoo/Simulator',
  'scriptTestrunner'    : 'trunk/tool/selenium/simulation/testrunner/test_testrunner.js',
  'scriptDemobrowser'   : 'trunk/tool/selenium/simulation/demobrowser/test_demobrowser.js',
  'scriptFeedreader'    : 'trunk/tool/selenium/simulation/feedreader/test_feedreader.js',
  'scriptPlayground'    : 'trunk/tool/selenium/simulation/playground/test_playground.js',
}

autConf = {
  'autHost'             : 'http://172.17.13.245',
  'autPathTestrunner'   : '/framework/test/index.html',
  'autPathDemobrowser'  : '/application/demobrowser/build/index.html',
  'autPathFeedreader'   : '/application/feedreader/build/index.html',
  'autPathPlayground'   : '/application/playground/build/index.html'
}

browserConf = {
  'IE'       : '*iexplore',
  'Safari4b' : '"*custom C:\\Programme\\Safari\safari.exe"'
}

mailConf = {
  'mailFrom'        : 'daniel.wagner@1und1.de',
  #'mailTo'          : 'daniel.wagner@1und1.de',
  'mailTo'          : 'webtechnologies@1und1.de',
  'smtpHost'        : 'smtp.1und1.de',
  'smtpPort'        : 587
}

def main():
    if ( isSeleniumServer() ):
        print("Selenium server seems to be running.")
    else:
        seleniumserver()
    if ( isSeleniumServer() ):
        invoke_external("svn up " + testConf['simulatorSvn'])

        clearLogs()
        invoke_external(getStartCmd('Testrunner', 'IE'))
        invoke_external(getStartCmd('Testrunner', 'Safari4b'))
        invoke_external(testConf['logFormat'])
        sendReport("Testrunner")

        clearLogs()
        invoke_external("wscript proxyEnable.vbs")
        invoke_external(getStartCmd('Demobrowser', 'IE'))
        invoke_external("wscript proxyDisable.vbs")
        invoke_external(testConf['logFormat'])
        sendReport("Demobrowser")
        invoke_external("wscript ProcessKillLocalSaf.vbs")

        clearLogs()
        invoke_external(getStartCmd('Feedreader', 'IE'))
        invoke_external(testConf['logFormat'])
        sendReport("Feedreader")

        clearLogs()
        invoke_external(getStartCmd('Playground', 'IE'))
        invoke_external(testConf['logFormat'])
        sendReport("Playground")

    else:
        print("Couldn't contact Selenium server.") 


def invoke_external(cmd):
    import subprocess    
    p = subprocess.Popen(cmd, shell=True,
                         stdout=sys.stdout,
                         stderr=sys.stderr)
    return p.wait()

# Send an HTTP request to the Selenium proxy. A 403 response means it's running.
def isSeleniumServer():
    status = False
    print("Checking Selenium server")
    req = Request(testConf['seleniumHost'])
    try:
        response = urlopen(req)
        # Selenium should always refuse this request, so we should never get here
    except URLError, e:
        if hasattr(e, 'code'):
            if (e.code == 403):
                status = True
    return status


# Start the Selenium RC server and check its status.
def seleniumserver():
    global selserv
    print "Starting Selenium server..."
    selserv = subprocess.Popen(testConf['startSelenium'] + testConf['seleniumLog'], shell=True)
    
    # wait a while for the server to start up
    time.sleep(20)

    # check if it's up and running
    if ( not(isSeleniumServer()) ):
        print "Selenium server not responding, waiting a little longer..."        
        time.sleep(20)
        if ( not(isSeleniumServer()) ):
            print "Selenium server not responding."
            sys.exit(1)

# Assemble the shell command that launches the actual test in Rhino.
def getStartCmd(aut, browser):
    cmd = "java"
    if ('classPath' in testConf):
        cmd += " -cp " + testConf['classPath']
    cmd += " org.mozilla.javascript.tools.shell.Main"
    cmd += " " + testConf['simulatorSvn'] + "/" + testConf['script' + aut]
    cmd += " autHost=" + autConf['autHost']
    cmd += " autPath=" + autConf['autPath' + aut]
    cmd += " testBrowser=" + browserConf[browser]
    print(cmd)
    return cmd

# Sends the generated test report file by email.
def sendReport(aut,trunkrev=""):
    print("Report: " + testConf['seleniumReport'])
    if ( not(os.path.exists(testConf['seleniumReport'])) ):
        print "Report file not found, quitting."
        sys.exit(1)

    from email.MIMEMultipart import MIMEMultipart
    from email.MIMEText import MIMEText
    import smtplib, re, shutil

    mailSubject = "[qooxdoo-test] " + aut

    reportFile = open(testConf['seleniumReport'], 'rb')

    osRe = re.compile('<p>Browser: .* on (.*)</p>')
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

    if (trunkrev != ""):
      mailSubject += " " + osystem + " (trunk r" + trunkrev + "): "
    else:
      mailSubject += " " + osystem + ": "
    if (failed != ""):
      mailSubject += failed + " test runs failed!"
    else:
      mailSubject += totalE + " issues"

    reportFile.seek(0)
    msg = MIMEMultipart()
    msg['Subject'] = mailSubject
    msg['From'] = mailConf['mailFrom']
    msg['To'] = mailConf['mailTo']
    msg.preamble = 'Test Results'

    msgText = MIMEText(reportFile.read(), 'html')
    msg.attach(msgText)

    # Send mail
    if (osystem !=""):
      print("Sending report. Subject: " + mailSubject)
      mailServer = smtplib.SMTP(mailConf['smtpHost'], mailConf['smtpPort'])
      mailServer.ehlo()
      mailServer.starttls()
      mailServer.ehlo()
      mailServer.sendmail(mailConf['mailFrom'], mailConf['mailTo'], msg.as_string())
      mailServer.close()
    else:
      print("Report file seems incomplete, report not sent.")

    # Rename report file, adding current date.
    """from datetime import datetime
    now = datetime.today()
    datestring = now.strftime("%Y-%m-%d_%H.%M")
    newname_temp = "selenium-report_" + datestring + ".html"
    newname = os.path.join(os.path.dirname(testConf['seleniumReport']),newname_temp)
    print("Renaming report file to " + newname)
    os.rename(testConf['seleniumReport'], newname)
    print("Moving report file to " + testConf['archiveDir'])
    shutil.move(newname, testConf['archiveDir'])"""

def clearLogs():
    if (os.path.exists(testConf['seleniumLog'])):
        f = open(testConf['seleniumLog'], 'w')
        print("Emptying server log file " + testConf['seleniumLog'])
        f.write('')
        f.close()
    
    if (os.path.exists(testConf['seleniumReport'])):
        f = open(testConf['seleniumReport'], 'w')
        print("Emptying Selenium report file " + testConf['seleniumReport'])
        f.write('')
        f.close()

if __name__ == "__main__":
    try:
        rc = main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc = 1
    sys.exit(rc)
 