#!/usr/bin/env python

# BAT Build - creating local qooxdoo builds (sdk, quickstart, ...)

import os, sys, platform
import optparse

buildconf = {
   'svn_base_url' : 'https://qooxdoo.svn.sourceforge.net/svnroot/qooxdoo',
   'stage_dir'    : '/tmp/qx/staging',
   'logfile'      : 'bat_build.log',
   'target'       : 'trunk',
   'download_dir' : '/srv/www/htdocs/downloads',
   #'disk_space' : '2G',
   #'cpu_consume' : '20%',
   #'time_limit' : '30m',
}

def get_computed_conf():
    parser = optparse.OptionParser()

    parser.add_option(
        "-w", "--work-dir", dest="stagedir", default=None, type="string",
        help="Directory for dowloading, unpacking and running the work pack"
    )

    parser.add_option(
        "-p", "--build-packet", dest="target", default=buildconf['target'], type="string",
        help="Target to build (e.g. \"trunk\")"
    )

    parser.add_option(
        "-c", "--clean-up", dest="cleanup", default=doCleanup, action="store_true",
        help="Remove all files after test run"
    )

    parser.add_option(
        "-l", "--log-file", dest="logfile", default=buildconf['logfile'], type="string",
        help="Name of log file"
    )

    parser.add_option(
        "-t", "--bat-host", dest="bathost", default=buildconf['bathost'], type="string",
        help="The BAT host to connect to"
    )

    (options, args) = parser.parse_args()

    return (options, args)

def goto_workdir(workdir):
    if not os.path.exists(workdir):
        os.mkdir(workdir)
    os.chdir(workdir)

def prepare_output(logfile):
    # redirect std streams, also for child processes
    global sold, eold
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

def svn_checkout(target,revision):
    rc = invoke_external("svn co %s/%s %s" % (buildconf['svn_base_url'],target,target))
    return rc

def make(target):
    rc = invoke_external("make %s" % target)
    return rc

def copy_archives(target):
    #import shutil
    #for p in buildconf['archives']:
    #    copy(os.path.join(),buildconf['download_dir'])
    rc = invoke_external("cp %s* %s" % ('release/qooxdoo-',buildconf['download_dir']))
    return rc

def build_packet(target,revision):
    cleanup(target)
    svn_checkout(target,revision)
    goto_workdir(os.path.join(target,"qooxdoo","frontend"))
    #make('source')
    #make('build')
    make('release')

def main():
    global options, args

    (options,args) = get_computed_conf()
    goto_workdir(options.stagedir)
    prepare_output(options.logfile)
    rc = build_packet('trunk')
    copy_archives()
    return rc


if __name__ == "__main__":
    try:
        rc = main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc = 1
    sys.exit(rc)
