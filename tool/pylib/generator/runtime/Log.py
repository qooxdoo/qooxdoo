#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
##

import sys, codecs, inspect, re, cPickle as pickle

from misc import textutil


class Log(object):
    _indent = 0
    _levels = {
      "debug" : 10,         # STDOUT
      "info" : 20,          # STDOUT
      "warning" : 30,       # STDERR
      "error" : 40,         # STDERR
      "fatal" : 50          # STDERR
    }


    def __init__(self, logfile=None, level="info",):
        self.setLevel(level)

        if logfile != None:
            self.logfile = codecs.open(logfile, encoding="utf-8", mode="w")
        else:
            self.logfile = False

        self.filter_pattern = ""
        self._inProgress = False
        self.progress_indication = True

    ##
    # Prevent from getting pickled.
    # It's no use pickling a runtime object. E.g. log level and log file
    # might be completely different on next run. Runtime objects are created
    # afresh with each run, and need to be injected into other, unpickled
    # objects that want to use them.
    def __getstate__(self):
        raise pickle.PickleError("Never pickle generator.runtime.Log.")

    def setFilter(self, filterPatternsList=[]):
        if not filterPatternsList:
            self.filter_pattern = ""
            return
        re_patts = [textutil.toRegExpS(x) for x in filterPatternsList]
        self.filter_pattern = re.compile("|".join(re_patts))


    def resetFilter(self):
        self.filter_pattern = ""


    def setLevel(self, level):
        self._level = level


    def getLevel(self):
        return self._level


    def inDebugMode(self):
        return self._levels[self._level] < self._levels["info"]


    def indent(self):
        self._indent += 1


    def outdent(self):
        if self._indent > 0:
            self._indent -= 1


    def head(self, msg, main=False):
        if main:
            line = "-" * 76
        else:
            line = "-" * 76

        self.write("", "info")
        self.write(line, "info")
        #self.write("    %s" % msg.upper(), "info")
        self.write("    %s" % msg, "info")
        self.write(line, "info")


    def write(self, msg, level="info", feed=True):
        # Always add a line feed in debug mode
        if self._levels[self._level] < self._levels["info"]:
            feed = True

        msg = msg.encode('utf-8')
        # Standard streams
        if self._levels[level] >= self._levels[self._level]:  # filter msg according to level
            # check necessary newline
            if self._inProgress:
                self.nl()
                self._inProgress = False

            # select stream
            if self._levels[level] < self._levels["warning"]:
                stream = sys.stdout
            else:
                stream = sys.stderr

            if feed:
                msg += '\n'
            stream.write(msg)
            stream.flush()

            # Log file
            if self.logfile:
                self.logfile.write(msg)
                self.logfile.flush()


    def log(self, msg, level="info", feed=True):
        # add prefix
        if msg == "":
            prefix = ""
        else:
            prefix = self.getPrefix()
        self.write(prefix + msg, level, feed)


    def getPrefix(self):
        # add prefix
        prefix = ""
        if self._indent == 0:
            prefix = ">>> "
        elif self._indent > 0:
            prefix = ("  " * self._indent) + "- "
        return prefix
        
        
    def debug(self, msg, feed=True):
        if self.filter_pattern:
            # check caller's name against module filter
            caller_frame = inspect.stack()[1]
            #caller_module = inspect.getmodulename(caller_frame[1])
            caller_module = inspect.getmodule(caller_frame[0])
            if caller_module:
                caller_module = caller_module.__name__
            else:
                caller_module = ""
            #caller_function = sys._getframe(1).f_code.co_name
            caller_function = caller_frame[0].f_code.co_name
            caller_fqn = caller_module + "." + caller_function
            if self.filter_pattern.search(caller_fqn):
                #print "### ", caller_fqn
                self.log(msg, "debug", feed)
        else:
            self.log(msg, "debug", feed)


    def info(self, msg, feed=True):
        self.log(msg, "info", feed)


    def warn(self, msg, feed=True):
        self.log("Warning: %s" % msg, "warning", feed)


    def error(self, msg, feed=True):
        self.write("Error: %s" % msg, "error", feed)


    def fatal(self, msg, feed=True):
        self.log("Fatal: %s" % msg, "fatal", feed)


    def progress(self, pos, length, msg=''):
        if self._levels[self._level] > self._levels["info"]:
            return

        self._inProgress = True

        if msg:
            totalprefix = '\r' + self.getPrefix() + msg
        else:
            totalprefix = ''

        thisstep = 10 * pos / length
        prevstep = 10 * (pos-1) / length

        if thisstep and not prevstep:
            prefix = ''
        else:
            prefix = '\b\b\b\b'

        if thisstep != prevstep:
            #sys.stdout.write("%s %s%%" % (totalprefix, thisstep * 10))
            sys.stdout.write("%s%3s%%" % (prefix, thisstep * 10,))
            sys.stdout.flush()

        if pos == length:
            self._inProgress = False
            sys.stdout.write("\n")
            sys.stdout.flush()


    sigils = r"|/-\|/-\\"
    sigils1= r".o0O0o"
    sigils_len = len(sigils)

    def dot(self, char='.', i=[0]):
        if self.progress_indication:
            self._inProgress = True
            stream = sys.stdout
            i[0] = (i[0] + 1) % self.sigils_len
            stream.write("\b"+self.sigils[i[0]])
            stream.flush()

    def dotclear(self, ok=' '):
        self._inProcess = False
        stream = sys.stdout
        msg = "\b" if self.progress_indication else "\n"
        stream.write(msg+ok)
        stream.flush()

    def dot1(self, char='.'):
        self._inProgress = True
        stream = sys.stdout
        stream.write(char)
        stream.flush()


    def nl(self):
        stream = sys.stdout
        stream.write("\n")
        stream.flush()
