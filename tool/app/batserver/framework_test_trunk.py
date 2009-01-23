#!/usr/bin/env python
import subprocess, sys, os, re, time

from urllib2 import Request, urlopen, URLError

testconf = {
  'startbuild'      : './batbuild.py -z -p framework -g test',
  'seleniumLog'     : '/tmp/selenium.log',
  'seleniumReport'  : '/home/dwagner/qxselenium/selenium-report.html',
  'startSelenium'   : 'java -jar /home/dwagner/workspace/qooxdoo.contrib/Simulator/trunk/selenium-server.jar -browserSideLog -log ',
  'seleniumHost'    : 'http://localhost:4444',
  'startBatserv'    : './batserver.py',
  'startBatclient'  : './batclient.py',
  'mailFrom'        : 'daniel.wagner@1und1.de',
  'mailTo'          : 'daniel.wagner@1und1.de',
  'smtpHost'        : 'smtp.1und1.de',
  'smtpPort'        : 587
}

def main():    
    batbuild()
    batserver()
    if ( isSeleniumServer() ):
        print("Selenium server seems to be running.")
    else:        
        seleniumserver()
    batclient()
    sendReport()
    #cleanup() subprocess has no terminate method in Python 2.5


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


def batserver():
    global batserv
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

def seleniumserver():
    global selserv    
    if (os.path.exists(testconf['seleniumLog'])):
        print("Deleting server log file " + testconf['seleniumLog'])
        os.remove(testconf['seleniumLog'])
        
    if (os.path.exists(testconf['seleniumReport'])):
        print("Deleting report file " + testconf['seleniumReport'])
        os.remove(testconf['seleniumReport'])
    print "Starting Selenium server..."    
    selserv = subprocess.Popen(testconf['startSelenium'] + testconf['seleniumLog'], shell=True,
                             stdout=subprocess.PIPE,
                             stderr=subprocess.STDOUT)
    
    # wait a while for the server to start up
    time.sleep(20)
    
    # check if it's up and running
    if ( not(isSeleniumServer()) ):
        print "Selenium server not responding, waiting a little longer..."        
        time.sleep(20)
        if ( not(isSeleniumServer()) ):
            print "Selenium server not responding."
            sys.exit(1)



def batclient():
    print "Starting batclient..."    
    batclient = subprocess.Popen(testconf['startBatclient'], shell=True,
                                stdout=sys.stdout,
                                stderr=subprocess.STDOUT)
    clientRc = batclient.wait()
    print("batclient ended with status " + repr(clientRc))    
    

def cleanup():
    print "Terminating Selenium server"
    selserv.terminate()
    print "Terminating batserver"
    batserv.terminate()

def sendReport():
    if ( not(os.path.exists(testconf['seleniumReport'])) ):
        print "Report file not found, quitting."
        sys.exit(1)
    
    from email.MIMEMultipart import MIMEMultipart
    from email.MIMEText import MIMEText
    from email.MIMEImage import MIMEImage
    import smtplib
    
    strFrom = 'zipotter@gmail.com'
    strTo = 'daniel.wagner@1und1.de'
    gmail_user = 'zipotter@gmail.com'
    gmail_pwd = 'va-5150'
    
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
    
    print("Sending report to " + strTo)
    
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
 