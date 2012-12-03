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

import re, os, sys, types, glob, time

from misc import filetool, textutil
from generator import Context
from generator.runtime.ShellCmd import ShellCmd

##
# Library that contains various functions that implement Generator job actions
# (aka. 'triggers')
#

class ActionLib(object):
    def __init__(self, config, console_):
        self._config   = config
        self._console  = console_
        self._shellCmd = ShellCmd()

    def clean(self, cleanMap):
        assert isinstance(cleanMap, types.DictType)
        for item in cleanMap:
            self._console.info(item)
            for file in cleanMap[item]:
                file = self._config.absPath(file) 
                # resolve file globs
                for entry in glob.glob(file):
                    # safety first
                    if os.path.splitdrive(entry)[1] == os.sep:
                        raise RuntimeError, "!!! I'm not going to delete '/' recursively !!!"
                    self._shellCmd.rm_rf(entry)


    def watch(self, jobconf, confObj):
        console = Context.console
        since = time.time()
        interval = jobconf.get("watch-files/interval", 2)
        path = jobconf.get("watch-files/path", "")
        if not path:
            return
        exit_on_retcode = jobconf.get("watch-files/exit-on-retcode", True)
        command = jobconf.get("watch-files/command/line", "")
        if not command:
            return
        per_file = jobconf.get("watch-files/command/per-file", False)
        console.info("Watching changes of '%s'..." % path)
        console.info("Press Ctrl-C (Ctrl-Z on Windows) to terminate.")
        pattern = self._watch_pattern(jobconf.get("watch-files/include",[])) 
        while True:
            time.sleep(interval)
            console.debug("checking path '%s'" % path)
            ylist = filetool.findYoungest(path, pattern=pattern, includedirs=False, since=since)
            since = time.time()
            if ylist:     # ylist =[(fpath,fstamp)]
                flist = [f[0] for f in ylist]
                cmd_args = {'F': ' '.join(flist)}
                console.debug("found changed files: %s" % flist)
                try:
                    if not per_file:
                        cmd = command % cmd_args
                        self.runShellCommand(cmd)
                    else:
                        for fname in flist:
                            cmd_args['f'] = fname
                            cmd_args['f.d'] = os.path.dirname(fname)
                            cmd_args['f.b'] = os.path.basename(fname)
                            cmd_args['f.e'] = os.path.splitext(fname)[1]
                            print cmd_args
                            cmd = command % cmd_args
                            self.runShellCommand(cmd)
                except RuntimeError:
                    if exit_on_retcode:
                        raise
                    else:
                        pass
        return

    def _watch_pattern(self, include):
        pattern = u''
        a = []
        for entry in include:
            e = textutil.toRegExpS(entry)
            a.append(e)
        pattern = '|'.join(a)
        return pattern

    def runShellCommands(self, jobconf):
        if not jobconf.get("shell/command"):
            return

        shellcmd = jobconf.get("shell/command", "")
        if isinstance(shellcmd, list):
            for cmd in shellcmd:
                self.runShellCommand(cmd)
        else:
            self.runShellCommand(shellcmd)


    def runShellCommand(self, shellcmd):
        rc = 0
        self._shellCmd       = ShellCmd()

        self._console.info("Executing shell command \"%s\"..." % shellcmd)
        self._console.indent()

        rc = self._shellCmd.execute(shellcmd, self._config.getConfigDir())
        if rc != 0:
            raise RuntimeError, "Shell command returned error code: %s" % repr(rc)
        self._console.outdent()


