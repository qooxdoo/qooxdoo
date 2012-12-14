#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2012 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# Actions that concern Application Testing.
##
import sys, os, re, types, string
from misc            import util, textutil, json
from generator       import Context
from generator.runtime.ShellCmd      import ShellCmd

def runSimulation(jobconf):
    console = Context.console
    console.info("Running Simulation...")

    argv    = []
    javaBin = "java"
    javaClassPath = "-cp"
    argv.extend((javaBin, javaClassPath))

    configClassPath = jobconf.get("simulate/java-classpath", [])
    qxSeleniumPath = jobconf.get("simulate/qxselenium-path", False)
    if qxSeleniumPath:
        configClassPath.append(qxSeleniumPath)

    classPathSeparator = ":"
    if util.getPlatformInfo()[0] == "Windows":
        classPathSeparator = ";"

    configClassPath = classPathSeparator.join(configClassPath)

    if "CYGWIN" in util.getPlatformInfo()[0]:
        configClassPath = "`cygpath -wp " + configClassPath + "`"

    argv.append(configClassPath)

    rhinoClass = jobconf.get("simulate/rhino-class", "org.mozilla.javascript.tools.shell.Main")
    runnerScript = jobconf.get("simulate/simulator-script")
    argv.extend((rhinoClass, runnerScript))

    cmd = " ".join(textutil.quoteCommandArgs(argv))

    settings = jobconf.get("environment", None)
    for key in settings:
        if type(settings[key]) == unicode:
            settings[key] = settings[key].replace(" ", "$")
    if settings:
        settings = json.dumps(settings, separators=(",", ":"))
        settings = settings.replace('"','\\"').replace("{", "\{").replace("}", "\}")
        settings = "settings=" + settings
        cmd += " " + settings

    console.debug("Selenium start command: " + cmd)
    shell = ShellCmd()
    shell.execute_logged(cmd, console, True)


