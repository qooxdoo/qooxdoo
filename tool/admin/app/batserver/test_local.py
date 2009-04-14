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
#  Automated Test Configuration Script
#
# DESCRIPTION
#  This script defines an automated test run of qooxdoo applications and 
#  components.
#
#  This is a template for a local testing environment where a qooxdoo (trunk)
#  svn checkout on this machine is updated, and the applications and/or 
#  components to be tested are generated before the actual tests are started.
#   
#  The test setup can be configured by manipulating the configuration
#  dictionaries and adding or removing method calls to or from the main() 
#  function.
#
#  It is assumed that a web server is running on the test machine and the
#  applications to be tested are accessible using the host name and paths 
#  defined in autConf.

import sys, os, re
sys.path.append('/home/dwagner/workspace/qooxdoo.trunk/tool/admin/bin')
import qxtest

seleniumConf = {
  'startSelenium'       : 'java -jar /home/dwagner/qxselenium/selenium-server.jar -browserSideLog -log ',
  'seleniumHost'        : 'http://localhost:4444',                
  'seleniumLog'         : '/tmp/selenium.log',
  'seleniumReport'      : '/home/dwagner/qxselenium/selenium-report.html',  
}

testConf = {
  'svnRev'              : 'svnversion /var/www/qx/trunk',
  'qxPathAbs'           : '/var/www/qx/trunk/qooxdoo',  
  'classPath'           : '/home/dwagner/qxselenium/selenium-java-client-driver.jar:/home/dwagner/rhino1_7R1/js.jar',
  'simulatorSvn'        : '/home/dwagner/workspace/qooxdoo.contrib/Simulator'
}

buildConf = {
  'buildErrorLog'       : 'buildErrors.log',
  'batbuild'            : '/tool/admin/app/batserver/batbuild.py -z -C',           
  'Tests'               : '-p framework -g test -n',
  'Demobrowser'         : '-p application/demobrowser -g build -n',
  'Feedreader'          : '-p application/feedreader -g build -n',
  'Playground'          : '-p application/playground -g build -n',
}

autConf = {
  'autHost'             : 'http://172.17.12.142',
  'autPathTestrunner'   : '/qx/trunk/qooxdoo/framework/test/index.html',
  'autPathDemobrowser'  : '/qx/trunk/qooxdoo/application/demobrowser/build/index.html',
  'autPathFeedreader'   : '/qx/trunk/qooxdoo/application/feedreader/build/index.html',
  'autPathPlayground'   : '/qx/trunk/qooxdoo/application/playground/build/index.html'
}

browserConf = {
  'FF308'               : '*custom /usr/lib/firefox-3.0.8/firefox -no-remote -P selenium-3',
  'FF31b2'              : '*custom /home/dwagner/firefox-31b2/firefox -no-remote -P selenium-31b2',
  'FF31b3'              : '*custom /home/dwagner/firefox-31b3/firefox -no-remote -P selenium-31b3',
  'FF2'                 : '*custom /home/dwagner/firefox2/firefox -no-remote -P selenium-2',
  'FF15'                : '*custom /home/dwagner/firefox-15/firefox -P selenium-15',
  'Opera964'            : '*opera'
}

mailConf = {
  'reportFile'          : seleniumConf['seleniumReport'],
  'archiveDir'          : '/home/dwagner/qxselenium/reports',
  'mailFrom'            : 'daniel.wagner@1und1.de',
  'mailTo'              : 'daniel.wagner@1und1.de',
  #'mailTo'              : 'webtechnologies@1und1.de',
  'smtpHost'            : 'smtp.1und1.de',
  'smtpPort'            : 587
}

lintConf = {
  'applications'        : ['demobrowser', 'feedreader', 'playground', 'portal'],
  'components'          : ['apiviewer', 'testrunner', 'inspector'],
  'other'               : ['framework']
}

def main():
  localTest = qxtest.QxTest("local", seleniumConf, testConf, autConf, browserConf, mailConf)

  rc = 0    
  if ( localTest.isSeleniumServer() ):
    print("Selenium server seems to be running.")
  else:
    localTest.startSeleniumServer()
  if ( localTest.isSeleniumServer() ):

    #print("Updating Simulator checkout")
    #qxtest.invokeExternal("svn up " + testConf["simulatorSvn"])
    #localTest.buildAll(buildConf)
    localTest.runLint(lintConf)

    """localTest.clearLogs()
    qxtest.invokeExternal(localTest.getStartCmd('Testrunner','FF15'))
    qxtest.invokeExternal('pkill firefox')
    qxtest.invokeExternal(localTest.getStartCmd('Testrunner','FF2'))
    qxtest.invokeExternal('pkill firefox')
    qxtest.invokeExternal(localTest.getStartCmd('Testrunner','FF308'))
    qxtest.invokeExternal('pkill firefox')
    qxtest.invokeExternal(localTest.getStartCmd('Testrunner','FF31b3'))
    qxtest.invokeExternal('pkill firefox')
    qxtest.invokeExternal(localTest.getStartCmd('Testrunner','Opera964'))
    localTest.formatLog()    
    localTest.sendReport("Testrunner")        
    
    localTest.clearLogs()
    qxtest.invokeExternal(localTest.getStartCmd('Demobrowser','Opera964'))
    qxtest.invokeExternal(localTest.getStartCmd('Demobrowser','FF308'))
    qxtest.invokeExternal('pkill firefox')
    localTest.formatLog()    
    localTest.sendReport("Demobrowser")"""        
    
    """localTest.clearLogs()
    qxtest.invokeExternal(localTest.getStartCmd('Feedreader','FF15'))
    qxtest.invokeExternal('pkill firefox')
    qxtest.invokeExternal(localTest.getStartCmd('Feedreader','FF2'))
    qxtest.invokeExternal('pkill firefox')
    qxtest.invokeExternal(localTest.getStartCmd('Feedreader','FF308'))
    qxtest.invokeExternal('pkill firefox')                
    qxtest.invokeExternal(localTest.getStartCmd('Feedreader','FF31b3'))
    qxtest.invokeExternal('pkill firefox')
    qxtest.invokeExternal(localTest.getStartCmd('Feedreader','Opera964'))
    localTest.formatLog()    
    localTest.sendReport("Feedreader")"""
    
    """localTest.clearLogs()
    qxtest.invokeExternal(localTest.getStartCmd('Playground','FF15'))
    qxtest.invokeExternal('pkill firefox')
    qxtest.invokeExternal(localTest.getStartCmd('Playground','FF2'))
    qxtest.invokeExternal('pkill firefox')
    qxtest.invokeExternal(localTest.getStartCmd('Playground','FF308'))
    qxtest.invokeExternal('pkill firefox')
    qxtest.invokeExternal(localTest.getStartCmd('Playground','FF31b3'))
    qxtest.invokeExternal('pkill firefox')
    qxtest.invokeExternal(localTest.getStartCmd('Playground','Opera964'))
    localTest.formatLog()
    localTest.sendReport("Playground")"""

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
 