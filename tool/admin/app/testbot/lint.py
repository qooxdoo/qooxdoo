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
#    * Daniel Wagner (d_wagner)
#
################################################################################

import os, re, sys
import util, urllib, urllib2
import reporting
try:
    import json
except ImportError, e:
    try:
        import simplejson as json
    except ImportError, e:
        raise RuntimeError, "No JSON module available"


class Lint:
    def __init__(self, options, logger):
        self.log = logger

        if not options.workdir:
            raise RuntimeError, "Lint: No working directory specified."
        
        lintResult = self.__getLintResult(options.workdir)
        
        ignoreMessages = []
        if hasattr(options, "ignoremessages"):
            optionType = type(options.ignoremessages).__name__
            if optionType == "list":
                ignoreMessages = options.ignoremessages
            elif optionType == "str":
                ignoreMessages = options.ignoremessages.split(",")
        
        ignoreClasses = []
        if hasattr(options, "ignoreclasses"):
            optionType = type(options.ignoreclasses).__name__
            if optionType == "list":
                ignoreClasses = options.ignoreclasses
            elif optionType == "str":
                ignoreClasses = options.ignoreclasses.split(",")
        
        self.lintData = self.__parseLintResult(lintResult, ignoreMessages, ignoreClasses)
        
        
    def __getLintResult(self, workdir):
        self.log.info("Running lint in directory %s" %workdir)
        startdir = os.getcwd()
        os.chdir(workdir)
        ret,out,err = util.invokePiped(sys.executable + " generate.py lint")
        
        if (ret > 0):
            raise RuntimeError, "Lint run failed. " + err
        
        os.chdir(startdir)
        return out

    
    def __parseLintResult(self, text, ignoreMessages=[], ignoreClasses=[]):
        self.log.info("Lint parsing lint output")
        self.log.debug("Lint ignoring messages: %s" %repr(ignoreMessages))
        self.log.debug("Lint ignoring classes: %s" %repr(ignoreClasses))
        log = ""
        if (isinstance(text,str)):
            import string
            log = string.split(text,"\n")
        else:
            log = text
          
        data = {}
        for line in log:
            msgre = re.compile('.*\): (.*)$')
            msgma = msgre.match(line)
            msg = None
            if not msgma:
                continue
            msg = msgma.group(1)
            genericmsg = None
            member = None
            hint = None
            (genericmsg, member, hint) = self.__getMessage(msg)      
      
            if not genericmsg:
                self.log.error("Lint.parseLintResult couldn't extract generic message from line:\n" + line)
            if (genericmsg[len(genericmsg)-3:] == " in"):
                genericmsg = genericmsg[0:len(genericmsg)-3]
            
            if genericmsg in ignoreMessages:
                continue
            
            msgid = genericmsg
            if (not msgid in data):
                data[msgid] = []
  
            if (hint[0:2] == "! "):
                hint = hint[2:]
  
            info = {}
            info['member'] = member
            if (hint != ""):
                info['hint'] = hint
            info['path'] = ''
            info['line'] = ''
  
            pathre = re.compile('^.*([\\\/]source[\\\/].*) \(')
            pathma = pathre.match(line)
            if (pathma):
                info['path'] = pathma.group(1)
  
            linecolre = re.compile('.*(\(.*\)).*')
            linecolma = linecolre.match(line)
            if (linecolma):
                info['line'] = linecolma.group(1)
  
            ignoreClass = False
            for cls in ignoreClasses:
                classPath = cls.replace(".","/")
                clsre = re.compile("^.*" + classPath + ".*$")
                clsma = clsre.match(info['path'])
                if (clsma):
                    ignoreClass = True

            if not ignoreClass:
                data[msgid].append(info)  
          
        del_keys = []
        for key, value in data.iteritems():
            if (len(value) == 0):
                del_keys.append(key)
        for k in del_keys:
            del data[k]
      
        return data


    def __getMessage(self,fullmsg):
        genericmsg = None
        member = None
        hint = None
      
        msgre = re.compile("^([\w\- ]+)'([^\s]*)'([\w ]*)[\. ]*(.*)$")
        msgrma = msgre.match(fullmsg)
        if msgrma:        
            genericmsg = msgrma.group(1) + msgrma.group(3)
            if (genericmsg[len(genericmsg)-1] == " "):
                genericmsg = genericmsg[:-1]
            member = msgrma.group(2)
            hint = msgrma.group(4)
    
        return (genericmsg, member, hint)

    
    def getResult(self):
        return self.lintData  
    
    
    def getFlatResult(self):
        flatData = []
        data = self.getResult()
        for message in data:
            for messageDetails in data[message]:
                flatMessage = {
                  "message" : message,
                  "member" : messageDetails["member"],
                  "path" : messageDetails["path"],
                  "line" : messageDetails["line"]
                }
                flatData.append(flatMessage)
        return flatData

    
    def getResultJson(self):
        return json.dumps(self.lintData, sort_keys=True, indent=2)

        

def getComputedConf():
    import optparse
    parser = optparse.OptionParser()
  
    parser.add_option(
        "-w", "--workdir", dest="workdir", default=None, type="string",
        help="Directory to run generate.py lint in."
    )
    
    """
    parser.add_option(
        "-f", "--inputfile", dest="inputfile", default=None, type="string",
        help="Path/name of a lint output file to be processed."
    )
  
    parser.add_option(
        "-o", "--outputfile", dest="outputfile", default=None, type="string",
        help="Path/name of the log file to be written."
    )
  
    parser.add_option(
        "-t", "--mail-to", dest="mailto", default=None, type="string",
        help="Address to send report mail to."
    )
    """
    
    parser.add_option(
        "-c", "--ignore-classes", dest="ignoreclasses", default=None, type="string",
        help="Comma-separated list of classes to ignore."
    )
    
    parser.add_option(
        "-m", "--ignore-messages", dest="ignoremessages", default=None, type="string",
        help="Comma-separated list of lint messages to ignore."
    )
    
    parser.add_option(
        "-r", "--report-server", dest="reportserver", default=None, type="string",
        help="URL of the test report server to which Lint messages will be sent via HTTP request."
    )
  
    (options, args) = parser.parse_args()

    return (options, args)

  
if __name__ == "__main__":
    try:
        rc = 0
        (options,args) = getComputedConf()  
        qxlint = Lint(options)
        try:
            qxlint.reportResults(options.reportserver)
        except AttributeError:
            print qxlint.lintResult
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc = 1
    sys.exit(rc)