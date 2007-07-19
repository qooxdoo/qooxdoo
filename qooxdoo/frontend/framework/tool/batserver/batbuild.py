#!/usr/bin/env python

# BAT Build - creating local qooxdoo builds (sdk, quickstart, ...)

import os, sys, platform
import optparse

# some defaults
buildconf = {
   'svn_base_url' : 'https://qooxdoo.svn.sourceforge.net/svnroot/qooxdoo',
   'stage_dir'    : '/tmp/qx/staging',
   'logfile'      : 'bat_build.log',
   'target'       : 'trunk',
   'download_dir' : '/srv/www/htdocs/downloads',
   'doCleanup'    : False,
   #'disk_space' : '2G',
   #'cpu_consume' : '20%',
   #'time_limit' : '30m',
}

def get_computed_conf():
    parser = optparse.OptionParser()

    parser.add_option(
        "-w", "--work-dir", dest="stagedir", default=None, type="string",
        help="Directory for checking out and making the target"
    )

    parser.add_option(
        "-t", "--build-target", dest="target", default=buildconf['target'], type="string",
        help="Target to build (e.g. \"trunk\")"
    )

    parser.add_option(
        "-r", "--build-release", dest="release", default=None, type="string",
        help="Release version (SVN) of target to build (e.g. \"9077\")"
    )

    parser.add_option(
        "-c", "--clean-up", dest="cleanup", default=buildconf['doCleanup'], action="store_true",
        help="Remove all created files in staging dir after building and copying"
    )

    parser.add_option(
        "-l", "--log-file", dest="logfile", default=buildconf['logfile'], type="string",
        help="Name of log file"
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
    # assert: cwd = ".../frontend"
    rc = invoke_external("cp %s* %s" % ('release/qooxdoo-',buildconf['download_dir']))
    return rc

def cleanup(target):
    return

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
    target = options.target
    release = options.release
    #rc = build_packet('tags/release_0_7',0)
    #rc = build_packet('brances/legacy_0_7_x',0)
    rc = build_packet(target, release)
    copy_archives(target)
    if (options.cleanup):
        cleanup(target)
    return rc


if __name__ == "__main__":
    try:
        rc = main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc = 1
    sys.exit(rc)
