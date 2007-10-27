class Log:
    _debugLevel = 10
    _infoLevel = 20
    _warningLevel = 30
    _errorLevel = 40
    _criticalLevel = 50
    
    def __init__(self, level=20):
        self.set(level)
    
    def set(self, level):
        self.level = level
        
    def log(self, msg, level, feed=True):
        if level >= self.level:
            if feed:
                print msg
            else:
                sys.stdout.write(msg)
                sys.stdout.flush()
                
    def debug(self, msg, feed=True):
        self.log(msg, self._debugLevel, feed)
        
    def info(self, msg, feed=True):
        self.log(msg, self._infoLevel, feed)

    def warning(self, msg, feed=True):
        self.log(msg, self._warningLevel, feed)

    def error(self, msg, feed=True):
        self.log(msg, self._errorLevel, feed)

    def critical(self, msg, feed=True):
        self.log(msg, self._criticalLevel, feed)
        
    def progress(self, pos, length):
        if self.level > self._infoLevel:
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