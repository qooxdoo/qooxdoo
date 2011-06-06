#!/usr/bin/env python
# -*- coding: utf-8 -*-

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
  'startSelenium'       : 'java -jar /home/dwagner/qxselenium/selenium-server1.jar -browserSideLog -log ',
  'seleniumHost'        : 'http://localhost:4444',                
  'seleniumLog'         : '/tmp/selenium.log',
  'seleniumReport'      : '/home/dwagner/qxselenium/selenium-report.html',  
}

testConf = {
  'simulateTest'        : False,
  'getReportFrom'       : 'testLog',
  'testLogDir'          : '/home/dwagner/qxselenium/logs',
  'qxPathAbs'           : '/var/www/qx/trunk/qooxdoo',  
  'classPath'           : '/home/dwagner/qxselenium/selenium-java-client-driver.jar:/home/dwagner/rhino1_7R1/js.jar',
  'simulatorSvn'        : '/home/dwagner/workspace/qooxdoo.contrib/Simulator',
  'proxyEnable'         : 'wscript proxyEnable.vbs',
  'proxyDisable'        : 'wscript proxyDisable.vbs'
}

buildConf = {
  'stageDir'            : '/var/www/qx',             
  'buildLogLevel'       : 'error',
  'buildLogDir'         : '/home/dwagner/qxselenium/logs/build',
  'batbuild'            : 'tool/admin/app/batserver/batbuild.py -z -C',
  'targets' : {           
    'Testrunner'          : '-p framework -g test -n',
    'Demobrowser'         : '-p application/demobrowser -g build -n',
    'Feedreader'          : '-p application/feedreader -g build -n',
    'Playground'          : '-p application/playground -g build -n',
    'APIViewer'           : '-p framework -g api -n',
  }
}

autConf = {
  'autHost'             : 'http://172.17.12.142',
  'autQxPath'           : '/qx/trunk/qooxdoo',
  'autPathTestrunner'   : '/framework/test/index.html',
  'autPathDemobrowser'  : '/application/demobrowser/build/index.html',
  'autPathFeedreader'   : '/application/feedreader/build/index.html',
  'autPathPlayground'   : '/application/playground/build/index.html',
  'autPathAPIViewer'    : '/framework/api/index.html'
}

browserConf = {
  'Firefox 3.0.10'      : '*custom /usr/lib/firefox-3.0.10/firefox -no-remote -P selenium-3',
  'Firefox 3.5b4'       : '*custom /home/dwagner/firefox-35b4/firefox -no-remote -P selenium-35b4',
  'Firefox 2.0.0'       : '*custom /home/dwagner/firefox2/firefox -no-remote -P selenium-2',
  'Firefox 1.5.0'       : '*custom /home/dwagner/firefox-15/firefox -P selenium-15',
  'Opera 9.64'          : '*opera'
}

mailConf = {
  'reportFile'          : seleniumConf['seleniumReport'],
  'archiveDir'          : '/home/dwagner/qxselenium/reports',
  #'hostId'              : 'HOSTID',
  'mailFrom'            : 'daniel.wagner@1und1.de',
  #'mailTo'              : 'daniel.wagner@1und1.de',
  'mailTo'              : 'webtechnologies@1und1.de',
  'smtpHost'            : 'smtp.1und1.de',
  'smtpPort'            : 587
}

lintConf = {
  'application' : 
  [
    {
      'directory' : 'demobrowser'
    },
    {
      'directory' : 'feedreader'
    },
    {
      'directory' : 'playground'
    },
    {
      'directory' : 'portal'
    }
  ],
  'component' : 
  [
    {
      'directory' : 'apiviewer'
    }, 
    {
      'directory' : 'testrunner'
    }, 
    {
      'directory' : 'inspector'
    }
  ],
  'other' : 
  [
    { 
      'directory' : 'framework',
      'ignoreClasses' : ['qx/bom/Selector']
    }
  ]
}

testrunnerConf = {
  'appName' : 'Testrunner',
  'clearLogs' : True,
  'sendReport' : True,
  'browsers' : [
    {
       'browserId' : 'Firefox 1.5.0',
       'kill' : True
    },                    
    {
       'browserId' : 'Firefox 2.0.0',
       'kill' : True
    },
    {
       'browserId' : 'Firefox 3.0.10',
       'kill' : True
    },
    {
       'browserId' : 'Firefox 3.5b4',
       'kill' : True
    },    
    {
       'browserId' : 'Opera 9.64',
       'kill' : True
    }
  ]         
}

demobrowserConf = {
  'appName' : 'Demobrowser',
  'clearLogs' : True,
  'sendReport' : True,
  'browsers' : [
    {
       'browserId' : 'Firefox 2.0.0',
       'kill' : True
    },
    {
       'browserId' : 'Firefox 3.0.10',
       'kill' : True
    },
    {
       'browserId' : 'Firefox 3.5b4',
       'kill' : True
    },
    {
       'browserId' : 'Firefox 1.5.0',
       'kill' : True
    },
    {
       'browserId' : 'Opera 9.64',
       'kill' : True
    }
  ]         
}

feedreaderConf = {
  'appName' : 'Feedreader',
  'clearLogs' : True,
  'sendReport' : True,
  'browsers' : [
    {
       'browserId' : 'Firefox 2.0.0',
       'kill' : True
    },
    {
       'browserId' : 'Firefox 3.0.10',
       'kill' : True
    },
    {
       'browserId' : 'Firefox 3.5b4',
       'kill' : True
    },
    {
       'browserId' : 'Firefox 1.5.0',
       'kill' : True
    },
    {
       'browserId' : 'Opera 9.64',
       'kill' : True
    }
  ]         
}

playgroundConf = {
  'appName' : 'Playground',
  'clearLogs' : True,
  'sendReport' : True,
  'browsers' : [
    {
       'browserId' : 'Firefox 2.0.0',
       'kill' : True
    },
    {
       'browserId' : 'Firefox 3.0.10',
       'kill' : True
    },
    {
       'browserId' : 'Firefox 3.5b4',
       'kill' : True
    },
    {
       'browserId' : 'Firefox 1.5.0',
       'kill' : True
    },
    {
       'browserId' : 'Opera 9.64',
       'kill' : True
    }
  ]         
}

apiviewerConf = {
  'appName' : 'APIViewer',
  'clearLogs' : True,
  'sendReport' : True,
  'browsers' : [
    {
       'browserId' : 'Opera 9.64',
       'kill' : True
    },
    {
       'browserId' : 'Firefox 3.0.10',
       'kill' : True
    }
  ]
}

def main():
  localTest = qxtest.QxTest("local", seleniumConf, testConf, autConf, browserConf, mailConf)  

  localTest.startSeleniumServer()

  #localTest.updateSimulator()
    
  for browser in browserConf:
    localTest.killBrowser(browser)
  
  localTest.buildAll(buildConf)
  localTest.runLint(lintConf)    
  localTest.runTests(testrunnerConf)  
  localTest.runTests(feedreaderConf)
  localTest.runTests(playgroundConf)
  localTest.runTests(demobrowserConf)
  localTest.runTests(apiviewerConf)

  return 0

if __name__ == "__main__":
    try:
        rc = main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc = 1
    sys.exit(rc)
 