#!/usr/bin/env python
# -*- coding: utf-8 -*-

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

import sys, os, re, random, codecs, urllib
import qxenviron
import util
import reporting
from seleniumserver import SeleniumServer
from build import Builder
from lint import Lint

binPath = os.path.abspath(os.path.join(os.pardir, os.pardir, "bin"))
sys.path.append(binPath)
from logFormatter import QxLogFormat
from simulationLogParser import SimulationLogParser

from generator.runtime.Log import Log
log = Log(None, "debug")

class TestRun:
    def __init__(self, config, simulate=False, logger=log):
        self.configuration = config
        if self.getConfigSetting("base/type", "") == "standalone-generator":
            self.configuration = self.getConfigFromGenerator()
        self.log = logger
        self.simulate = simulate
        self.startDate = util.getTimestamp()
        self.buildStatus = {}
        if "base" in self.configuration:
            self.configuration["base"]["testHostName"] = util.getHostName()
        
        self.log.info("New test run started on %s" %self.startDate)

    
    def getConfigSetting(self, path="", default=False, config=False):
        if not config:
            config = self.configuration
        pathParts = path.split("/")
        dict = config
        while dict:            
            for keyName in pathParts:      
                # invalid node name
                if not keyName in dict:
                    return default
                # final search path node, so we've found the right setting
                if keyName == pathParts[len(pathParts) - 1]:
                    return dict[keyName]
                # haven't reached the final step yet, but the current value is no dict so
                # we've nowhere else to look
                if type(dict[keyName]).__name__ != "dict":
                    return default
                # keep looking  
                dict = dict[keyName]
        return default
    
    
    def getConfigFromGenerator(self):
        jobConfig = self.configuration
        seleniumPath = os.path.abspath(jobConfig["selenium-java-client"])
        testConfig = {
          "base" : {
            "type" : "standalone",
          },
          
          "selenium" : {
            "seleniumHost" : jobConfig["selenium-host"],
            "seleniumPort" : jobConfig["selenium-port"],
            "rhinoJar" : jobConfig["rhino"],
            "seleniumDir" : os.path.dirname(seleniumPath),
            "seleniumClientDriverJar" : os.path.basename(seleniumPath),
          },
          
          "browsers" : {
            "Browser" : jobConfig["browser"]              
          },
          
          "testRun" : {
            "runType" : "",
            "simulatorDirectory" : jobConfig["simulator"],
            "host" : jobConfig["aut-host"],
            "applications" : {}
          }
        }
        
        autName = jobConfig["aut-name"]
        testConfig["testRun"]["applications"][autName] = {
          "path" : jobConfig["aut-path"],
          "simulationScript" : jobConfig["simulator"] + "/simpleTest.js",
          "processLog" : True,
          "browsers" : [
            {
               "browserId" : "Browser"
            }
          ] 
        }
        
        simulationOptions = ["logger=console"]
        
        simulationOptions.append("testClasspath=" + jobConfig["test-classpath"])
        testClasses = ",".join(jobConfig["test-include"])
        simulationOptions.append("testClasses=" + testClasses)
        
        if "simulation-options" in jobConfig:
            simulationOptions.extend(jobConfig["simulation-options"])
        testConfig["testRun"]["applications"][autName]["simulationOptions"] = simulationOptions
        
        if "java-classpath-separator" in jobConfig:
            testConfig["base"]["classPathSeparator"] = jobConfig["java-classpath-separator"] 
        
        return testConfig
    
    
    def runPackage(self):
        self.log.indent()
        testType = self.getConfigSetting("base/type", "standalone")

        if testType == "remote" and "testRun" in self.configuration:
            jUrl = self.getConfigSetting("testRun/host", "")
            jUrl += self.getConfigSetting("testRun/qxPath", "")
            jUrl += "buildStatus.json"
            try:
                self.buildStatus = util.getJsonFromUrl(jUrl)
            except Exception, e:
                self.log.error("Error while getting remote build status: " + str(e))
        
        if testType == "local":
            try:
                buildStatusFile = os.path.join(self.config["build"]["stageDir"], "trunk", "qooxdoo", "buildStatus.json")
                self.buildStatus = Builder.getBuildStatusFromFile(buildStatusFile)
            except Exception, e:
                pass  
        
        if "lint" in self.configuration:
            self.runLint(self.configuration["lint"])

        if "build" in self.configuration:
            buildConfig = self.configuration["build"]
            #buildConfig["buildLogDir"] = self.getConfigSetting("base/logDirectory", "") + "/" + buildConfig["buildLogDir"]
            builder = Builder(buildConfig, self.log)
            builder.buildAll()
            self.buildStatus = builder.buildStatus          
        
        if "generator" in self.configuration:
            self.log.info("Starting Generator test run")
            self.log.indent()
            generatorResults = Builder.testGenerator(self.configuration["generator"], self.log)
            reportServer = self.getConfigSetting("reporting/reportServer", False)
            if reportServer:
                self.log.info("Sending Generator test results to report server")
                response = reporting.sendResultToReportServer(reportServer, generatorResults, "generatorRun")
                self.log.info("Report Server response: %s" %response)
            self.log.outdent()
        
        if not "testRun" in self.configuration:
            return
        
        if self.getConfigSetting("testRun/updateSimulator", False):
            util.svnUpdate(self.getConfigSetting("testRun/simulatorDirectory"))
        
        if "applications" in self.configuration["testRun"]:
            for app in self.getConfigSetting("testRun/applications", {}):
                #appConf = self.configuration["testRun"]["applications"][app]
                appConf = self.getConfigSetting("testRun/applications/" + app)
                self.runSimsForApp(app, appConf)
        
        if "collections" in self.configuration["testRun"]:
            for coll in self.getConfigSetting("testRun/collections", {}):
                collConf = self.getConfigSetting("testRun/collections/" + coll)
                self.runSimsForCollection(coll, collConf, self.getConfigSetting("testRun/simulatorDirectory"))
        
        self.log.outdent()
    
    
    def runSimsForCollection(self, collection, collConf, simulatorBaseDir):
        seleniumConfig = self.getConfigSetting("selenium")
        simulatorDirectory = os.path.join(simulatorBaseDir, "trunk", "tool", "selenium", "simulation", "demobrowser", "demo")
        #print "running simulations for demos: " + repr(collConf)
        
        #testReportFile = self.prepareTestReport(self.getConfigSetting("base/reportDirectory", ""), collection)
        
        scanDir = collConf["scanDir"]
        appList = util.locate(scanDir, "*.html")
        
        for appDir in appList:
            dir, file = os.path.split(appDir)
            category = os.path.basename(dir) 
            appName, ext = os.path.splitext(file)
            #print category + " - " + appName
            
            scriptFile = os.path.join(simulatorDirectory, category, appName + ".js")
            if os.path.isfile(scriptFile):
                #print "got a test script for " + category + "-" + appName

                self.log.info("Running simulations for %s" %category + "." + appName)
                
                for browser in collConf["browsers"]:
                    seleniumServer = SeleniumServer(seleniumConfig, logger = self.log)
                    seleniumServer.start()
                    simConf = self.getSimulationConfig(collection, "collections", browser)
                    simConf["autPath"] = appDir
                    simConf["simulationScript"] = scriptFile
                    #print repr(simConf)            
                    sim = Simulation(simConf)
                    sim.run()
                    seleniumServer.stop()
            
        
    
    def runSimsForApp(self, app, appConf):
        testReportFile = self.prepareTestReport(self.getConfigSetting("base/reportDirectory", ""), app)
        logDirectory = self.getConfigSetting("base/logDirectory", False)
        if logDirectory:
            testLogFile = "%s/%s/%s.log" %(logDirectory,app,util.getTimestamp())
        
        seleniumConfig = self.getConfigSetting("selenium")        
        
        manageSeleniumServer = self.getConfigSetting("selenium/seleniumServerJar", False)
        individualServer = self.getConfigSetting("individualServer", True, appConf)
        if manageSeleniumServer and not individualServer:
            self.log.info("Using one Selenium server instance for all %s simulations." %app)            
            seleniumOptions = self.getConfigSetting("seleniumServerOptions", None, appConf)
            if seleniumOptions:
                seleniumConfig["options"] = seleniumOptions
            seleniumServer = SeleniumServer(seleniumConfig, logger=self.log)
            seleniumServer.start()
      
        if app in self.buildStatus:
            if self.buildStatus[app]["BuildError"]:
                self.sendDummyReport(app, appConf, testReportFile)            
                return
        
        self.log.info("Running simulations for %s" %app)
        for browser in appConf["browsers"]:
            if manageSeleniumServer and individualServer:
                seleniumServer = SeleniumServer(seleniumConfig, logger=self.log)
                seleniumServer.start()
            simConf = self.getSimulationConfig(app, "applications", browser)
            if testLogFile:
                simConf["testLogFile"] = testLogFile
            sim = Simulation(simConf, logger=self.log)
            sim.run()
            if manageSeleniumServer and individualServer:
                seleniumServer.stop()
        
        if manageSeleniumServer and not individualServer:
            seleniumServer = SeleniumServer(seleniumConfig, logger=self.log)
            seleniumServer.stop()
        
        if self.getConfigSetting("reporting/mailTo", False):
            self.formatLog(simConf["testLogFile"], testReportFile, None)
            self.sendReport(app, testReportFile, self.getConfigSetting("reporting"))
    
        reportServer = self.getConfigSetting("reporting/reportServer", False)
        if reportServer:
            reportConf = {
              "runType" : self.getConfigSetting("testRun/runType", ""),
              "autName" : app,
              "autHost" : self.getConfigSetting("testRun/host", ""),
              "autQxPath" : self.getConfigSetting("testRun/qxPath", ""),
              "autPath" : appConf["path"],
              "startDate" : self.startDate,
              "testHostName" : self.getConfigSetting("base/testHostName", ""),
              "testHostId" : self.getConfigSetting("base/testHostId", ""),
            }
            try:
              self.reportResults(reportServer, simConf["testLogFile"], reportConf, simConf["ignoreLogEntries"])
            except Exception, e:
              self.log.error("Error sending report: " + str(e))
    

    def getSimulationConfig(self, autName, configKey, browserConf):
        self.log.info("Getting configuration for %s on %s" %(autName,browserConf["browserId"]))
        #currentAppConf = self.configuration["testRun"][configKey][autName]
        currentAppConf = self.getConfigSetting("testRun/%s/%s" %(configKey,autName))
        simConf = {
          "javaBin" : self.getConfigSetting("base/javaBin", "java"),
          "classPathSeparator" : self.getConfigSetting("base/classPathSeparator", ";"),                 
          "rhinoJar" : self.getConfigSetting("selenium/rhinoJar", None),
          "simulatorSvn" : self.getConfigSetting("testRun/simulatorDirectory", None),
          "autName" : autName,
          "autHost" : self.getConfigSetting("testRun/host", "http://localhost"),
          "browserId" : browserConf["browserId"],
          "browserLauncher" : self.configuration["browsers"][browserConf["browserId"]],
          "processLog" : self.getConfigSetting("processLog", None, currentAppConf)
        }
         
        seleniumDir = self.getConfigSetting("selenium/seleniumDir", "")        
        seleniumClientDriverJar = self.getConfigSetting("selenium/seleniumClientDriverJar", "")

        seleniumVersion = self.getConfigSetting("seleniumVersion", None, browserConf)
        if not seleniumVersion:
            seleniumVersion = self.getConfigSetting("seleniumVersion", None, currentAppConf)
        if not seleniumVersion:
            seleniumVersion = self.getConfigSetting("testRun/seleniumVersion", "current")
        
        simConf["seleniumClientDriverJar"] = seleniumDir + "/" + seleniumVersion + "/" + seleniumClientDriverJar
        
        autPath = self.getConfigSetting("path", "", currentAppConf)
        autQxPath = self.getConfigSetting("testRun/qxPath", "") 
        simConf["autPath"] = autQxPath + autPath
        
        simulationOptions = self.getConfigSetting("simulationOptions", None, browserConf)
        if not simulationOptions:
            simulationOptions = self.getConfigSetting("simulationOptions", None, currentAppConf)
        if not simulationOptions:
            simulationOptions = self.getConfigSetting("testRun/simulationOptions", [])
        simulationOptions.append("branch=%s" %self.getConfigSetting("testRun/branch", "unknown branch"))
        simConf["simulationOptions"] = simulationOptions
        
        simulationScript = self.getConfigSetting("simulationScript", None, browserConf)
        if not simulationScript:
            simulationScript = self.getConfigSetting("simulationScript", None, currentAppConf)
        if not simulationScript:
            simulationScript = self.getConfigSetting("testRun/simulationScript", None)
        simConf["simulationScript"] = simulationScript
        
        ignoreLogEntries = self.getConfigSetting("ignoreLogEntries", None, browserConf)
        if not ignoreLogEntries:
            ignoreLogEntries = self.getConfigSetting("ignoreLogEntries", None, currentAppConf)
        if not ignoreLogEntries:
            ignoreLogEntries = self.getConfigSetting("testRun/ignoreLogEntries", None)
        simConf["ignoreLogEntries"] = ignoreLogEntries
        
        return simConf

    
    def sendDummyReport(self, app, appConf, testReportFile):
        self.log.debug("%s built with errors" %app)
        browserList = []
        for browser in appConf["browsers"]:
            browserList.append(browser["browserId"])
        startDate = util.getTimestamp()
        dummyLogFile = self.getDummyLog(self.getConfigSetting("base/logDirectory", None), app, browserList, self.buildStatus[app]["BuildError"])
        
        #TODO: ignore
        ignore = None
        if self.getConfigSetting("reporting/mailTo", False):
            logFormatted = self.formatLog(dummyLogFile, testReportFile, ignore)
            if logFormatted:
                self.sendReport(app, testReportFile, self.configuration["reporting"])
            else:
                self.log.warn("No report HTML to send.")
    
        reportServer = self.getConfigSetting("reporting/reportServer", False)
        if reportServer:
            reportConf = {
              "runType" : self.getConfigSetting("testRun/runType", ""),
              "autName" : app,
              "autHost" : self.getConfigSetting("testRun/host"),
              "autQxPath" : self.getConfigSetting("testRun/qxPath", ""),
              "autPath" : appConf["path"],
              "startDate" : startDate,
              "testHostName" : self.getConfigSetting("base/testHostName", ""),
              "testHostId" : self.getConfigSetting("base/testHostId", ""),
            }
            try:
              self.reportResults(reportServer, dummyLogFile, reportConf)
            except Exception, e:
              self.log.error("Error sending dummy report: " + str(e))
        

    def prepareTestLog(self, logDir=os.getcwd(), appName="Unknown"):
        logPath = os.path.join(logDir, appName)
        if not os.path.isdir(logPath):
            os.mkdir(logPath)

        return os.path.join(logPath, self.startDate + ".log")
    

    def prepareTestReport(self, reportDir=os.getcwd(), appName="Unknown"):
        reportPath = os.path.join(reportDir, appName)
        if not os.path.isdir(reportPath):
            os.mkdir(reportPath)
        
        return os.path.join( reportPath, self.startDate + '.html')
          
    
    def getDummyLog(self, testLogDir, autName, browserList, buildError):
        self.log.info("Generating dummy log file for %s" %autName)
        dummyLogFile = os.path.join(testLogDir, autName, "DUMMY_%s.log" %(autName + self.startDate))        
        dummyLog = codecs.open(dummyLogFile, "w", "utf-8")
    
        for browser in browserList:
            prefix = "qxSimulator_%s: " %str(random.randint(100000, 999999))
            dummyLog.write(prefix + "<h1>%s results from %s</h1>\n" %(autName, self.startDate))
            platform = util.getOperatingSystemName()
            if platform == "Windows":
                platform = "Win32"
            dummyLog.write(prefix + "<p>Platform: %s</p>\n" %platform)
            dummyLog.write(prefix + "<p>User agent: %s</p>\n" %browser)
            dummyLog.write(prefix + "<div class=\"qxappender\"><div class=\"level-error\">BUILD ERROR: %s</div></div>\n" %buildError)
        dummyLog.close()
        self.log.info("Created dummy log file %s" %dummyLogFile)
        return dummyLogFile
    
    
    def formatLog(self, inputfile=None, reportfile=None, ignore=None):
        class FormatterOpts:
            def __init__(self,logfile,htmlfile,ignore=None):
                self.logfile = logfile
                self.htmlfile = htmlfile
                self.ignore = ignore
    
        if not inputfile:
            raise RuntimeError, "No input file specified!"
        
        if not os.path.isfile(inputfile):
            raise RuntimeError, "%s is not a file!" %inputfile
        
        if os.path.getsize(inputfile) == "0L":
            self.log.warn("log file is empty!")
    
        options = FormatterOpts(inputfile, reportfile, ignore)
    
        if (self.simulate):
            self.log.info("SIMULATION: Formatting log file %s" %inputfile)
        else:
            self.log.info("Formatting log file %s" %inputfile)  
            logformat = QxLogFormat(options)
            logformat.writeHtmlReport()

    
    def sendReport(self, autName, file, mailConf):
        self.log.info("Preparing to send %s report: %s" %(autName, file))
        if ( not(os.path.exists(file)) ):
            self.log.error("Report file %s not found!" %file)
            return
      
        mailConf["subject"] = "[qooxdoo-test] " + autName
      
        reportFile = open(file, 'rb')
        mailConf['html'] = reportFile.read()
        reportFile.seek(0)    
      
        osRe = re.compile('<p>Platform: (.*)</p>')
        failedTestsRe = re.compile('<p class="failedtests">([\d]*)')
        totalErrorsRe = re.compile('<p class="totalerrors">Total errors in report: ([\d]*)</p>')
      
        osystem = ""
        failed = False
        totalE = ""
        for line in reportFile:
            osys = osRe.search(line)
            if (osys):
                osystem = osys.group(1)
                # Some browsers return "Linux i686" as the platform 
                if "Linux" in osystem:
                    osystem = "Linux"
                else:
                    if "Win" in osystem:
                        osystem = "Win32"
        
            failedTests = failedTestsRe.search(line)
            if (failedTests):
                failed = failedTests.group(1)
        
            totalErrors = totalErrorsRe.search(line)
            if (totalErrors):
                totalE = totalErrors.group(1)
      
        mailConf['subject'] += " " + osystem
        
        if ('hostId' in mailConf):
            mailConf['subject'] += " " + mailConf['hostId']
        
        if autName in self.buildStatus:
            branch = "unknown"
            if "branch" in self.buildStatus[autName]:
                branch = self.buildStatus[autName]["branch"]
          
            if "SVNRevision" in self.buildStatus[autName]:
                revision = self.buildStatus[autName]["SVNRevision"]
                mailConf['subject'] += " (%s r%s)" %(branch,revision)

            if (self.buildStatus[autName]["BuildError"]):
                self.mailConf['subject'] += " BUILD ERROR"
        
        if (failed):
            mailConf['subject'] += ": %s test run(s) failed!" %failed
        else:
            mailConf['subject'] += ": %s issues" %totalE    
    
        # Send mail
        if (self.simulate):
            self.log.info("SIMULATION: Sending report email: Subject: %s Recipient: %s" %(mailConf['subject'], mailConf['mailTo']))    
        if (osystem !=""):
            try:
                self.log.info("Sending report email: Subject: %s Recipient: %s" %(mailConf['subject'], mailConf['mailTo']))
                util.sendMultipartMail(mailConf)
            except Exception, e:
                self.log.error("Failed to send report email: " + str(e))
            else:
                self.log.info("Report email sent successfully")
    
        else:
            self.log.error("Report file seems incomplete, report not sent.")

            
    def reportResults(self, reportServerUrl, logFile, config, ignore=None):        
        if (self.simulate):
            self.log.info("SIMULATION: Getting report data for %s" %config["autName"])
            return
        else:
            self.log.info("Getting report data for %s" %config["autName"])
        
        testRunDict = self.getTestRunDict(config)
        slp = SimulationLogParser(logFile, ignore)
        simulationData = slp.getSimulationData()
        testRunDict["simulations"] = simulationData
        
        try:
            if simulationData[0]["platform"] != "Unknown":
                testRunDict["test_hostos"] = simulationData[0]["platform"]
        except Exception:
            pass
        
        self.log.info("Report data aggregated, sending request")
        try:
            response = reporting.sendResultToReportServer(reportServerUrl, testRunDict, "testRun")
            self.log.info("Report server response: %s" %response)
        except Exception, e:
            self.log.error("Error sending test report to server: " + str(e))
    

    def getTestRunDict(self, config):
        autName = config["autName"]
        if "Source" in config["autName"]:
            autName = config["autName"][0:config["autName"].find("Source")]
        
        testRunDict = {
          "test_type" : config["runType"],
          "revision" : "",
          "aut_name" : autName,
          "aut_host" : config["autHost"], 
          "aut_qxpath" : "",
          "aut_path" : config["autPath"],
          "test_host" : config["testHostName"],
          "test_hostos" : util.getOperatingSystemName(),
          "test_hostid" : "",
          "start_date" : config["startDate"],
          "end_date" : util.getTimestamp(),
          "simulations": [],
          "dev_run" : False
        }
        
        if config["autName"] in self.buildStatus:
            if "SVNRevision" in self.buildStatus[config["autName"]]:
                revision = self.buildStatus[config["autName"]]["SVNRevision"]
                testRunDict["revision"] = revision
        
        if "autQxPath" in config:
          testRunDict["aut_qxpath"] = config["autQxPath"]
        
        if "testHostId" in config:
          testRunDict["test_hostid"] = config["testHostId"]
        
        if "devRun" in config:
          testRunDict["dev_run"] = config["devRun"]
          
        return testRunDict

    
    def runLint(self, config):
        class LintOptions:
            def __init__(self, workdir = None):
                self.workdir = workdir
            
        for target in config["targets"]:
            options = LintOptions(target["path"])
            if "ignoreClasses" in target:
                setattr(options, "ignoreclasses", target["ignoreClasses"])
            elif "ignoreClasses" in config:
                setattr(options, "ignoreclasses", config["ignoreClasses"])
            if "ignoreMessages" in target:
                setattr(options, "ignoremessages", target["ignoreMessages"])
            elif "ignoreMessages" in config:
                setattr(options, "ignoremessages", config["ignoreMessages"])
            
            lint = Lint(options, self.log)
            
            reportServer = self.getConfigSetting("reporting/reportServer", False)
            if reportServer:
                lintResult = lint.getFlatResult()
                lintResult = self.getEnhancedLintResult(lintResult, target)
                self.log.info("Sending Lint results to report server")
                response = reporting.sendResultToReportServer(reportServer, lintResult, "lintRun")
                self.log.info("Report Server response: %s" %response)


    def getEnhancedLintResult(self, lintResult, target):
        for message in lintResult:
            message["target"] = target["name"]
            message["branch"] = "unknown"
            message["revision"] = "unknown"
            if target["name"] in self.buildStatus:
                if "branch" in self.buildStatus[target["name"]]:
                    message["branch"] = self.buildStatus[target["name"]]["branch"]
                if "revision" in self.buildStatus[target["name"]]:
                    message["revision"] = self.buildStatus[target["name"]]["revision"]
            elif "Testrunner" in self.buildStatus:
                if "branch" in self.buildStatus["Testrunner"]:
                    message["branch"] = self.buildStatus["Testrunner"]["branch"]
                if "revision" in self.buildStatus["Testrunner"]:
                    message["revision"] = self.buildStatus["Testrunner"]["revision"]
        return lintResult  


class Simulation:
    def __init__(self, config, simulate=False, logger=None):
        self.configuration = config
        self.simulate  = simulate
        
        if not logger:
            self.log = Logger()
        else:            
            self.log = logger
        
        self.startCmd = self.getStartCmd()


    def getStartCmd(self):
        conf = self.configuration
        cmd = conf["javaBin"]
        if "rhinoJar" in conf:
            cmd += " -cp %s%s%s" %(conf["seleniumClientDriverJar"], conf["classPathSeparator"], conf["rhinoJar"])
        
        if "rhinoMainClass" in conf:
            cmd += " %s" %conf["rhinoMainClass"]
        else:
            cmd += " org.mozilla.javascript.tools.shell.Main"
        
        cmd += " %s" %conf["simulationScript"]
        cmd += " autHost=%s" %conf["autHost"]
        cmd += " autPath="
        
        # Encode any URL parameters
        autPathList = conf['autPath'].split("?")
        if len(autPathList) == 1:
            cmd += autPathList[0]
        else:
            cmd += autPathList[0] + "%3F" + urllib.quote(autPathList[1])
        
        cmd += " simulatorSvn=%s" %conf['simulatorSvn']
        
        if (util.getOperatingSystemName() == "Windows"):
            cmd += " testBrowser=%s" %conf["browserLauncher"]
        else:
            cmd += " testBrowser='%s'" %conf["browserLauncher"]

        cmd += " browserId=\"%s\"" %conf["browserId"]

        if conf["simulationOptions"]:
          for opt in conf["simulationOptions"]:
            cmd += ' "%s"' %opt
        
        if "testLogFile" in conf:
            cmd += " logFile=%s" %conf["testLogFile"]
            
        return cmd
      
      
    def run(self):
        conf = self.configuration
        infoMsg = "Testing %s in %s" %(conf['autName'], conf["browserId"])
        debugMsg = "Selenium command line: %s" %self.startCmd
        
        if (self.simulate):
            self.log.info("SIMULATION: %s" %infoMsg)
            self.log.debug(debugMsg)
        else:
            self.log.info(infoMsg)
            self.log.debug(debugMsg)
            
            #TODO: out.split("\n")
            if self.configuration["processLog"]:
                util.invokeLog(self.startCmd, self.log, True)
            
            else:
                util.invokeExternal(self.startCmd)


if __name__ == "__main__":
    try:
        rc = 0
        if not len(sys.argv) > 1:
            print "Usage: testing.py testconfig.json"
            sys.exit(rc)
        import demjson
        configFile = codecs.open(sys.argv[1], "r", "UTF-8")
        config = configFile.read()
        config = demjson.decode(config, allow_comments=True)
        testRun = TestRun(config)
        testRun.runPackage()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc = 1
    sys.exit(rc)