################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2008 1&1 Internet AG, Germany, http://www.1und1.de
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

import sys, codecs

class Log:
    _indent = 0
    _levels = {
      "debug" : 10,
      "info" : 20,
      "warning" : 30,
      "error" : 40,
      "critical" : 50
    }


    def __init__(self, logfile=None, level="info"):
        self.setLevel(level)

        if logfile != "":
            self.logfile = codecs.open(logfile, encoding="utf-8", mode="w")
        else:
            self.logfile = False


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

        # Log file
        if self.logfile:
            self.logfile.write(msg + "\n")
            self.logfile.flush()

        # Standard out
        if self._levels[level] >= self._levels[self._level]:
            if feed:
                print msg
            else:
                sys.stdout.write(msg)
                sys.stdout.flush()


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
        self.log(msg, "debug", feed)


    def info(self, msg, feed=True):
        self.log(msg, "info", feed)


    def warn(self, msg, feed=True):
        self.log(msg, "warning", feed)


    def error(self, msg, feed=True):
        self.write("!!! %s" % msg, "error", feed)


    def critical(self, msg, feed=True):
        self.log(msg, "critical", "critical", feed)


    def progress(self, pos, length):
        # Ignore in debug mode: There is richer alternative debugging normally
        if self._levels[self._level] < self._levels["info"]:
            return

        # starts normally at null, but this is not useful here
        # also the length is normally +1 the real size
        pos += 1

        thisstep = 10 * pos / length
        prevstep = 10 * (pos-1) / length

        if thisstep != prevstep:
            sys.stdout.write(" %s%%" % (thisstep * 10))
            sys.stdout.flush()

        if pos == length:
            sys.stdout.write("\n")
            sys.stdout.flush()
