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

import re, os, sys, types, glob, time, string, platform

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
        watcher = Watcher(jobconf, confObj)
        interval = jobconf.get("watch-files/check-interval", 2)
        paths = jobconf.get("watch-files/paths", [])
        if not paths:
            return
        command = jobconf.get("watch-files/command/line", "")
        if not command:
            return
        command_tmpl = CommandLineTemplate(command)
        per_file = jobconf.get("watch-files/command/per-file", False)
        exit_on_retcode = jobconf.get("watch-files/command/exit-on-retcode", False)
        exec_on_startup = jobconf.get("watch-files/command/exec-on-startup", False)
        if exec_on_startup:
            # simply set check-time to start of epoch
            since = 1.0  # (since=0 would disable time span checking)
        console.info("Watching changes of '%s'..." % paths)
        console.info("Press Ctrl-C to terminate.")
        while True:
            osince = since
            since = time.time()
            ylist = watcher.check(osince)
            if ylist:     # ylist =[(fpath,fstamp)]
                flist = [f[0] for f in ylist]
                cmd_args = {'FILELIST': ' '.join(flist)}
                console.debug("found changed files: %s" % flist)
                try:
                    if not per_file:
                        cmd = command_tmpl.safe_substitute(cmd_args)
                        self.runShellCommand(cmd)
                    else:
                        for fname in flist:
                            cmd_args['FILE']      = fname                       # foo/bar/baz.js
                            cmd_args['DIRNAME']   = os.path.dirname(fname)      # foo/bar
                            cmd_args['BASENAME']  = os.path.basename(fname)     # baz.js
                            cmd_args['EXTENSION'] = os.path.splitext(fname)[1]  # .js
                            cmd_args['FILENAME']  = os.path.basename(os.path.splitext(fname)[0])  # baz
                            cmd = command_tmpl.safe_substitute(cmd_args)
                            self.runShellCommand(cmd)
                except RuntimeError:
                    if exit_on_retcode:
                        raise
                    else:
                        pass
            time.sleep(interval)
        return

    def runShellCommands(self, jobconf):
        if not jobconf.get("shell/command"):
            return

        shellcmd = jobconf.get("shell/command", "")
        cmdnotfoundmsg = jobconf.get("shell/command-not-found", "")
        if isinstance(shellcmd, list):
            for cmd in shellcmd:
                self.runShellCommand(cmd, cmdnotfoundmsg)
        else:
            self.runShellCommand(shellcmd, cmdnotfoundmsg)


    def runShellCommand(self, shellcmd, cmdnotfoundmsg=""):
        rc = 0
        self._shellCmd       = ShellCmd()
        self._console.info("Executing shell command \"%s\"..." % shellcmd)
        self._console.indent()

        rc = self._shellCmd.execute(shellcmd, self._config.getConfigDir())
        if rc != 0:
            # BUG #7997 (sass may not be installed)
            # 127 = given cmd is not found within PATH sys var and it's not a built-in shell cmd
            if (rc == 127 or (rc == 1 and platform.system() == "Windows")) and cmdnotfoundmsg:
                self._console.info("Skipping shell command: %s" % cmdnotfoundmsg)
            else:
                raise RuntimeError, "Shell command returned error code: %s" % repr(rc)
        self._console.outdent()


class CommandLineTemplate(string.Template):
    delimiter = "%"
    idpattern = string.Template.idpattern
    pattern = r"""
        %(delim)s(?:
          (?P<escaped>%(delim)s) |   # Escape sequence of two delimiters
          (?P<named>%(id)s)      |   # delimiter and a Python identifier
          \((?P<braced>%(id)s)\) |   # delimiter and a braced identifier
          (?P<invalid>)              # Other ill-formed delimiter exprs
        )
      """ % {
              'delim': re.escape(delimiter),
              'id'   : idpattern
            }

##
# Exposes a .check() method to check for changes in the configured paths.
# - Only concerned with the file checking, no timing, no actions.
#
class Watcher(object):

    def __init__(self, jobconf, confObj):
        self.jobconf = jobconf
        self.confObj = confObj
        self.paths = jobconf.get("watch-files/paths", [])
        self.paths = [confObj.absPath(p) for p in self.paths]
        self.with_dirs = jobconf.get("watch-files/include-dirs", False)
        self.pattern = self._watch_pattern(jobconf.get("watch-files/include", []))
        self.console = Context.console

    def _watch_pattern(self, include):
        pattern = u''
        a = []
        for entry in include:
            e = textutil.toRegExpS(entry)
            a.append(e)
        pattern = '|'.join(a)
        return pattern

    def check(self, since):
        ylist = []
        for path in self.paths:
            self.console.debug("checking path '%s'" % path)
            part_list = filetool.findYoungest(path, pattern=self.pattern,
                includedirs=self.with_dirs, since=since)
            ylist.extend(part_list)
        return ylist


