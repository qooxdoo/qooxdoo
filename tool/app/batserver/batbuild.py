#!/usr/bin/env python

# BAT Build - creating local qooxdoo builds (sdk, quickstart, ...)

import os, sys, platform
import optparse, time, re

# some defaults
buildconf = {
   'svn_base_url' : 'https://qooxdoo.svn.sourceforge.net/svnroot/qooxdoo',
   'stage_dir'    : '/tmp/qx',
   'logfile'      : 'bat_build.log',
   # change the next entry, to e.g. include a release candidate 'tags/release_0_8'
   'targets'       : ['trunk','branches/legacy_0_7_x'],
   'download_dir' : '/srv/www/htdocs/downloads',
   'doCleanup'    : False,
   'checkInterval': 10, # 10min - beware of time it takes for a build before re-check
   #'disk_space' : '2G',
   #'cpu_consume' : '20%',
   #'time_limit' : '30m',
}

def get_computed_conf():
    parser = optparse.OptionParser()

    parser.add_option(
        "-w", "--work-dir", dest="stagedir", default=buildconf['stage_dir'], type="string",
        help="Directory for checking out and making the target"
    )

    parser.add_option(
        "-t", "--build-target", dest="target", default=buildconf['targets'][0], type="string",
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

    parser.add_option(
        "-d", "--demon-mode", dest="demonMode", default=False, action="store_true",
        help="Run as demon"
    )

    parser.add_option(
        "-z", "--zap-output", dest="zapOut", default=False, action="store_true",
        help="All output to terminal"
    )

    parser.add_option(
        "-s", "--log-size", dest="logSize", type="long", default=None, 
        help="Log file size (in byte; default: unlimited)"
    )

    (options, args) = parser.parse_args()

    if options.zapOut:
        options.logfile = None

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
        sys.stdout = open(logfile, 'a')
        sys.stderr = sys.stdout

def check_logfile(logfile):
    if (logfile != None):
        sys.stdout.flush()
        if options.logSize != None:
            sys.stdout.truncate(options.logSize)

def invoke_external(cmd):
    import subprocess
    p = subprocess.Popen(cmd, shell=True,
                         stdout=sys.stdout,
                         stderr=sys.stderr)
    return p.wait()

def invoke_piped(cmd):
    import subprocess
    p = subprocess.Popen(cmd, shell=True,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE,
                         universal_newlines=True)
    output, errout = p.communicate()
    rcode = p.returncode

    return (rcode, output, errout)

def svn_check(target,revision):
    """ See in svn repos whether target has been changed (in respect to revision).
        For this check to work, target has to be checked out into stagedir once
        by hand.
        'True' means SVN_is_newer.
    """
    # %svninfo <rootdir> # yields local 'overall' version
    # %svn status --show-updates  <rootdir> # compares local tree against repos
    #targetdir = options.stagedir+target
    targetdir = os.path.join(buildconf['stage_dir'],target)
    ret,out,err = invoke_piped('svn status --show-updates '+targetdir)
    if ret or len(err):
        raise RuntimeError, "Unable to get svn status of "+targetdir+": "+err
    # just check for modified files in repository
    #if len(outt) > 2:  # you always get 'Status against revision:   XXXX\n'
    outt = out.split('\n')
    if len(filter(lambda s: s[6:9]==' * ', outt)) > 0:
        return True
    else:
        return False

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
    # make sure we don't get conflicts
    rc = invoke_external("svn --recursive revert %s" % target)
    return rc

def date():
    " Print a nicely formatted datetime string "
    import time
    print
    print time.ctime()
    print
    return

#rc = build_packet('tags/release_0_7',0)
#rc = build_packet('branches/legacy_0_7_x',0)
#rc = build_packet('trunc',0)
def build_packet(target,revision):
    cleanup(target)
    svn_checkout(target,revision)
    goto_workdir(os.path.join(target,"qooxdoo","frontend"))
    date()
    #make('source')
    #make('build')
    make('release')
    date()
    return 0

def build_targets(targList):
    rc = 0
    for target in targList:
        if svn_check(target,0):
            goto_workdir(options.stagedir)
            print "Making "+target
            rc = build_packet(target,0)
            copy_archives(target)
            if (options.cleanup):
                cleanup(target)
    return rc

def main():
    global options, args

    (options,args) = get_computed_conf()
    prepare_output(options.logfile)
    target = options.target
    release = options.release
    if (options.demonMode):
        while (1):
            check_logfile(options.logfile)
            rc = build_targets(buildconf['targets'])
            time.sleep(buildconf['checkInterval']*60)
    else:
        check_logfile(options.logfile)
        rc = build_targets([target])

    return rc


if __name__ == "__main__":
    try:
        rc = main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc = 1
    sys.exit(rc)
