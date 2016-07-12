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
#    MIT: https://opensource.org/licenses/MIT
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

import os, sys, platform
import optparse, re

workdir = "/tmp/qx"
#logfile = "bat_workpack.log"
packname = "qooxdoo-0.7.1-sdk"
packarch = ".tar.gz"
bathost  = "172.17.12.117"
doCleanup = False
doUnpackOnly = False

# go to workdir
def goto_workdir(workdir):
    if not os.path.exists(workdir):
        os.mkdir(workdir)
    os.chdir(workdir)

# download qooxdoo package
def qx_download(packname):
    import httplib
    packurl = "/downloads/" + packname + options.packarch
    httpServ = httplib.HTTPConnection(options.bathost, 80)
    httpServ.connect()

    httpServ.request('GET', packurl)
    resp = httpServ.getresponse()
    if resp.status != httplib.OK:
        raise RuntimeError, "Unable to download package at http://" \
              + options.bathost + packurl + " (HTTP: " + repr(resp.status) \
              + " " + repr(resp.reason) + ")"
    else:
        file = open(packname + options.packarch, 'wb')
        file.write(resp.read())
        file.close()

# unzip
def qx_unzip(packname):
    if re.search(r'(tar.gz|tgz)',options.packarch, re.I):
        zcmd = "tar xvzf "
    else:
        zcmd = "unzip -o "
    rc = invoke_external(zcmd + packname + options.packarch)
    return rc

# run make
def run_make(packname):
    os.chdir(os.path.join(packname,"frontend"))
    rc = invoke_external("make source")
    if (rc == 0 and options.makebuild):
        rc = invoke_external("make build")
    return rc

def run_cleanup(packname):
    os.chdir(options.workdir)
    rc = invoke_external("rm -rf %s*" % packname)
    return rc

def prepare_output(logfile):
    # redirect std streams, also for child processes
    if (logfile != None):
        sold = sys.stdout
        eold = sys.stderr
        sys.stdout = open(logfile, 'w')
        sys.stderr = sys.stdout

def invoke_external(cmd):
    import subprocess
    p = subprocess.Popen(cmd, shell=True,
                         stdout=sys.stdout,
                         stderr=sys.stderr)
    return p.wait()

def get_options():
    parser = optparse.OptionParser()

    parser.add_option(
        "-w", "--work-dir", dest="workdir", default=workdir, type="string",
        help="Directory for dowloading, unpacking and running the work pack"
    )

    parser.add_option(
        "-p", "--package-name", dest="packname", default="qooxdoo-0.7.1-sdk", type="string",
        help="The name of the work package to run (e.g. \"qooxdoo-0.7.1-sdk\")"
    )

    parser.add_option(
        "-c", "--clean-up", dest="cleanup", default=doCleanup, action="store_true",
        help="Remove all files after test run"
    )

    parser.add_option(
        "-l", "--log-file", dest="logfile", default=None, type="string",
        help="Name of log file"
    )

    parser.add_option(
        "-a", "--archive-format", dest="packarch", default=packarch, type="string",
        help="Package archive format (e.g. \".tar.gz\" or \".zip\")"
    )

    parser.add_option(
        "-b", "--browser-run", dest="dobrowser", default=False, action="store_true",
        help="Whether to open a browser and run some tests (might interfer with your desktop)"
    )

    parser.add_option(
        "-t", "--bat-host", dest="bathost", default=bathost, type="string",
        help="The BAT host to connect to"
    )

    parser.add_option(
        "-u", "--unpack-only", dest="unpackonly", default=doUnpackOnly, action="store_true",
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
    goto_workdir(options.workdir)
    prepare_output(options.logfile)
    qx_download(options.packname)
    rc = qx_unzip(options.packname)
    if options.unpackonly:
        return rc
    run_make(options.packname)
    # run_browser()?
    # send_results()
    if options.cleanup:
        run_cleanup(options.packname)

    return rc

if __name__ == "__main__":
    try:
        rc = main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc=1
    sys.exit(rc)
