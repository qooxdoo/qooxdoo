#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007-2009 1&1 Internet AG, Germany, http://www.1und1.de
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

import sys, os, re, codecs

def parse(logFile=None):
  if not logFile:
    print("No log file specified, quitting.")
    sys.exit(1)
  
  if not(os.path.exists(logFile)):
    print("Specified log file does not exist, quitting.")
    sys.exit(1)
  
  try:
    log = open(logFile, "r")
  except:
    print("Couldn't open simulation log file, quitting.")
    sys.exit(1)
    
  simulationDict = getSimulationDict(log)
  simulationsArray = parseLogDict(simulationDict)

  return simulationsArray
    

def getSimulationDict(log):
  logs = {}
  logre = re.compile('.*browserSideLog - qxSimulator_(\d*): (.*)')
  logre2 = re.compile('qxSimulator_(\d+):[ "\+\']+(.*)')

  # group log entries by date
  for line in log:
    found = logre.match(line)
    if not found:
      found = logre2.match(line)
    
    if found:
      if found.group(1) in logs.keys():
        if not (found.group(2) + "\n") in logs[found.group(1)]:
          logs[found.group(1)].append(found.group(2) + "\n")
      else:
        logs[found.group(1)] = [found.group(2) + "\n"]
  log.close
  
  return logs


def parseLogDict(logs):
  simulationsArray = []
  
  agentre = re.compile('(?s).*<p>User agent: (.*?)</p>')  
  datere = re.compile('from (.*)</h1>')
  errorre = re.compile('with warnings or errors: (\d*?)</p>')
  durationre = re.compile('<p>Test run finished in: (.*)</p>')
  
  for k in sorted(logs.iterkeys()):    
    simulationDict = {
      "browser" : "Unknown",
      "selenium_version" : "Unknown",
      "failed" : True,
      "start_date" : "1970-01-01_00-00-00",
      "end_date" : "1970-01-01_00-00-00",
      "net_duration" : "unknown",
      "logentries" : []
    }
    
    entry = "".join(logs[k])

    agent = agentre.search(entry)    
    if (agent):
      simulationDict["browser"] = getBrowser(agent.group(1))

    # TODO: Use standard date format in simulation logger
    #date = datere.search(entry)
    #if (date):
    #  simulationDict["start_date"] = date.group(1)

    duration = durationre.search(entry)
    if (duration):
      simulationDict["net_duration"] = duration.group(1)
    
    errors = errorre.search(entry)
    if errors:
      simulationDict["failed"] = False
      
    logentryData = getLogentryArray(logs[k])    
    simulationDict["logentries"] = logentryData
    
    dateMatch = datere.search(entry)
    if dateMatch:
      rawDate = dateMatch.group(1)
      stringDate = rawDate.replace(" ", "_")
      stringDate = stringDate.replace(":", "-")
      simulationDict["start_date"] = stringDate
            
    simulationsArray.append(simulationDict)
  
  return simulationsArray  


def getLogentryArray(logEntries):
  logentryArray = []  
  for entry in logEntries:    
  #  if 'class="qxappender"' in entry:
    if 'level-' in entry or "testResult failure" in entry:
      entryDict = {
        "level" : "info",
        "message" : entry
      }
      if "level-error" in entry or "testResult failure" in entry:
        entryDict["level"] = "error"
      elif "level-warn" in entry:
        entryDict["level"] = "warn"
      elif "level-info" in entry:
        entryDict["level"] = "info"
      elif "level-debug" in entry:
        entryDict["level"] = "debug"
      
      
      logentryArray.append(entryDict)
  return logentryArray



def getBrowser(agent):  
  browser = False
  regFF = re.compile('.*(Firefox)\/([\d\.]*)')
  match = regFF.match(agent)
  if (match):
    browser = match.group(1) + " " + match.group(2)

  if (not(browser)):
    regOp = re.compile('.*(Opera)\/([\d\.]*)')
    match = regOp.match(agent)
    if (match):
      regOpTen = re.compile('.*(Opera).*Version\/([\d\.]+)$')
      matchTen = regOpTen.match(agent)
      if matchTen:
        browser = matchTen.group(1) + " " + matchTen.group(2)
      else:
        browser = match.group(1) + " " + match.group(2)

  if (not(browser)):
    regIe8Comp = re.compile('.*MSIE 7\.0.*(Trident)')
    match = regIe8Comp.match(agent)
    if (match):
      browser = "Internet Explorer 8 in IE7 compatibility mode"

    regIe8Std = re.compile('.*MSIE 8\.0.*(Trident)/')
    match1 = regIe8Std.match(agent)
    if (match1):
      browser = "Internet Explorer 8 in standards mode"

    if (not(browser)):
      regIe = re.compile('.*MSIE ([\d\.]*)')
      match2 = regIe.match(agent)
      if (match2):
        browser = "Internet Explorer " + match2.group(1) 

  if (not(browser)):
    regCh = re.compile('.*(Chrome)\/([\d\.]*)')
    match = regCh.match(agent)
    if (match):
      browser = match.group(1) + " " + match.group(2)

  if (not(browser)):
    regSa = re.compile('.*Version\/([\d\.]+).*(Safari)')
    match = regSa.match(agent)
    if (match):
      browser = match.group(2) + " " + match.group(1)
      
  if (not(browser)):
    browser = agent

  return browser


if __name__ == "__main__":
  try:
    rc = 0
  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    rc = 1
  sys.exit(rc)