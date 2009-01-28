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
#  Automated Framework Test Controller
#
# DESCRIPTION
#  This script utilizes the Build-And-Test (BAT)-Client/Server infrastructure
#  in order to automatically update a qooxdoo SVN checkout, generate the 
#  framework tests, run them in various browsers through Selenium and generate a
#  test report which is then sent by email.
#
# OVERVIEW
#  1. batbuild.py is run. Updates SVN and runs generate.py test in framework 
#     directory.
#  2. (Optional) HTTP server started to make framework apps/components 
#     accessible for Selenium-controlled browsers.
#  3. batserver.py started.
#  4. Selenium RC server started.
#  5. batclient.py started. Registers with BATserver, receives and executes work 
#     package.
#  6. Work package runs Selenium tests, starts report generator.
#  7. Report sent by email.
#
# ISSUES/CAVEATS
#  Currently, all components of the testing infrastructure must be installed on
#  the same machine. Configuration options should be added to decouple the
#  components and allow distributed testing.


import subprocess, sys, os, re, time

from urllib2 import Request, urlopen, URLError

testconf = {
  'startbuild'      : './batbuild.py -z -p framework -g test',
  'qxDir'           : '/var/www/qx/trunk/qooxdoo/',
  'seleniumLog'     : '/tmp/selenium.log',
  'seleniumReport'  : '/home/dwagner/qxselenium/selenium-report.html',
  'startSelenium'   : 'java -jar /home/dwagner/workspace/qooxdoo.contrib/Simulator/trunk/selenium-server.jar -browserSideLog -log ',
  'seleniumHost'    : 'http://localhost:4444',
  'startBatserv'    : './batserver.py --qx-path /qx/trunk/qooxdoo',
  'startBatclientTest'  : "./batclient.py --test-browsers '*custom /usr/lib/firefox-3.0.5/firefox -no-remote -P selenium-3,*opera' --aut-path '/framework/test/' -j '/home/dwagner/qxselenium/selenium-java-client-driver.jar:/home/dwagner/rhino1_7R1/js.jar' --selenium-script /home/dwagner/qxselenium/test_testrunner.js --log-formatter '/usr/bin/python\ /home/dwagner/qxselenium/logFormatter.py\ /tmp/selenium.log\ /home/dwagner/qxselenium/selenium-report.html'",
  'startBatclientDemo'  : "./batclient.py --test-browsers '*custom /usr/lib/firefox-3.0.5/firefox -no-remote -P selenium-3,*opera' --aut-path '/application/demobrowser/source/' -j '/home/dwagner/qxselenium/selenium-java-client-driver.jar:/home/dwagner/rhino1_7R1/js.jar' --selenium-script /home/dwagner/qxselenium/test_demobrowser.js --log-formatter '/usr/bin/python\ /home/dwagner/qxselenium/logFormatter.py\ /tmp/selenium.log\ /home/dwagner/qxselenium/selenium-report.html'",
  'mailFrom'        : 'daniel.wagner@1und1.de',
  'mailTo'          : 'daniel.wagner@1und1.de',
  #'mailTo'          : 'webtechnologies@1und1.de',
  'smtpHost'        : 'smtp.1und1.de',
  'smtpPort'        : 587
}

def main():
    testconf['batDir'] = os.getcwd()
    batbuild()
    #httpServer() Start Python CGIHTTPServer if necessary
    batserver()
    if ( isSeleniumServer() ):
        print("Selenium server seems to be running.")
        if (os.path.exists(testconf['seleniumLog'])):            
            f = open(testconf['seleniumLog'], 'w')
            print("Emptying server log file " + testconf['seleniumLog'])
            f.write('')
            f.close()

        if (os.path.exists(testconf['seleniumReport'])):
            print("Deleting report file " + testconf['seleniumReport'])
            os.remove(testconf['seleniumReport'])
    else:
        seleniumserver()
    if ( isSeleniumServer() ):
        batclient()
        sendReport()
        #cleanup() subprocess has no terminate method in Python 2.5
    else:
        print("Couldn't contact Selenium server.")


# Start batbuild.py (updates SVN, generates framework tests)
def batbuild():
    print ("Starting batbuild...")
    batbuild = subprocess.Popen(testconf['startbuild'], shell=True,
                                stdout=sys.stdout,
                                stderr=subprocess.STDOUT)
    
    buildRc = batbuild.wait()
    if (buildRc != 0):
        print "batbuild exited with status " + repr(buildRc)
        sys.exit(1)
    
    print "batbuild exited without errors."


# Send an HTTP request to the Selenium proxy. A 403 response means it's running.
def isSeleniumServer():
    status = False
    print("Checking Selenium server")
    req = Request(testconf['seleniumHost'])
    try:
        response = urlopen(req)
        # Selenium should always refuse this request, so we should never get here
    except URLError, e:
        if hasattr(e, 'code'):
            if (e.code == 403):
                status = True
    return status


# Start a web server in the SVN checkout dir so Selenium can access the 
# application over http.  
def httpServer():
    os.chdir(testconf['qxDir'])
    print("Starting HTTP server in " + testconf['qxDir'])
    subprocess.Popen("python -m CGIHTTPServer", shell=True)
    time.sleep(5)


# Start BAT server process and check its status.
def batserver():
    global batserv
    os.chdir(testconf['batDir'])
    print "Starting batserver..."    
    batserv = subprocess.Popen(testconf['startBatserv'], shell=True,
                                stdout=sys.stdout,
                                stderr=subprocess.STDOUT)
    # batserver should start almost instantly
    time.sleep(5)
    if (batserv.poll() == None):
        print "batserver seems to be running."
    else:
        print("batserver exited with status " + repr(batserv.poll() ) + ", is it already running?" )        
        # TODO: Check batserver's shell output to check if it really quit 
        # because there was already an instance running


# Start the Selenium RC server and check its status.
def seleniumserver():
    global selserv    
    if (os.path.exists(testconf['seleniumLog'])):
        print("Deleting server log file " + testconf['seleniumLog'])
        os.remove(testconf['seleniumLog'])
        
    if (os.path.exists(testconf['seleniumReport'])):
        print("Deleting report file " + testconf['seleniumReport'])
        os.remove(testconf['seleniumReport'])
    print "Starting Selenium server..."    
    selserv = subprocess.Popen(testconf['startSelenium'] + testconf['seleniumLog'], shell=True)
    
    # wait a while for the server to start up
    time.sleep(20)
    
    # check if it's up and running
    if ( not(isSeleniumServer()) ):
        print "Selenium server not responding, waiting a little longer..."        
        time.sleep(20)
        if ( not(isSeleniumServer()) ):
            print "Selenium server not responding."
            sys.exit(1)


# Start BAT client process. Wait until it's finished.
def batclient():
    print "Starting batclient: Test runner job..."    
    batclient = subprocess.Popen(testconf['startBatclientTest'], shell=True,
                                stdout=sys.stdout,
                                stderr=subprocess.STDOUT)
    clientRc = batclient.wait()
    print("batclient ended with status " + repr(clientRc))
    
    #print "Starting batclient: Demo browser job..."    
    #batclient = subprocess.Popen(testconf['startBatclientDemo'], shell=True,
    #                            stdout=sys.stdout,
    #                            stderr=subprocess.STDOUT)
    #clientRc = batclient.wait()
    #print("batclient ended with status " + repr(clientRc))
    

# Stop Selenium RC and BATserver processes. Not essential since existing server
# processes will be reused by subsequent test runs.
def cleanup():
    print "Terminating Selenium server"
    selserv.terminate()
    print "Terminating batserver"
    batserv.terminate()


# Send generated test report file by email.
def sendReport():
    if ( not(os.path.exists(testconf['seleniumReport'])) ):
        print "Report file not found, quitting."
        sys.exit(1)
    
    from email.MIMEMultipart import MIMEMultipart
    from email.MIMEText import MIMEText
    from email.MIMEImage import MIMEImage
    import smtplib

    # Create the root message and fill in the from, to, and subject headers
    msgRoot = MIMEMultipart('related')
    msgRoot['Subject'] = 'Test Runner report'
    msgRoot['From'] = testconf['mailFrom']
    msgRoot['To'] = testconf['mailTo']
    msgRoot.preamble = 'This is a multi-part message in MIME format.'
    
    # Encapsulate the plain and HTML versions of the message body in an
    # 'alternative' part, so message agents can decide which they want to display.
    msgAlternative = MIMEMultipart('alternative')
    msgRoot.attach(msgAlternative)
    
    msgText = MIMEText('Test Runner results.')
    msgAlternative.attach(msgText)
        
    reportFile = open(testconf['seleniumReport'], 'rb')
    
    msgText = MIMEText(reportFile.read(), 'html')
    msgAlternative.attach(msgText)
    
    reportFile.close()
    
    print("Sending report to " + testconf['mailTo'])

    mailServer = smtplib.SMTP(testconf['smtpHost'], testconf['smtpPort'])
    mailServer.ehlo()
    mailServer.starttls()
    mailServer.ehlo()
    #mailServer.login(testconf['smtpUser'], testconf['smtpPwd'])
    mailServer.sendmail(testconf['mailFrom'], testconf['mailTo'], msgRoot.as_string())
    mailServer.close()    

if __name__ == "__main__":
    try:
        rc = main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc = 1
    sys.exit(rc)
 