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

import qxtest, sys

testConf = {
  #'classPath'           : '/home/dwagner/qxselenium/selenium-java-client-driver.jar:/home/dwagner/rhino1_7R1/js.jar',
  'simulatorSvn'        : '/home/dwagner/workspace/qooxdoo.contrib/Simulator'
}

seleniumConf = {
  'startSelenium'       : 'java -jar /home/dwagner/qxselenium/selenium-server.jar -browserSideLog -log ',
  'seleniumHost'        : 'http://localhost:4444',                
  'seleniumLog'         : '/tmp/selenium.log',
  'seleniumReport'      : 'selenium-report.html',  
}

autConf = {
  'autHost'             : 'http://172.17.13.245',
  'autPathTestrunner'   : '/framework/test/index.html',
  'autPathDemobrowser'  : '/application/demobrowser/build/index.html',
  'autPathFeedreader'   : '/application/feedreader/build/index.html',
  'autPathPlayground'   : '/application/playground/build/index.html'
}

browserConf = {
  'IE'                  : '*iexplore',
  'Safari4b'            : '"*custom C:\\Programme\\Safari\safari.exe"',
  'Opera964'            : '*opera'
}

mailConf = {
  'archiveDir'          : 'C:/test/reports',
  'mailFrom'            : 'daniel.wagner@1und1.de',
  #'mailTo'              : 'daniel.wagner@1und1.de',
  'mailTo'              : 'webtechnologies@1und1.de',
  'smtpHost'            : 'smtp.1und1.de',
  'smtpPort'            : 587
}

def main():
    remoteTest = qxtest.QxTest("remote", seleniumConf, testConf, autConf, browserConf, mailConf)
    rc = 0
    if ( remoteTest.isSeleniumServer() ):
        print("Selenium server seems to be running.")
    else:
        remoteTest.startSeleniumServer()
    if ( remoteTest.isSeleniumServer() ):

        print("Updating Simulator checkout")
        qxtest.invokeExternal("svn up " + testConf['simulatorSvn'])        
        trunkrev = remoteTest.getRevision()
        mailConf["trunkrev"] = trunkrev
        print("Qooxdoo revision: " + trunkrev)

        remoteTest.clearLogs()
        qxtest.invokeExternal(remoteTest.getStartCmd('Testrunner', 'IE'))
        qxtest.invokeExternal(remoteTest.getStartCmd('Testrunner', 'Safari4b'))
        remoteTest.formatLog()
        remoteTest.sendReport("Testrunner")

        remoteTest.clearLogs()
        qxtest.invokeExternal("wscript proxyEnable.vbs")
        qxtest.invokeExternal(remoteTest.getStartCmd('Demobrowser', 'IE'))
        qxtest.invokeExternal("wscript proxyDisable.vbs")
        remoteTest.formatLog()
        remoteTest.sendReport("Demobrowser")
        qxtest.invokeExternal("wscript ProcessKillLocalSaf.vbs")

        remoteTest.clearLogs()
        qxtest.invokeExternal(remoteTest.getStartCmd('Feedreader', 'IE'))
        remoteTest.formatLog()        
        remoteTest.sendReport("Feedreader")

        remoteTest.clearLogs()
        qxtest.invokeExternal(remoteTest.getStartCmd('Playground', 'IE'))
        remoteTest.formatLog()
        remoteTest.sendReport("Playground")

    else:
        rc = 1
        print("Couldn't contact Selenium server.") 

    return rc

if __name__ == "__main__":
    try:
        rc = main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc = 1
    sys.exit(rc)
 