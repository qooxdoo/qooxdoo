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
#
################################################################################

# NAME
#  BAT workpack - this is a workpackage as used in the qooxdoo Build and Test
#  environment.
#
# DESCRIPTION
#  A workpack is not merely a declarative description of a job to be done, but
#  simply code that does the job :). This makes it much easier to implement both
#  the involved client-server infrastructure that passes workpackages to and
#  from, and the workpackages themselves. While this approach is highly
#  questionable in arbitrary environments, it is quite acceptable in controlled,
#  LAN-based environments where both clients and servers are controlled by the
#  same people.
#
#  The idea behind the workpacks is also to have the possibility to issue
#  client-dependent workpacks, where not only the platform (architecture, OS,
#  ...) is honored, but also space and time constraints can be honored. While
#  this concrete workpack is just static code, you could envision both static
#  variants of it that the server can choose from, as well as dynamically
#  generated code that the server produces on the fly from snippets and
#  templates.

import os, sys
import optparse

workdir = "/home/dwagner/qxselenium"
start_test = 'java -cp "/home/dwagner/qxselenium/selenium-java-client-driver.jar:/home/dwagner/rhino1_7R1/js.jar" org.mozilla.javascript.tools.shell.Main test_testrunner.js'
get_log = "python logFormatter.py /tmp/selenium.log selenium-report.html"
#testBrowsers = ["'*custom /usr/lib/firefox-3.0.5/firefox -no-remote -P selenium-3'", "'*firefox /home/dwagner/firefox2/firefox-bin'", "*opera"]
testBrowsers = ["'*custom /usr/lib/firefox-3.0.5/firefox -no-remote -P selenium-3'"]
# go to workdir
def goto_workdir(workdir):
    if not os.path.exists(workdir):
        os.mkdir(workdir)
    os.chdir(workdir)

def invoke_external(cmd):
    import subprocess
    p = subprocess.Popen(cmd, shell=True,
                         stdout=sys.stdout,
                         stderr=sys.stderr)
    return p.wait()

def get_options():
    parser = optparse.OptionParser()

    parser.add_option(
        "--autPath", dest="autpath", default=None, type="string",
        help="Path to the application to be tested"
    )
    
    parser.add_option(
        "-w", "--work-dir", dest="workdir", default=workdir, type="string",
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
        "-b", "--browser-run", dest="dobrowser", default=False, action="store_true",
        help="Whether to open a browser and run some tests (might interfer with your desktop)"
    )

    parser.add_option(
        "-t", "--bat-host", dest="bathost", default=None, type="string",
        help="The BAT host to connect to"
    )

    parser.add_option(
        "-u", "--unpack-only", dest="unpackonly", default=None, action="store_true",
        help="Stop processing after downloading and unpacking"
    )

    parser.add_option(
        "-m", "--make-build", dest="makebuild", default=False, action="store_true",
        help="Run a \"make build\" additionally to making the source version"
    )    
    
    (options, args) = parser.parse_args()

    return (options, args)

def main():
    global options, args
    (options, args) = get_options()    
    os.chdir(workdir)    
    print("autPath: " +options.autpath)
    for browser in testBrowsers:
        invoke_external(start_test + " autPath=" + options.autpath + " testBrowser=" + browser)
        invoke_external(get_log)
    #return rc

if __name__ == "__main__":
    try:
        rc = main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc=1
    sys.exit(rc)
