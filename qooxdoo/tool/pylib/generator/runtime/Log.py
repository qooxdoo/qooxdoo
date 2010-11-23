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
#
################################################################################

##
##

import sys, codecs, inspect, re

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
            line = "=" * 76
        else:
            line = "-" * 76

        self.write("", "info")
        self.write(line, "info")
        self.write("    %s" % msg.upper(), "info")
        self.write(line, "info")


    def write(self, msg, level="info", feed=True):
        # Always add a line feed in debug mode
        if self._levels[self._level] < self._levels["info"]:
            feed = True

        msg = msg.encode('utf-8')
        # Standard streams
        if self._levels[level] >= self._levels[self._level]:  # filter msg according to level
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
        elif self._indent == 0:
            prefix = ">>> "
        elif self._indent > 0:
            prefix = ("  " * self._indent) + "- "

        self.write(prefix + msg, level, feed)


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


    def progress(self, pos, length):
        if self._levels[self._level] > self._levels["info"]:
            return

        thisstep = 10 * pos / length
        prevstep = 10 * (pos-1) / length

        if thisstep != prevstep:
            sys.stdout.write(" %s%%" % (thisstep * 10))
            sys.stdout.flush()

        if pos == length:
            sys.stdout.write("\n")
            sys.stdout.flush()


    def dot(self, char='.'):
        stream = sys.stdout
        stream.write(char)
        stream.flush()


    def nl(self):
        stream = sys.stdout
        stream.write("\n")
        stream.flush()
