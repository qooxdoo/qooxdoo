#!/usr/bin/env python
# -*- coding: utf-8 -*-

################################################################################
#
#    qooxdoo - the new era of web development
#
#    http://qooxdoo.org
#
#    Copyright:
#        2007-2012 1&1 Internet AG, Germany, http://www.1und1.de
#
#    License:
#        LGPL: http://www.gnu.org/licenses/lgpl.html
#        EPL: http://www.eclipse.org/org/documents/epl-v10.php
#        See the LICENSE file in the project's top-level directory for details.
#
#    Authors:
#        * Daniel Wagner (danielwagner)
#
################################################################################

import sys
import os
import time
import codecs
import unicodedata
import  re
sys.path.append(os.path.join('..', '..', 'bin'))


##
# <p>This class holds the test configuration and provides methods that set up
# and control the actual Selenium test runs. It can be used for tests against
# a local qooxdoo trunk checkout as well as tests against qooxdoo applications
# located on a remote server.</p>
#
# @param testType {str} "local" or "remote"
# @param seleniumConf {dict} Selenium RC server configuration details
# @param testConf {dict} Basic test settings
# @param autConf {dict} Information about the applications to be tested
# @param browserConf {dict} Information about the browsers to be used for
#     testing
# @param mailConf {dict} Report email configuration
class QxTest:
    def __init__(self, testType="remote", seleniumConf=None, testConf=None,
                             autConf=None, browserConf=None, mailConf=None):

        defaultSeleniumConf = {
            'seleniumDir': '../../selenium',
            'seleniumVersion': 'current',
            'seleniumJar': 'selenium-server.jar',
            'seleniumHost': 'http://localhost:4444',
            'ieSingleWindow': True,
            'trustAllSSLCertificates': False,
            'options': "",
            'serverStartTimeout': 3,
            'serverStartMaxAttempts': 20
        }

        defaultTestConf = {
            'testId' : '',
            'runType': '',
            'qxBranch': 'trunk',
            'simulateTest': False,
            'getReportFrom': 'testLog',
            'testLogDir': '../../logs',
            'testReportDir': '../../reports',
            'seleniumClientDriverJar': 'selenium-java-client-driver.jar',
            'rhinoJar': '../../rhino/current/js.jar',
            'javaBin': 'java',
            'classPathSeparator': ';',
            'proxyEnable': 'wscript ../../tool/proxyEnable.vbs',
            'proxyDisable': 'wscript ../../tool/proxyDisable.vbs',
            'compatEnable': 'wscript ../../tool/compatEnable.vbs',
            'compatDisable': 'wscript ../../tool/compatDisable.vbs',
            'killSelenium': 'wscript ../../tool/killselenium.vbs',
            'remoteLogDir': None
        }

        self.testType = testType
        self.seleniumConf = self.getConfig(defaultSeleniumConf, seleniumConf)
        self.testConf = self.getConfig(defaultTestConf, testConf)
        self.mailConf = mailConf
        self.autConf = autConf
        self.browserConf = browserConf

        self.timeFormat = '%Y-%m-%d_%H-%M-%S'
        self.startTimeString = time.strftime(self.timeFormat)

        self.logFile = self.getLogFile(self.testConf["testLogDir"])
        self.logFile.write("################################################################################\n")
        self.log("Starting " + self.testType + " test session.")

        self.qxRevision = self.getRevision()
        self.scm = None
        self.buildStatus = self.getBuildStatus()

        self.sim = False
        if ('simulateTest' in self.testConf):
            self.sim = testConf['simulateTest']

        self.os = self.getOperatingSystem()
        if self.os == "Darwin":
            self.os = "Mac OS X"

        import socket
        socket.setdefaulttimeout(10)

    ##
    # Opens a new log file and returns the file object. Attempts to create the log
    # directory if it doesn't already exist.
    #
    # @param logDirectory {str} The directory to create the log file in
    def getLogFile(self, logDirectory):
        try:
            if not os.path.isdir(logDirectory):
                os.makedirs(logDirectory)
            filename = "testLog_" + self.startTimeString + ".txt"
            fullpath = os.path.join(logDirectory, filename)
            logFile = codecs.open(fullpath, 'a', 'utf-8')
            return logFile
        except Exception, e:
            errMsg = ""
            if (e.args):
                errMsg = repr(e.args)
            print("ERROR: Unable to open log file, quitting " + errMsg)
            sys.exit(1)

    ##
    # Adds options from the default configuration dictionary to the custom
    # configuration dictionary if they're not already defined.
    #
    # @param default {dict} The default configuration
    # @param custom {dict} The custom configuration
    def getConfig(self, default, custom):
        for option in default:
            if not option in custom:
                custom[option] = default[option]
        return custom

    ##
    # Writes a message to the test log file
    #
    # @param msg {str} The message to be logged
    def log(self, msg):
        if type(msg).__name__ == "unicode":
            msg = unicodedata.normalize('NFKD', msg).encode('ascii', 'ignore')
        timeFormatLog = '%Y-%m-%d %H:%M:%S'
        logTime = time.strftime(timeFormatLog)
        logMsg = logTime + " " + msg
        print(logMsg)
        if (self.logFile):
            try:
                self.logFile.write(logMsg + "\n")
            except UnicodeDecodeError, e:
                self.logFile.write("%s %s\n" % (logTime, repr(e)))

    ##
    # Attempts to determine the name of the operating system by using os.uname(),
    # falling back to platform.system()
    def getOperatingSystem(self):
        oSys = "Unknown"
        msg = "ERROR: Couldn't determine operating system!"

        try:
            oSys = os.uname()[0]
        except AttributeError:
            try:
                import platform
                oSys = platform.system()
                self.log("Operating system: " + oSys)
            except Exception, e:
                self.logError(e, msg)
        except Exception, e:
            self.logError(e, msg)

        return oSys

    ##
    # Starts the Selenium RC server and checks its status. If the server doesn't
    # respond correctly after 20 seconds, another attempt is made. If this also
    # fails the script is ended.
    #
    # @param version {string} name of a subdirectory of seleniumConf["seleniumDir"]
    # @param options {string} command line options, e.g. -singleWindow -trustAllSSLCertificates
    def startSeleniumServer(self, version=None, jar=None, options=""):
        seleniumVersion = version or self.seleniumConf["seleniumVersion"]
        seleniumJar = jar or self.seleniumConf["seleniumJar"]
        cmd = self.testConf["javaBin"]
        cmd += " -jar " + self.seleniumConf["seleniumDir"] + "/"
        cmd += seleniumVersion + "/"
        cmd += seleniumJar

        if (self.sim):
            if "-singleWindow" in options:
                self.log("SIMULATION: Starting Selenium RC server in single window mode.")
            else:
                self.log("SIMULATION: Starting Selenium RC server in default mode.")
            return

        import subprocess
        import time
        if (self.isSeleniumServer()):
            self.log("Selenium server already running.")
            self.killSeleniumServer()

        if 'seleniumLog' in self.seleniumConf:
            cmd += " -browserSideLog -log " + self.seleniumConf['seleniumLog']

        cmd += options

        self.log("Starting Selenium server: %s" % cmd)

        subprocess.Popen(cmd, shell=True)

        # check if it's up and running
        attempts = self.seleniumConf["serverStartMaxAttempts"]
        while attempts > 0:
            attempts -= 1
            time.sleep(self.seleniumConf["serverStartTimeout"])
            if self.isSeleniumServer():
                break
            self.log("Selenium server not responding, waiting for %s seconds (%s attempts left)" % (self.seleniumConf["serverStartTimeout"], attempts))

        if (not(self.isSeleniumServer())):
            self.log("ERROR: Selenium server not responding.")
            sys.exit(1)

    ##
    # Terminates the Selenium server process using a VBScript (Windows) or the
    # pkill shell command (Linux/OS X)
    def killSeleniumServer(self):
        if (self.sim):
            self.log("SIMULATION: Killing Selenium server process")
            return
        else:
            self.log("Killing Selenium server process")

        if self.os == "Linux":
            invokeExternal("pkill -9 -f selenium")
            return
        if self.os == "Mac OS X":
            invokeExternal("pkill selenium")
        else:
            invokeExternal(self.testConf['killSelenium'])

    ##
    # Sends a shutdown command to the Selenium server
    #
    # @return Whether the server was shut down (Bool)
    def shutdownSeleniumServer(self):
        from urllib2 import Request, urlopen, URLError
        self.log("Shutting down Selenium server")

        req = Request(self.seleniumConf['seleniumHost'] + "/selenium-server/driver/?cmd=shutDownSeleniumServer")
        try:
            response = urlopen(req)
            content = response.read()
            if "OK" in content:
                self.log("Selenium server acknowledged shutdown request.")
                return True
        except URLError, e:
            self.log("Selenium server shutdown failed: " + repr(e))
            if hasattr(e, 'code'):
                self.log("Shutdown request status code: " + repr(e.code))
        except Exception, e:
            self.logError(e, "Shutting down Selenium server")

        return False

    ##
    # Checks the status of the Selenium RC server by sending an HTTP request.
    #
    # @return Whether the server is running (Bool)
    def isSeleniumServer(self):
        from urllib2 import Request, urlopen, URLError
        status = False
        #self.log("Checking Selenium server")
        req = Request(self.seleniumConf['seleniumHost'])
        try:
            urlopen(req)
            # Selenium should always refuse this request, so we should never get here
        except URLError, e:
            if hasattr(e, 'code'):
                if (e.code == 403):
                    status = True
        except Exception, e:
            self.logError(e, "Checking if Selenium server is active")

        return status

    ##
    # Opens a new build log file and returns the file object. Attempts to create
    # the log directory if it doesn't already exist.
    #
    # @param buildLogDir {str} The directory to create the log file in
    def getBuildLogFile(self, buildLogDir, target):
        try:
            if not os.path.isdir(os.path.join(buildLogDir, target)):
                os.makedirs(os.path.join(buildLogDir, target))
        except Exception, e:
            self.logError(e, "Creating build log directory")
            return False

        buildLog = os.path.join(buildLogDir, target, self.startTimeString + '.log')
        self.log("Opening build log file " + buildLog)
        try:
            buildLogFile = codecs.open(buildLog, 'a', 'utf-8')
        except Exception, e:
            self.logError(e, "Opening build log file")

        return buildLogFile

    ##
    # Writes build Errors to the log file
    def logBuildErrors(self, buildLogFile, target, cmd, err):
        self.log("Error while building " + target + ", see build log file for details.")
        err = err.rstrip('\n')
        err = err.rstrip('\r')
        buildLogFile.write(target + "\n" + cmd + "\n" + err)
        buildLogFile.write("\n========================================================\n\n")

    ##
    # Starts the SVN update/build process for one or more targets. Logs errors
    # during build and writes the current trunk revision number and build status
    # to files.
    #
    # @param buildConf {dict} Build configuration
    # @param buildOrder {list} List of buildConf keys to determine the order in
    # which the targets are processed. Default: Alphabetical order
    def buildAll(self, buildConf={}, buildOrder=None):
        defaultBuildConf = {
            'buildLogLevel': 'error',
            'buildLogDir': '../../logs/build',
            'batbuild': 'tool/admin/app/batserver/batbuild.py'
        }

        buildConf = self.getConfig(defaultBuildConf, buildConf)

        buildResults = {}
        if "targets" in buildConf:
            if buildOrder:
                targets = buildOrder
            else:
                targets = sorted(buildConf['targets'].iterkeys())
            for target in targets:
                buildResult = self.buildTarget(target, buildConf)
                if buildResult:
                    buildResults[target] = buildResult
        if "shellJobs" in buildConf:
            for shellJob in sorted(buildConf['shellJobs'].iterkeys()):
                config = buildConf['shellJobs'][shellJob]
                if "directory" in config:
                    shellResult = self.runShellCommands(config["commands"], config["directory"])
                else:
                    shellResult = self.runShellCommands(config["commands"])
                if shellResult:
                    buildResults[shellJob] = shellResult

        # Store the results of this build run
        self.storeBuildStatus(buildConf["buildLogDir"], buildResults)
        # Update the 'total' build status with the results of this run
        for target in buildResults:
            self.buildStatus[target] = buildResults[target]
        # Store results including the last result of any job that wasn't in this
        # config
        self.storeBuildStatus(buildConf["buildLogDir"])

        self.qxRevision = self.getLocalRevision()
        self.storeRevision(buildConf["buildLogDir"])

    def buildTarget(self, target, buildConf):
        buildResult = {
            "BuildError": None,
            "BuildWarning": None,
            "BuildStarted": time.strftime(self.timeFormat),
            "BuildFinished": False,
            "BuildJob": None
        }

        # Assemble batbuild command line
        if (os.path.isabs(buildConf['batbuild'])):
            cmd = buildConf['batbuild']
        else:
            cmd = os.path.join(self.testConf['qxPathAbs'], buildConf['batbuild'])
        cmd += " -w " + buildConf['stageDir']
        #if target[0] == target[0].capitalize():
        cmd += " " + buildConf['targets'][target]
        self.log("Building " + target + "\n    " + cmd)
        reg = re.compile("-g\ (.*?)\ -")
        match = reg.search(cmd)
        if match:
            job = match.group(1)
        else:
            job = cmd
        buildResult["BuildJob"] = job

        if (self.sim):
            status = 0
            self.log("SIMULATION: Invoking build command:\n    " + cmd)
            return buildResult

        status, std, err = invokePiped(cmd)
        if status > 0:
            if ('buildLogDir' in buildConf):
                buildLogFile = self.getBuildLogFile(buildConf["buildLogDir"], target)
                self.logBuildErrors(buildLogFile, target, cmd, err)
                buildLogFile.close()

            if err:
                buildResult["BuildError"] = err
            else:
                buildResult["BuildError"] = "Unknown build error"

        elif err != "":
            self.log("Warning while building " + target + ", see build log file for details.")
            err = err.rstrip('\n')
            err = err.rstrip('\r')
            if ('buildLogDir' in buildConf):
                buildLogFile = self.getBuildLogFile(buildConf["buildLogDir"], target)
                buildLogFile.write(target + "\n" + cmd + "\n" + err)
                buildLogFile.write("\n========================================================\n\n")
                buildLogFile.close()
            buildResult["BuildFinished"] = time.strftime(self.timeFormat)
            buildResult["BuildWarning"] = err
        else:
            self.log(target + " build finished without errors.")
            buildResult["BuildFinished"] = time.strftime(self.timeFormat)

        revision = self.getLocalRevision()
        buildResult[self.scm + "Revision"] = revision.rstrip()

        return buildResult

    ##
    # Generates one or more application skeletons. Logs any
    # errors encountered during the build and stores the build status.
    #
    # @param buildConf {dict} Build configuration. Must have a key "targets"
    # containing an array of qooxdoo application types, e.g. "bom", "gui", "inline"
    def buildSkeletonApps(self, buildConf):
        self.log("Building skeleton applications")

        if not os.path.isdir(buildConf["buildLogDir"]):
            self.log("Creating build log directory %s" % buildConf["buildLogDir"])
            os.makedirs(buildConf["buildLogDir"])

        for target in sorted(buildConf["targets"]):
            self.buildStatus[target] = {
                "BuildError": None,
                "BuildWarning": None,
                "BuildStarted": time.strftime(self.timeFormat),
                "BuildFinished": False,
                "BuildJob": None
            }
            # generate the skeleton
            buildLogFile = self.getBuildLogFile(buildConf["buildLogDir"], target)
            cmd = buildConf["createApplication"] + " --type " + target
            cmd += " --name " + target + "application"
            #cmd += " --logfile " + buildLogFile.name
            cmd += " --out " + buildConf["stageDir"]
            self.log("Building %s skeleton." % target)
            status, std, err = invokePiped(cmd)
            if status > 0:
                self.logBuildErrors(buildLogFile, target, cmd, err)
                self.buildStatus[target]["BuildError"] = err.rstrip('\n')
            else:
                if err:
                    self.buildStatus[target]["BuildWarning"] = err
                # generate the application
                self.log("Generating %s application." % target)

                buildcmd = sys.executable + " "
                if target == "contribution":
                    buildcmd += os.path.join(buildConf["stageDir"], target + "application", "trunk", "demo", "default", "generate.py")
                else:
                    buildcmd += os.path.join(buildConf["stageDir"], target + "application", "generate.py")

                jobs = ",".join(buildConf["targets"][target])
                self.buildStatus[target]["BuildJob"] = jobs
                buildcmd += " " + jobs
                status, std, err = invokePiped(buildcmd)

                if status > 0:
                    self.logBuildErrors(buildLogFile, target, buildcmd, err)
                    self.buildStatus[target]["BuildError"] = err.rstrip('\n')
                elif err != "":
                    err = err.rstrip('\n')
                    err = err.rstrip('\r')
                    if not self.buildStatus[target]["BuildWarning"]:
                        self.buildStatus[target]["BuildWarning"] = ""
                    self.buildStatus[target]["BuildWarning"] += err.rstrip('\n')
                    self.buildStatus[target]["BuildFinished"] = time.strftime(self.timeFormat)
                else:
                    self.buildStatus[target]["BuildFinished"] = time.strftime(self.timeFormat)

        revision = self.getLocalRevision()
        self.storeRevision(buildConf["buildLogDir"])
        self.buildStatus[target][self.scm + "Revision"] = revision.rstrip()

        self.storeBuildStatus(buildConf["buildLogDir"])

    def runShellCommands(self, commands, workdir=os.getcwd()):
        result = {
            "BuildError": None,
            "BuildFinished": False,
            "BuildJob": ";".join(commands),
            "BuildStarted": time.strftime(self.timeFormat),
            "BuildWarning": None
        }

        if not os.path.isdir(workdir):
            result["BuildError"] = "'%s' is not a directory!" % workdir
            return result

        startdir = os.getcwd()
        if workdir != startdir:
            os.chdir(workdir)
        for cmd in commands:
            self.log("Running shell command " + cmd)
            ret, out, err = invokePiped(cmd)
            err = err.rstrip("\n")
            err = err.rstrip("\r")
            if ret == 0:
                if err != "":
                    if not result["BuildWarning"]:
                        result["BuildWarning"] = ""
                    result["BuildWarning"] += err + " "
            else:
                if not result["BuildError"]:
                        result["BuildError"] = ""
                result["BuildError"] += err + " "

        if not result["BuildError"]:
            result["BuildFinished"] = time.strftime(self.timeFormat)

        revision = self.getLocalRevision()
        result[self.scm + "Revision"] = revision.rstrip()

        os.chdir(startdir)

        return result

    ##
    # Runs an SVN update on a Simulator contribution checkout
    def updateSimulator(self):
        if (self.sim):
            self.log("SIMULATION: Updating Simulator checkout: "
                                + self.testConf["simulatorSvn"])
        else:
            self.log("Updating Simulator checkout.")
            ret, out, err = invokePiped("svn up " + self.testConf["simulatorSvn"])
            if (out):
                try:
                    self.log(out)
                except Exception, e:
                    print(repr(e))
            if (err):
                self.log(err)

    ##
    # Converts the buildStatus map to JSON and stores it in a file in the root
    # directory of the local qooxdoo checkout where remote test runs can access
    # it.
    def storeBuildStatus(self, logDir=None, buildResult=None):
        try:
            import json
        except ImportError:
            try:
                import simplejson as json
            except ImportError:
                self.log("ERROR: simplejson module not found, unable to store build status!")
                return False

        if not logDir:
            logDir = self.testConf['qxPathAbs']

        if not os.path.isdir(logDir):
            os.makedirs(logDir)

        if buildResult:
            jsonData = json.dumps(buildResult, sort_keys=True, indent=2)
            buildId = self.testConf['testId']
            if buildId != "":
                buildId = "_" + buildId
            fPath = os.path.join(logDir, 'buildStatus_%s%s.json' % (self.startTimeString, buildId))
        else:
            jsonData = json.dumps(self.buildStatus, sort_keys=True, indent=2)
            fPath = os.path.join(logDir, 'buildStatus.json')
        if (self.sim):
            self.log("SIMULATION: Storing build status in file " + fPath)
        else:
            self.log("Storing build status in file " + fPath)
            rFile = codecs.open(fPath, 'w', 'utf-8')
            rFile.write(jsonData)
            rFile.close()

    ##
    # Reads the build status stored by a previous test run from the file system
    # @return Build status dictionary
    def getLocalBuildStatus(self):
        status = {}
        try:
            import json
        except ImportError, e:
            try:
                import simplejson as json
            except ImportError, e:
                self.log("ERROR: simplejson module not found, unable to get build status!")
                return status
        path = os.path.join(self.testConf['qxPathAbs'], 'buildStatus.json')
        if not os.path.isfile(path):
            return status

        statusFile = codecs.open(path, "r")
        try:
            status = json.load(statusFile)
        except Exception, e:
            self.logError(e, "Reading local build status")
        finally:
            return status

    ##
    # Reads the build status from a file on a remote test host
    #
    # @return Build status dictionary
    def getRemoteBuildStatus(self):
        import urllib
        status = {}
        try:
            import json
        except ImportError, e:
            try:
                import simplejson as json
            except ImportError, e:
                self.log("ERROR: simplejson module not found, unable to retrieve remote build status!")
                return status

        if "remoteLogDir" in self.testConf:
            remoteFile = self.testConf["remoteLogDir"]
        else:
            remoteFile = self.autConf['autHost']
            if 'autQxPath' in self.autConf:
                remoteFile += self.autConf['autQxPath']
        remoteFile += '/buildStatus.json'
        self.log("Retrieving remote build status from file " + remoteFile)
        try:
            jsonData = urllib.urlopen(remoteFile)
        except IOError, e:
            self.log("ERROR: Unable to open remote build status file " + remoteFile + ": "
                             + e.message)
            return status
        except Exception, e:
            self.logError(e, "Opening remote build file")
            return status

        # Try to determine the requests's HTTP status (Python >= 2.6 only).
        try:
            reqStat = jsonData.getcode()
            if (reqStat != 200):
                self.log("ERROR: Request to remote build status file returned status " + repr(reqStat))
        except AttributeError:
            pass

        try:
            status = json.load(jsonData)
            self.log("Remote build status retrieved successfully.")
        except ValueError, e:
            self.log("ERROR: Unable to parse buildStatus JSON: " + repr(e))
        except Exception, e:
            self.logError(e, "Parsing remote build file")

        return status

    def getBuildStatus(self):
        if self.testType == "local":
            return self.getLocalBuildStatus()
        elif self.testType == "remote":
            return self.getRemoteBuildStatus()
        else:
            return {}

    def getRevision(self):
        if self.testType == "local":
            return self.getLocalRevision()
        elif self.testType == "remote":
            return self.getRemoteRevision()
        else:
            return False

    def getLocalRevision(self):
        svnDir = os.path.join(self.testConf["qxPathAbs"], ".svn")
        if os.path.isdir(svnDir):
            self.scm = "SVN"
            return self.getLocalSvnRevision()
        gitDir = os.path.join(self.testConf["qxPathAbs"], ".git")
        if os.path.isdir(gitDir):
            self.scm = "Git"
            return self.getLocalGitDescription()

    ##
    # Retrieves a local qooxdoo SVN checkout's revision number
    #
    # @return The revision number (String)
    def getLocalSvnRevision(self):
        ret, out, err = invokePiped("svnversion " + self.testConf["qxPathAbs"])
        if ret > 0:
            self.log("Error determining SVN revision: " + err)
            return False

        rev = out.rstrip('\n')
        self.log("Local qooxdoo SVN checkout at revision " + rev)
        return rev

    def getLocalGitDescription(self):
        desc = git("describe --tags", self.testConf["qxPathAbs"])
        reg = re.compile("\-g(.*?)$")
        match = reg.search(desc)
        if match:
            desc = match.group(1)
        desc = desc.rstrip()
        self.log("Local qooxdoo Git repository description " + desc)
        return desc

    ##
    # Writes the current revision number of the local qooxdoo checkout to a file
    # named 'revision.txt' in the qooxdoo checkout's root directory.
    def storeRevision(self, logDir=None):
        if not self.qxRevision:
            self.log("No revision number to store!")
            return
        if not logDir:
            self.log("No log directory specified!")
            return

        fPath = os.path.join(logDir, 'revision.txt')
        if (self.sim):
            self.log("SIMULATION: Storing revision number " + self.qxRevision
                             + " in file " + fPath)
        else:
            self.log("Storing revision number " + self.qxRevision + " in file " + fPath)
            rFile = codecs.open(fPath, 'w', 'utf-8')
            rFile.write(self.qxRevision)
            rFile.close()

    ##
    # Reads the qooxdoo checkout's revision number from a file on a remote test
    # host
    #
    # @return The revision number (String)
    def getRemoteRevision(self):
        import urllib
        if "remoteLogDir" in self.testConf:
            remoteFile = self.testConf["remoteLogDir"]
            remoteFile += '/revision.txt'
        elif 'autQxPath' in self.autConf:
            remoteFile = self.autConf['autHost']
            remoteFile += self.autConf['autQxPath']
            remoteFile += '/revision.txt'
        if remoteFile:
            try:
                handle = urllib.urlopen(remoteFile)
                if handle.getcode() != 404:
                    rev = handle.read()
                else:
                    self.log("ERROR: Remote revision file " + remoteFile + " not found!")
                    return False
            except IOError, e:
                self.log("ERROR: Unable to open remote revision file " + remoteFile + ": "
                                 + e.message)
                return False
            except Exception, e:
                self.logError(e, "Opening remote revision file")
                return False

            else:
                self.log("Remote qooxdoo checkout at revision " + rev)
                return rev
        return False

    ##
    # Generates a fake test log file so that a report email can be generated even
    # if the test didn't run due to build errors.
    #
    # @param appConf {dict} Settings for the application(s) to be tested
    # @return {file} The file handle of the dummy log
    def getDummyLog(self, appConf):
        import random

        dummyLogFile = os.path.join(self.testConf['testLogDir'], appConf['appName'], "DUMMY_" + appConf['appName'] + self.startTimeString + ".log")
        dummyLog = codecs.open(dummyLogFile, "w", "utf-8")

        for browser in appConf['browsers']:
            prefix = "qxSimulator_" + str(random.randint(100000, 999999)) + ": "
            dummyLog.write(prefix + "<h1>" + appConf['appName'] + " results from " + self.startTimeString + "</h1>\n")
            platform = self.os
            if platform == "Windows":
                platform = "Win32"
            dummyLog.write(prefix + "<p>Platform: " + platform + "</p>\n")
            dummyLog.write(prefix + "<p>User agent: " + browser['browserId'] + "</p>\n")
            dummyLog.write(prefix + "<div class=\"qxappender\"><div class=\"level-error\">BUILD ERROR: " + self.buildStatus[appConf['appName']]["BuildError"] + "</div></div>\n")
        dummyLog.close()

        return dummyLogFile

    def runTestsWrapped(self, appConf):
        try:
            self.runTests(appConf)
        except Exception, e:
            self.log("Error running tests for %s: %s" % (appConf["appName"], repr(e)))

    ##
    # Launches the actual tests (Simulations) for defined applications
    #
    # @param appConf {dict} Settings for the application(s) to be tested
    def runTests(self, appConf):
        import time
        testStartDate = time.strftime(self.timeFormat)

        getReportFrom = self.testConf['getReportFrom']

        if getReportFrom == 'testLog':
            from random import randint
            logPath = os.path.join(self.testConf['testLogDir'], appConf['appName'])
            if not os.path.isdir(logPath):
                os.makedirs(logPath)
            logFileName = "%s_%s.log" % (testStartDate, str(randint(100000, 999999)))
            logFile = os.path.join(logPath, logFileName)
            if not os.path.isabs(logFile):
                logFile = os.path.abspath(logFile)

            lf = codecs.open(logFile, 'w', 'utf-8')
            lf.close()

        reportPath = os.path.join(self.testConf['testReportDir'], appConf['appName'])
        if not os.path.isdir(reportPath):
                os.makedirs(reportPath)
        reportFile = os.path.join(reportPath, testStartDate + '.html')

        if appConf['appName'] in self.buildStatus:
            if self.buildStatus[appConf['appName']]["BuildError"]:
                self.log("ERROR: Skipping " + appConf['appName'] + " test because there "
                                 + "was an error during build:\n    " + self.buildStatus[appConf['appName']]["BuildError"])

                sendReport = True
                if 'sendReport' in appConf:
                    sendReport = appConf['sendReport']

                if sendReport:
                    dummyLogFile = self.getDummyLog(appConf)

                    ignore = None
                    if "ignoreLogEntries" in appConf:
                        ignore = appConf["ignoreLogEntries"]

                    logFormatted = self.formatLog(dummyLogFile, reportFile, ignore)
                    if logFormatted:
                        self.sendReport(appConf['appName'], reportFile)
                    else:
                        self.log("No report HTML to send.")

                if "reportServerUrl" in self.testConf:
                    try:
                        self.reportResults(appConf['appName'], testStartDate, dummyLogFile)
                    except Exception, e:
                        self.logError(e, "Sending test results")

                return

        clearLogs = True
        if 'clearLogs' in appConf:
            clearLogs = appConf['clearLogs']

        if clearLogs:
            self.clearLogs()

        seleniumVersion = self.seleniumConf["seleniumVersion"]
        if 'seleniumVersion' in appConf:
            seleniumVersion = appConf["seleniumVersion"]

        seleniumJar = self.seleniumConf["seleniumJar"]
        if 'seleniumJar' in appConf:
            seleniumJar = appConf["seleniumJar"]

        seleniumOptions = ""
        # Use trustAllSSLCertificates option?
        if self.seleniumConf['trustAllSSLCertificates']:
            seleniumOptions += " -trustAllSSLCertificates"

        # Any additional options
        seleniumOptions += " %s" % self.seleniumConf["options"]

        startServer = True
        if 'startServer' in appConf:
            startServer = appConf['startServer']

        individual = True
        if 'individualServer' in appConf:
            individual = appConf['individualServer']

        if startServer and not individual:
            self.log("individualServer set to False, using one server instance for "
                             + "all tests")

            # Use single window mode if IE is among the browsers to be tested in.
            # This is necessary due to cross-window/tab JavaScript access restrictions.
            for browser in appConf['browsers']:
                browserLauncher = self.browserConf[browser['browserId']]
                if self.seleniumConf['ieSingleWindow'] and ("iexplore" in browserLauncher or "iepreview" in browserLauncher):
                    seleniumOptions += " -singleWindow"
                    break

            self.startSeleniumServer(seleniumVersion, seleniumJar, seleniumOptions)

        for browser in appConf['browsers']:
            if "seleniumVersion" in browser:
                seleniumVersion = browser["seleniumVersion"]

            if "seleniumJar" in browser:
                seleniumJar = browser["seleniumJar"]

            killBrowser = True
            if "kill" in browser:
                killBrowser = browser['kill']

            if startServer and individual:
                browserLauncher = self.browserConf[browser['browserId']]
                if self.seleniumConf['ieSingleWindow'] and ("iexplore" in browserLauncher or "iepreview" in browserLauncher):
                    seleniumOptions += " -singleWindow"

                self.log("individualServer set to True, using one server instance per "
                                 + "test run")
                self.startSeleniumServer(seleniumVersion, seleniumJar, seleniumOptions)

            options = False
            if "options" in browser:
                options = browser["options"]
            else:
                if "options" in appConf:
                    options = appConf["options"]

            simulationScript = False
            if "simulationScript" in browser:
                simulationScript = browser["simulationScript"]
            else:
                if "simulationScript" in appConf:
                    simulationScript = appConf["simulationScript"]

            seleniumVersion = self.seleniumConf["seleniumVersion"]
            if "seleniumVersion" in browser:
                seleniumVersion = browser["seleniumVersion"]
            else:
                if "seleniumVersion" in appConf:
                    seleniumVersion = appConf["seleniumVersion"]

            cmd = self.getStartCmd(appConf['appName'], browser['browserId'], options, simulationScript, seleniumVersion)

            if getReportFrom == 'testLog':
                cmd += " logFile=" + logFile

            try:
                if (browser['setProxy']):
                    self.setProxy(True)
            except KeyError:
                    pass

            try:
                if (browser['setIE8Compatibility']):
                    self.setIE8Compatibility(True)
            except KeyError:
                pass

            if (self.sim):
                self.log("SIMULATION: Starting test:\n    " + cmd)
            else:
                self.log("Testing: " + appConf['appName'] + " on "
                                 + browser['browserId'] + "\n    " + cmd)
                invokeExternal(cmd)

            try:
                if (browser['setProxy']):
                    self.setProxy(False)
            except KeyError:
                    pass

            try:
                if (browser['setIE8Compatibility']):
                    self.setIE8Compatibility(False)
            except KeyError:
                    pass

            try:
                if (killBrowser):
                    self.killBrowser(browser['browserId'])
            except KeyError:
                    pass

            if startServer and individual:
                self.shutdownSeleniumServer()
                time.sleep(5)
                if self.isSeleniumServer():
                    self.killSeleniumServer()

        if startServer and not individual:
            self.shutdownSeleniumServer()
            time.sleep(5)
            if self.isSeleniumServer():
                self.killSeleniumServer()

        sendReport = True
        if 'sendReport' in appConf:
            sendReport = appConf['sendReport']

        ignore = None
        if sendReport:
            if "ignoreLogEntries" in browser:
                ignore = browser["ignoreLogEntries"]
            else:
                if "ignoreLogEntries" in appConf:
                    ignore = appConf["ignoreLogEntries"]

            if (self.sim):
                self.log("SIMULATION: Formatting log and sending report.\n")
            else:
                if getReportFrom == 'testLog':
                    self.formatLog(logFile, reportFile, ignore)
                else:
                    self.formatLog(None, reportFile, ignore)

                self.sendReport(appConf['appName'], reportFile)

        if "reportServerUrl" in self.testConf:
            if (self.sim):
                self.log("SIMULATION: Sending results to report server.\n")
            else:
                self.reportResults(appConf['appName'], testStartDate, logFile, ignore)

    ##
    # Assembles the shell command used to launch the Simulation
    #
    # @param aut {str} The name of the application to be tested. Must correspond
    #     to the name of a subdirectory of "/trunk/tool/selenium/simulation/" in the
    #     local Simulator contrib checkout
    # @param browser {str} A browser identifier (one of the keys in browserConf)
    # @param options {arr} An array of options to be passed to the test script,
    # e.g. ["ignore=qx.test.ui","foo=bar"]
    # @param simulationScript {str} Optional: Path to the Simulation script to be used.
    # By default, the script found in the Simulator contrib checkout under
    # /trunk/tool/selenium/simulation/[APPNAME]/test_[APPNAME].js is used
    # @param seleniumVersion {str} Optional: Selenium Client Driver version to be used.
    # @return {str} The shell command
    def getStartCmd(self, aut, browser, options, simulationScript=None, seleniumVersion=None):
        path = self.seleniumConf["seleniumDir"] + "/" + seleniumVersion
        cmd = self.testConf["javaBin"]

        if ('seleniumClientDriverJar' in self.testConf or 'rhinoJar' in self.testConf):
            cmd += " -cp "
            if ('seleniumClientDriverJar' in self.testConf):
                cmd += path + "/" + self.testConf['seleniumClientDriverJar']
            if ('seleniumClientDriverJar' in self.testConf and 'rhinoJar' in self.testConf):
                if ('classPathSeparator' in self.testConf):
                    cmd += self.testConf['classPathSeparator']
                else:
                    cmd += ";"
            if ('rhinoJar' in self.testConf):
                cmd += self.testConf['rhinoJar']

        cmd += " org.mozilla.javascript.tools.shell.Main"

        script = ""
        if simulationScript:
            script = simulationScript
        else:
            script = self.testConf['simulatorSvn'] + "/trunk/tool/selenium/simulation/" + aut.lower() + "/test_" + aut.lower() + ".js"

        cmd += " " + script

        cmd += " autHost=" + self.autConf['autHost']
        cmd += " autPath="

        if 'autQxPath' in self.autConf:
            cmd += self.autConf['autQxPath']

        cmd += self.autConf['autPath' + aut]

        cmd += " simulatorSvn=" + self.testConf['simulatorSvn']

        if (self.os == "Windows"):
            cmd += " testBrowser=" + self.browserConf[browser]
        else:
            cmd += " testBrowser='" + self.browserConf[browser] + "'"

        cmd += " browserId=\"" + browser + "\""

        cmd += " branch=" + self.testConf["qxBranch"]

        if options:
            for opt in options:
                cmd += ' "' + opt + '"'

        return cmd

    def reportResults(self, aut, start_date, log_file, ignore=None):
        from simulationLogParser import SimulationLogParser

        if (self.sim):
            self.log("SIMULATION: Getting report data for " + aut)
            return
        else:
            self.log("Getting report data for " + aut)

        try:
            import json
        except ImportError, e:
            try:
                import simplejson as json
            except ImportError, e:
                self.log("ERROR: Unable to import JSON module: " + repr(e))
                return

        import urllib2
        from urllib import urlencode
        testRunDict = self.getTestRunDict(aut, start_date)

        slp = SimulationLogParser(log_file, ignore)
        simulationData = slp.getSimulationData()

        testRunDict["simulations"] = simulationData

        try:
            if simulationData[0]["platform"] != "Unknown":
                testRunDict["test_hostos"] = simulationData[0]["platform"]
        except Exception:
            pass

        testRunJson = json.dumps(testRunDict)

        self.log("Report data aggregated, sending request")
        postdata = urlencode({"testRun": testRunJson})

        req = urllib2.Request(self.testConf["reportServerUrl"], postdata)

        try:
            if sys.version[:3] == "2.5":
                import socket
                import urllib2
                socket.setdefaulttimeout(120)
                response = urllib2.urlopen(req)
            else:
                response = urllib2.urlopen(req, None, 120)
        except Exception, e:
            msg = repr(e)
            if hasattr(e, "code"):
                msg += " Code: " + repr(e.code)
            self.log("Unable to contact report server: Error %s" % msg)
            return

        content = response.read()
        self.log("Report server response: " + content)

    def getTestRunDict(self, aut, start_date):
        import socket
        hostname = socket.gethostname()
        try:
            test_host = socket.gethostbyname(hostname)
        except socket.gaierror:
            test_host = '172.17.12.142'

        autName = aut
        if "Source" in aut:
            autName = aut[0:aut.find("Source")]

        testRun = {
            "aut_name": autName,
            "aut_host": self.autConf["autHost"],
            "aut_qxpath": "",
            "aut_path": self.autConf["autPath" + aut],
            "test_host": test_host,
            "test_hostid": "",
            "test_type": self.testConf["runType"],
            "revision": "",
            "branch": self.testConf["qxBranch"],
            "start_date": start_date,
            "end_date": time.strftime(self.timeFormat),
            "simulations": [],
            "dev_run": True
        }

        if self.qxRevision:
            testRun["revision"] = self.qxRevision

        if "autQxPath" in self.autConf:
            testRun["aut_qxpath"] = self.autConf["autQxPath"]

        if self.mailConf and "hostId" in self.mailConf:
            testRun["test_hostid"] = self.mailConf["hostId"]
        elif "hostId" in self.testConf:
            testRun["test_hostid"] = self.testConf["hostId"]

        return testRun

    ##
    # Sends the generated test report file by email.
    #
    # @param aut {str} The name of the tested application
    def sendReport(self, aut, reportfile):
        self.log("Preparing to send " + aut + " report: " + reportfile)
        if not os.path.exists(reportfile):
            self.log("sendReport: Report file not found!")
            return
        if not "mailTo" in self.mailConf:
            self.log("sendReport: No mail recipient configured!")
            return

        self.mailConf['subject'] = "[qooxdoo-test] " + aut

        reportFile = open(reportfile, 'rb')
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

        self.mailConf['subject'] += " " + osystem

        if ('hostId' in self.mailConf):
            self.mailConf['subject'] += " " + self.mailConf['hostId']
        if (self.qxRevision):
            self.mailConf['subject'] += " (%s r%s)" % (self.testConf["qxBranch"], self.qxRevision)
        if (aut in self.buildStatus):
            if (self.buildStatus[aut]["BuildError"]):
                self.mailConf['subject'] += " BUILD ERROR"
        if (failed != ""):
            self.mailConf['subject'] += ": " + failed + " test run(s) failed!"
        else:
            self.mailConf['subject'] += ": " + totalE + " issues"

        # Send mail
        if (self.sim):
            self.log("SIMULATION; Prepared report email:\n"
                             + "    Subject: " + self.mailConf['subject'] + "\n"
                             + "    Recipient: " + self.mailConf['mailTo'])
        if (osystem != ""):
            try:
                sendMultipartMail(self.mailConf)
            except Exception, e:
                self.logError(e, "Sending report email")
            else:
                self.log("Report email sent successfully")

        else:
            self.log("ERROR: Report file seems incomplete, report not sent.")

    ##
    # Runs logFormatter on a file containg "qxSimulator" entries. Uses the
    # Selenium RC server's log file as a fallback if the specified file doesn't
    # exist or is empty.
    #
    # @param inputfile {str} Path to the log file to be formatted.
    def formatLog(self, inputfile=None, reportfile=None, ignore=None):
        from logFormatter import QxLogFormat

        class FormatterOpts:
            def __init__(self, logfile, htmlfile, ignore=None):
                self.logfile = logfile
                self.htmlfile = htmlfile
                self.ignore = ignore

        if not inputfile:
            if 'seleniumLog' in self.seleniumConf:
                inputfile = self.seleniumConf['seleniumLog']

        if inputfile:
            if not os.path.isfile(inputfile):
                self.log("ERROR: %s is not a file." % inputfile)
                return False
            else:
                if os.path.getsize(inputfile) == "0L":
                    self.log("ERROR: Log file %s is empty." % inputfile)
                    return False

        if not inputfile:
            self.log("ERROR: No log file to work with")
            return False

        options = FormatterOpts(inputfile, reportfile, ignore)

        if (self.sim):
            self.log("SIMULATION: Formatting log file " + inputfile)
        else:
            self.log("Formatting log file " + inputfile)
            logformat = QxLogFormat(options)
            logformat.writeHtmlReport()

        return True

    ##
    # Clears the Selenium RC server log file.
    def clearLogs(self):
        if ('seleniumLog' in self.seleniumConf and os.path.exists(self.seleniumConf['seleniumLog'])):
            f = open(self.seleniumConf['seleniumLog'], 'w')
            if (self.sim):
                self.log("SIMULATION: Emptying server log file " + self.seleniumConf['seleniumLog'])
            else:
                self.log("Emptying server log file " + self.seleniumConf['seleniumLog'])
                f.write('')
            f.close()

    ##
    # Kills a browser process to make sure subsequent tests can launch the same
    # browser. This is somewhat unreliable as it tries to determine the process
    # name from the command used to tell Selenium which browser to use.
    #
    # @param browser {str} A browser identifier (one of the keys in browserConf)
    def killBrowser(self, browser):
        browserFull = self.browserConf[browser].lower()
        procName = None

        if "opera" in browserFull:
            procName = "opera"

        if "safari" in browserFull:
            procName = "safari"

        if "chrome" in browserFull:
            procName = "chrome"

        if "arora" in browserFull:
            procName = "arora"

        if "iexplore" in browserFull:
            procName = "iexplore"

        if "firefox" in browserFull:
            procName = "firefox"

        time.sleep(3)

        if procName:
            if self.os == "Linux" or self.os == "Mac OS X":
                if (self.sim):
                    self.log("SIMULATION: Killing *nix browser process: " + procName)
                else:
                    self.log("Killing Linux browser process: " + procName)
                    invokeExternal("pkill " + procName)
            else:
                script = "kill" + procName + ".vbs"
                if (os.path.isfile(script)):
                    if (self.sim):
                        self.log("SIMULATION: Killing Windows browser process: " + procName)
                    else:
                        self.log("Killing Windows browser process: " + procName)
                        invokeExternal("wscript " + script)

        else:
            self.log("ERROR: Unable to determine browser process name")

    ##
    # Executes a shell command that should (de)activate the proxy setting in the
    # Windows registry for browsers started with the *custom launcher (Safari,
    # Chrome, etc.)
    #
    # @param prox {bool} Enable (True) or disable (False) the proxy setting
    def setProxy(self, prox):
        if (prox):
            if (self.os == "Windows"):
                if (self.sim):
                    self.log("SIMULATION: Activating proxy setting in Windows registry: "
                                     + self.testConf['proxyEnable'])
                else:
                    self.log("Activating proxy setting in Windows registry")
                    invokeExternal(self.testConf['proxyEnable'])
            else:
                self.log("ERROR: Can't enable proxy on non-Windows system!")
        else:
            if (self.os == "Windows"):
                if (self.sim):
                    self.log("SIMULATION: Deactivating proxy setting in Windows registry: "
                                + self.testConf['proxyDisable'])
                else:
                    self.log("Deactivating proxy setting in Windows registry")
                    invokeExternal(self.testConf['proxyDisable'])
            else:
                self.log("Error: Can't disable proxy on non-Windows system!")

    ##
    # Executes a shell command that should (de)activate the IE8 compatibility
    # setting in the Windows registry
    #
    # @param compat {bool} Enable (True) or disable (False) the compatibility
    #     setting
    def setIE8Compatibility(self, compat):
        if (compat):
            if (self.os == "Windows"):
                if (self.sim):
                    self.log("SIMULATION: Activating IE8 compatibility mode in Windows registry: "
                                     + self.testConf['compatEnable'])
                else:
                    self.log("Activating IE8 compatibility mode in Windows registry")
                    invokeExternal(self.testConf['compatEnable'])
            else:
                self.log("ERROR: Can't enable IE8 compatibility mode on non-Windows system!")
        else:
            if (self.os == "Windows"):
                if (self.sim):
                    self.log("SIMULATION: Deactivating IE8 compatibility mode in Windows registry: "
                                + self.testConf['compatDisable'])
                else:
                    self.log("Deactivating IE8 compatibility mode in Windows registry")
                    invokeExternal(self.testConf['compatDisable'])
            else:
                self.log("Error: Can't disable IE8 compatibility mode on non-Windows system!")

    ##
    # Invokes lintRunner on one ore more targets
    #
    # @param lintConf {dict} Lint run configuration
    def runLint(self, lintConf):
        from lintRunner import QxLint

        class LintOpts:
            def __init__(self, workdir, mailto):
                self.workdir = workdir
                self.mailto = mailto
                self.outputfile = None

        for key in lintConf:
            for target in lintConf[key]:

                if self.mailConf and "mailTo" in self.mailConf:
                    mailTo = self.mailConf["mailTo"]
                else:
                    mailTo = None
                options = LintOpts(None, mailTo)

                if key == "other":
                    options.workdir = os.path.join(self.testConf['qxPathAbs'], target['directory'])
                elif key == "external":
                    options.workdir = target['directory']
                else:
                    options.workdir = os.path.join(self.testConf['qxPathAbs'], key, target['directory'])

                if ('ignoreClasses' in target):
                    options.ignoreClasses = target['ignoreClasses']

                if ('ignoreErrors' in target):
                    options.ignoreErrors = target['ignoreErrors']

                if (self.sim):
                    self.log("SIMULATION: Starting Lint runner:\n    " + options.workdir)
                else:
                    self.log("Running Lint for " + options.workdir)
                    try:
                        qxlint = QxLint(options)
                        if "reportServerUrl" in self.testConf:
                            try:
                                if self.qxRevision:
                                    revision = self.qxRevision
                                else:
                                    revision = ""
                                qxlint.reportResults(self.testConf["reportServerUrl"], target['directory'], revision, self.testConf["qxBranch"])
                            except Exception, e:
                                self.logError(e, "Error trying to send Lint results to report server")
                    except Exception, e:
                        self.logError(e, "Error running Lint")

    def logError(self, e, desc=""):
        msg = "ERROR: " + desc
        if not desc == "":
            msg += " "
        if type(e).__name__ == "str":
            self.log(msg + e)

        if e.__class__:
            msg += e.__class__.__name__
            if (e.args):
                msg += " " + repr(e.args)

        self.log(msg)

    ##
    # Adds options from a dictionary to a specified Generator config file. Options
    # must be specified in a dictionary using the same structure as a Generator
    # config file.
    #
    # @param configFilePath {str} Path of the config file to be edited
    # @param newConfig {dict} Generator config options to be added
    def editConfigJson(self, configFilePath=None, newConfig=None):
        import demjson

        if not configFilePath or not newConfig:
            raise Exception("Missing parameter for editJobConfig!")

        self.log("Editing config file " + configFilePath)
        configFile = codecs.open(configFilePath, 'r', 'utf-8')
        configJson = configFile.read()
        configFile.close()

        parsedConfig = demjson.decode(configJson, allow_comments=True)

        self.mergeDict(parsedConfig, newConfig)

        newConfigJson = demjson.encode(parsedConfig, strict=False, compactly=False, escape_unicode=True, encoding="utf-8")

        configFile = codecs.open(configFilePath, 'w', 'utf-8')
        self.log("Writing new config to file: " + configFilePath)
        configFile.write(newConfigJson)

    def mergeDict(self, oldDict, newDict):
        for key, value in newDict.iteritems():
            if not key in oldDict:
                oldDict[key] = value
            else:
                # key exists, need to recurse
                if type(value).__name__ == "dict" and type(oldDict[key]).__name__ == "dict":
                    self.mergeDict(oldDict[key], value)
                if type(value).__name__ == "list" and type(oldDict[key]).__name__ == "list":
                    for entry in value:
                        if not entry in oldDict[key]:
                            oldDict[key].append(entry)
                else:
                    oldDict[key] = value

    ##
    # Download a file and save it in a local directory.
    #
    # @param url {str} URL of the file to be downloaded
    # @param dir {str} Directory to save the file in. Will be created if it
    # doesn't exist.
    def download(self, url, dir):
        import urllib
        try:
            webFile = urllib.urlopen(url)
        except IOError, e:
            self.logError(e, "Downloading file " + url)
            return

        try:
            if not os.path.isdir(dir):
                os.mkdir(dir)
        except Exception, e:
            self.logError(e, "Creating directory " + dir)

        filename = url.split('/')[-1]
        localDir = os.path.join(dir, filename)

        try:
            localFile = open(localDir, 'w')
            localFile.write(webFile.read())
            webFile.close()
            localFile.close()
        except Exception, e:
            self.logError(e, "Writing downloaded file to " + localDir)
            return

        self.log("Downloaded file " + url + " to dir " + dir)
        return localDir

    ##
    # Extract a ZIP-compressed archive into a given directory.
    #
    # @param file {str} Path to the ZIP archive or alternatively a file-like object.
    # @param dir {str} Directory to unpack the file into. Will be created if it
    # doesn't exist.
    def unzipToDir(self, file, dir):
        import zipfile
        try:
            if not os.path.isdir(dir):
                os.mkdir(dir)
        except Exception, e:
            self.logError(e, "Creating directory " + dir)

        zfobj = zipfile.ZipFile(file)

        # The first entry in the zip file's name list is the top qooxdoo directory
        topDirName = zfobj.namelist()[0]
        topDir = os.path.join(dir, topDirName)

        # If the top directory already exists, recursively delete it
        if os.path.isdir(topDir):
            self.log("Deleting directory %s" % topDir)
            for root, dirs, files in os.walk(topDir, topdown=False):
                for name in files:
                    os.remove(os.path.join(root, name))
                for name in dirs:
                    os.rmdir(os.path.join(root, name))

        # Write the zip file's contents
        for name in zfobj.namelist():
            if name.endswith('/'):
                os.mkdir(os.path.join(dir, name))
            else:
                outfile = open(os.path.join(dir, name), 'wb')
                outfile.write(zfobj.read(name))
                outfile.close()

        return topDir


##
# Invokes a shell command, waits for it to finish, then returns its STDOUT and
# STDERR output.
#
# @param cmd {str} The command to be executed
# @return {tuple} The command's return code, STDOUT output and STDERR output
def invokePiped(cmd):
    import subprocess
    p = subprocess.Popen(cmd, shell=True,
                                             stdout=subprocess.PIPE,
                                             stderr=subprocess.PIPE,
                                             universal_newlines=True)
    output, errout = p.communicate()
    rcode = p.returncode

    return (rcode, output, errout)


##
# Invokes a shell command and waits for it to finish.
#
# @param cmd {str} The command to be executed
# @return {int} The exit code of the process
def invokeExternal(cmd):
    import subprocess
    p = subprocess.Popen(cmd, shell=True,
                                             stdout=sys.stdout,
                                             stderr=sys.stderr)
    return p.wait()


##
# Invokes a shell command and get its STDOUT/STDERR output while the process is
# running. Optionally writes the output to a file.
#
# @param cmd {str} The command to be executed
def invokeLog(cmd, file=None):
    import subprocess
    p = subprocess.Popen(cmd, shell=True,
                                                 stdout=subprocess.PIPE,
                                                 stderr=subprocess.STDOUT,
                                                 universal_newlines=True)

    while True:
        line = p.stdout.readline()
        if (not line):
            break
        print(line.rstrip("\n"))
        if file:
            file.write(line)


##
# Sends a multipart text/html e-mail
#
# @param configuration {dict} Mail settings
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


def git(cmd, repoPath):
    cwd = os.getcwd()
    os.chdir(repoPath)
    ret, out, err = invokePiped("git " + cmd)
    if ret > 0:
        msg = ""
        if err:
            msg = err
        else:
            msg = "Error executing git command " + cmd
        raise RuntimeError(msg)
    os.chdir(cwd)
    if out:
        return out
    else:
        return ""
