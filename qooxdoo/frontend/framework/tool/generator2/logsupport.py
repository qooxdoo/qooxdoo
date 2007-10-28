import sys, codecs

class Log:
    _debugLevel = 10
    _infoLevel = 20
    _warningLevel = 30
    _errorLevel = 40
    _criticalLevel = 50
    _indent = 0
    
    
    def __init__(self, logfile=None, level=20):
        self.set(level)
        if logfile != "":
            self.logfile = codecs.open(logfile, encoding="utf-8", mode="w")
        else:
            self.logfile = False
        
            
    def set(self, level):
        self.level = level
        
        
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
        
        self.write("", self._infoLevel)
        self.write(line, self._infoLevel)
        self.write("    %s" % msg.upper(), self._infoLevel)
        self.write(line, self._infoLevel)        
        
    
    def write(self, msg, level, feed=True):
        # Always add a line feed in debug mode
        if self.level < self._infoLevel:
            feed = True
        
        # log file
        if self.logfile:
            self.logfile.write(msg + "\n")
            self.logfile.flush()
        
        # standard out
        if level >= self.level:
            if feed:
                print msg
            else:
                sys.stdout.write(msg)
                sys.stdout.flush()
                        
        
    def log(self, msg, level, feed=True):
        # add prefix
        if msg == "":
            prefix = ""
        elif self._indent == 0:
            prefix = ">>> "
        elif self._indent > 0:
            prefix = ("  " * self._indent) + "- "
            
        self.write(prefix + msg, level, feed)

                
    def debug(self, msg, feed=True):
        self.log(msg, self._debugLevel, feed)

        
    def info(self, msg, feed=True):
        self.log(msg, self._infoLevel, feed)


    def warn(self, msg, feed=True):
        self.log(msg, self._warningLevel, feed)


    def error(self, msg, feed=True):
        self.log(msg, self._errorLevel, feed)


    def critical(self, msg, feed=True):
        self.log(msg, self._criticalLevel, feed)
        
        
    def progress(self, pos, length):
        # starts normally at null, but this is not useful here
        # also the length is normally +1 the real size
        pos += 1

        if self.level < self._infoLevel:
            return

        thisstep = 10 * pos / length
        prevstep = 10 * (pos-1) / length

        if thisstep != prevstep:
            sys.stdout.write(" %s%%" % (thisstep * 10))
            sys.stdout.flush()

        if pos == length:
            sys.stdout.write("\n")
            sys.stdout.flush()    