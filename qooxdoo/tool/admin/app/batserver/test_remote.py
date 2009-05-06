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

import sys, os
sys.path.append(os.getcwd())

testConf = {
  'simulateTest'        : False,
  'testLogDir'          : '/home/dwagner/qxselenium/remote',
  'simulatorSvn'        : '/home/dwagner/workspace/qooxdoo.contrib/Simulator',
  'proxyEnable'         : 'wscript proxyEnable.vbs',
  'proxyDisable'        : 'wscript proxyDisable.vbs',
  'compatEnable'        : 'wscript compatEnable.vbs',
  'compatDisable'       : 'wscript compatDisable.vbs',  
  'classPath'           : '/home/dwagner/qxselenium/selenium-java-client-driver.jar:/home/dwagner/rhino1_7R1/js.jar',
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
  'FF3'                 : '*custom /usr/lib/firefox-3.0.9/firefox -no-remote -P selenium-3',
  'FF31'                : '*custom /home/dwagner/firefox-31b3/firefox -no-remote -P selenium-31b3',
  'FF2'                 : '*custom /home/dwagner/firefox2/firefox -no-remote -P selenium-2',
  'FF15'                : '*custom /home/dwagner/firefox-15/firefox -P selenium-15',
  'Opera96'             : '*opera'
}

mailConf = {
  'reportFile'          : seleniumConf['seleniumReport'],
  'archiveDir'          : '/home/dwagner/qxselenium/reports',
  'hostId'              : 'LinRem',
  'mailFrom'            : 'daniel.wagner@1und1.de',
  'mailTo'              : 'daniel.wagner@1und1.de',
  #'mailTo'              : 'webtechnologies@1und1.de',
  'smtpHost'            : 'smtp.1und1.de',
  'smtpPort'            : 587
}

playgroundConf = {
  'appName' : 'Playground',
  'clearLogs' : True,
  'sendReport' : True,
  'browsers' : [    
    {
       'browserId' : 'FF3',
       'kill' : True
    },    
    {
       'browserId' : 'Opera96',
       'kill' : True
    }
  ]
}

def main():
  download("http://qooxdoo.svn.sourceforge.net/viewvc/qooxdoo/trunk/qooxdoo/tool/admin/app/batserver/qxtest.py")
  import qxtest
  download("http://qooxdoo.svn.sourceforge.net/viewvc/qooxdoo/trunk/qooxdoo/tool/admin/bin/logFormatter.py")     

  remoteTest = qxtest.QxTest("remote", seleniumConf, testConf, autConf, browserConf, mailConf)
  
  remoteTest.startSeleniumServer()
  
  remoteTest.updateSimulator()    
    
  for browser in browserConf:
    remoteTest.killBrowser(browser)

  remoteTest.runTests(playgroundConf) 

  return 0


def download(url):
  """Copy the contents of a file from a given URL
  to a local file.
  """
  import urllib
  try:
    webFile = urllib.urlopen(url)
  except IOError, e:
    print("ERROR: Unable to download file " + url + ": " + e.message)
    return

  localFile = open(url.split('/')[-1], 'w')
  localFile.write(webFile.read())
  webFile.close()
  localFile.close()


if __name__ == "__main__":
  try:
    rc = main()
  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    rc = 1
  sys.exit(rc)
 