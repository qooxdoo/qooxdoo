#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
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

import util
from urllib2 import Request, urlopen, URLError
import subprocess
import time
import os


class SeleniumServer:
    class __impl:
        def __init__(self, config=None, simulate=False, logger=None):            
            self.configuration = config
            if not self.configuration:
                self.configuration = {
                    "seleniumHost" : "http://localhost",
                    "seleniumPort" : 4444,
                    "seleniumDir" : os.getcwd(),
                    "seleniumServerJar" : "selenium-server.jar"
                }
            self.simulate  = simulate
            
            if not logger:
                self.log = Logger()
            else:            
                self.log = logger
        
        
        def getId(self):
            return id(self)
            
            
        def isRunning(self, config=None):
            if config:
                self.configuration = config
                
            status = False
            req = Request(self.configuration["seleniumHost"] + ":" + str(self.configuration["seleniumPort"]))
            try:
                #response = urlopen(req)
                urlopen(req)
                # Selenium should always refuse this request, so we should never get here
            except URLError, e:
                if hasattr(e, 'code'):
                    if e.code == 403:
                        status = True
            except Exception, e:
                self.log.error("Error while checking if Selenium server is running: %s" %str(e))
        
            return status
    
        
        def start(self, config=None):
            if config:
                self.configuration = config
          
            if self.simulate:
                self.log.info("SIMULATION: Starting Selenium RC server.")
                return
              
            if self.isRunning():
                self.log.info("Selenium server already running.")
                return  
          
            cmd = "java"
            
            if "javaBin" in self.configuration:
                cmd = self.configuration["javaBin"]
            
            cmd += " -jar " + self.configuration["seleniumDir"] + "/" 
            
            if "seleniumVersion" in self.configuration:
                cmd += self.configuration["seleniumVersion"] + "/"
            
            cmd += self.configuration["seleniumServerJar"]
            
            cmd += " -port %s" %str(self.configuration["seleniumPort"])
    
            if "seleniumLog" in self.configuration:
                cmd += " -browserSideLog -log " + self.configuration['seleniumLog']
            
            if "options" in self.configuration:
                cmd += " %s" %self.configuration["options"]
            
            self.log.info("Starting Selenium server with command line %s" %cmd)
            
            #selserv = subprocess.Popen(cmd, shell=True)
            subprocess.Popen(cmd, shell=True)
          
            # wait a while for the server to start up
            time.sleep(10)
        
            # check if it's up and running
            if not self.isRunning():
                self.log.warn("Selenium server not responding, waiting a little longer...")
                time.sleep(30)
                if not self.isRunning():
                    raise RuntimeError, "Selenium server not responding."
            else:
                self.log.info("Selenium server started.")
        
    
        def stop(self, config=None):
            if config:
                self.configuration = config
            
            if not self.isRunning():
                self.log.info("Selenium server not running.")
                return
            
            if self.simulate:
                self.log.info("SIMULATION: Shutting down Selenium server.")
                return
          
            self.log.info("Shutting down Selenium server")
            req = Request(self.configuration['seleniumHost'] + ":" + str(self.configuration["seleniumPort"]) + "/selenium-server/driver/?cmd=shutDownSeleniumServer")
            try:
                response = urlopen(req)
                content = response.read()
                if "OK" in content:
                    self.log.info("Selenium server acknowledged shutdown request.")
                    # give the process some time to end
                    time.sleep(5)
                    return
            except URLError, e:
                self.log.warn("Selenium server shutdown failed: %s" %str(e))
            except Exception, e:
                self.log.error("Error shutting down Selenium server: %s" %str(e))
                
            self.kill()
          
          
        def kill(self):
          if self.simulate:
              self.log.info("SIMULATION: Killing all running Selenium server processes.")
              return
          else:
              self.log.info("Killing all running Selenium server processes.")
      
          os = util.getOperatingSystemName()
          if os == "Linux":      
              util.invokeExternal("pkill -f selenium-server")
              return
          if os == "Mac OS X":
              util.invokeExternal("pkill selenium-server")
          else:
              if "killSelenium" in self.configuration:
                  util.invokeExternal(self.configuration['killSelenium'])
              else:
                  self.log.error("No kill command known for this OS")
            
            
    __inst = None

    def __init__(self, config={}, simulate=False, logger=None):
        # Check whether we already have an instance
        if SeleniumServer.__inst is None:
            SeleniumServer.__inst = SeleniumServer.__impl(config, simulate, logger)

        # Store instance reference in the handle
        self.__dict__['_SeleniumServer__inst'] = SeleniumServer.__inst

    # Delegate attribute getters/setters to instance
    def __getattr__(self, attr):
        return getattr(self.__inst, attr)

    def __setattr__(self, attr, value):
        return setattr(self.__inst, attr, value)
    