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
#    * Thomas Herchenroeder (thron7)
#    * Daniel Wagner (d_wagner)
#
################################################################################

# NAME
#  BAT Selenium testing workpack - this is a workpackage as used in the qooxdoo 
#  Build and Test environment.
#
# DESCRIPTION
#  This workpack launches a Selenium script that tests a qooxdoo application, 
#  such as the Test Runner or Demo Browser. Its main purpose is to assemble the
#  command line call that launches the script from a number of parameters. Some
#  of these (like the host name and qooxdoo path of the application to be 
#  tested) are supplied by the BAT server, while others, such as the path to the
#  Selenium Client Driver JAR file, are provided by the BAT client. This enables 
#  distributed testing setups where multiple clients running various browsers on
#  different machines can test applications on a central build server.

import os, sys
import optparse

def invoke_external(cmd):
    import subprocess    
    p = subprocess.Popen(cmd, shell=True,
                         stdout=sys.stdout,
                         stderr=sys.stderr)
    return p.wait()

def get_options():
    parser = optparse.OptionParser()
    
    parser.add_option(
        "--autHost", dest="authost", default=None, type="string",
        help="Host name of the application to be tested"
    )
    
    parser.add_option(
        "--autPort", dest="autport", default=None, type="string",
        help="Port number of the application to be tested"
    )

    parser.add_option(
        "--autPath", dest="autpath", default=None, type="string",
        help="Path to the application to be tested"
    )
    
    parser.add_option(
        "-w", "--work-dir", dest="workdir", default=None, type="string",
        help="Directory for dowloading, unpacking and running the work pack"
    )

    parser.add_option(
        "-p", "--package-name", dest="packname", default="qooxdoo-0.7.1-sdk", type="string",
        help="The name of the work package to run (e.g. \"qooxdoo-0.7.1-sdk\")"
    )

    parser.add_option(
        "-c", "--clean-up", dest="cleanup", default=None, action="store_true",
        help="Remove all files after test run"
    )

    parser.add_option(
        "-l", "--log-file", dest="logfile", default=None, type="string",
        help="Name of log file"
    )

    parser.add_option(
        "-a", "--archive-format", dest="packarch", default=None, type="string",
        help="Package archive format (e.g. \".tar.gz\" or \".zip\")"
    )

    parser.add_option(
        "-t", "--bat-host", dest="bathost", default=None, type="string",
        help="The BAT host to connect to"
    )
    
    parser.add_option(
        "-S", "--selenium-script", dest="seleniumscript", default=None, type="string",
        help="Full path to the Selenium test script"
    )
    
    parser.add_option(
        "-j", "--java-classpath", dest="classpath", default=None,
        type="string",
        help="Java classpath for Selenium tests"
    )
    
    parser.add_option(
        "-f", "--log-formatter", dest="logformatter", default=None,
        type="string",
        help="Full log formatting command, e.g. '/usr/bin/python /home/dwagner/qxselenium/logFormatter.py /tmp/selenium.log /home/dwagner/qxselenium/selenium-report.html'"
    )
    
    parser.add_option(
        "-q", "--qxPath", dest="qxpath", default=None,
        type="string",
        help="Qooxdoo path on the host"
    )
    
    parser.add_option(
        "-b", "--testBrowsers", dest="testbrowsers", default=None,
        type="string",
        help="Comma-separated list of browsers to run the tests in, e.g. [\"*opera,*iexplore\"]"
    )
    
    (options, args) = parser.parse_args()

    return (options, args)

def main():    
    global options, args
    (options, args) = get_options()
    
    rhino_class = 'org.mozilla.javascript.tools.shell.Main'
    
    if ( not(options.seleniumscript) or options.seleniumscript == None):
        print("Selenium test script not specified, quitting")
        sys.exit(1)
        
    if ( not(options.authost) or options.authost == None):
        print("No host name specified for application to be tested, quitting")
        sys.exit(1)

    if ( not(options.autpath) or options.autpath == None):
        print("No path specified for application to be tested, quitting")
        sys.exit(1)

    else:
        startcmd = 'java '
        if (options.classpath):
            startcmd += '-cp ' + options.classpath + ' '
        startcmd += rhino_class + ' ' + options.seleniumscript + ' autHost=' + options.authost
        if (options.autport and options.autport != None):
            startcmd += ':' + options.autport
        startcmd += " autPath="            
        if (options.qxpath and options.qxpath != None):
            startcmd += options.qxpath
        startcmd += options.autpath                            
    
        rc = False

        testBrowsers = options.testbrowsers.split(',')
    
        for browser in testBrowsers:
            runcmd = startcmd + " testBrowser='" + browser + "'"
            print ("Workpack starting test: " + runcmd)
            rc = invoke_external(runcmd)
            if (options.logformatter and options.logformatter !=None):
                print("Workpack starting log formatter: " + options.logformatter)
                rc = invoke_external(options.logformatter)
        return rc    
        

if __name__ == "__main__":
    try:
        rc = main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc=1
    sys.exit(rc)
