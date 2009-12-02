#!/usr/bin/env python
import re, sys, os, codecs

class QxLogFormat:
  def __init__(self,options):
    self.options = options
    
    if not(os.path.exists(options.logfile)):
      print("Couldn't open Selenium server log file, quitting...")
      sys.exit(1)

    self.totalErrors = 0
    self.failedTests = 0

    logEntries = self.getEntriesFromLogFile(options.logfile)
    self.htmlReport = self.getHtmlReport(logEntries)

  
  def getEntriesFromLogFile(self,logFile):
    log = open(logFile,"r")
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
  
    if (not( len(logs.keys()) > 0 )):
      print("No qxSimulator entries found in " + self.options.logfile + ", quitting")
      sys.exit(1)
    
    return logs
    

  def getFormattedEntries(self, logs):
    logHtml = ""
    for k in sorted(logs.iterkeys()):
      logHtml += '<div id="t_' + k + '">'
      
      for lineIndex, line in enumerate(logs[k]):
        line = unicode(line, errors='replace')
        # Only log the last "Last demo loaded" line for Demobrowser runs.
        if "Last loaded demo: " in line and lineIndex < ( len(logs[k])  - 1 ):
          if not "Last loaded demo: " in logs[k][lineIndex + 1 ]:
            logHtml += '  ' + line
        else:
          logHtml += '  ' + line
      
      logHtml += '</div>'
  
    if (self.failedTests > 0):
      logHtml += '<p class="failedtests">' + str(self.failedTests) + ' Test runs didn\'t finish correctly!</p>'
    logHtml += '<p class="totalerrors">Total errors in report: ' + repr(self.totalErrors) + '</p>'
    
    return logHtml  

  
  def writeHtmlReport(self,htmlReport):
    print("Writing HTML to file " + self.options.htmlfile)
    html = codecs.open(self.options.htmlfile, "w", "utf-8")
    html.write(htmlReport)
    html.close
  

  def getHtmlReport(self,logs):
    htmlHeader = '''<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>qooxdoo Test Report</title><style type="text/css">
body{font-family:Arial,sans-serif}h1{font-size:18px}h1,h2,h3,td,p{padding:8px}h1,h2,h3,td,p,.testResult h3{margin:0}h2{font-size:16px}h3{font-size:14px}.jump{border-collapse:collapse;margin-bottom:25px}.jump td,.jump th{border:1px solid black}.jump th{background:black;color:white}.jump th,td,p{font-size:12px}.jump th,.qxappender .type-array,.qxappender .type-map,.qxappender .type-class,.qxappender .type-instance,.qxappender .type-stringify,.totalerrors,.testResult h3{font-weight:bold}.qxappender{font:11px consolas,"bitstream vera sans mono","courier new",monospace}.qxappender .level-debug{background:white}.qxappender .level-info{background:#deedfa}.qxappender .level-warn{background:#fff7d5}.qxappender .level-error{background:#ffe2d5}.qxappender .level-user{background:#e3efe9}.qxappender .type-string{color:black}.qxappender .type-string,.qxappender .type-number,.qxappender .type-boolean{font-weight:normal}.qxappender .type-number{color:#155791}.qxappender .type-boolean{color:#15bc91}.qxappender .type-array,.qxappender .type-map{color:#cc3e8a}.qxappender .type-key,.qxappender .type-instance,.qxappender .type-stringify{color:#565656}.qxappender .type-key{font-style:italic}.qxappender .type-class{color:#5f3e8a}.qxappender .noerror{background:#a9ff93}.testResult,#sessionlog{font:11px "consolas","courier new",monospace}.testResult{background:lime;padding-top:4px}.testResult,.level-error,.level-warn,.level-info,.level-debug{margin:4px}.testResult h3{font-size:11px;color:#134275;padding-left:4px}.failure,.error{background:#fef4f4;border-left:3px solid #9d1111}.success{background:#faffed;border-left:3px solid #deff83}
</style></head><body>'''
    htmlFooter = '  </body></html>\n'   
    
    tableHtml = self.getHeaderTable(logs)
    entryHtml = self.getFormattedEntries(logs)
    return htmlHeader + tableHtml + entryHtml + htmlFooter 
    
  
  def getHeaderTable(self,logs):
    appre = re.compile('<h1>(.*) results')
    agentre = re.compile('(?s).*<p>User agent: (.*?)</p>')
    platre = re.compile('(?s).*<p>Platform: (.*?)</p>')
    datere = re.compile('from (.*)</h1>')
    errorre = re.compile('with warnings or errors: (\d*?)</p>')
    timere = re.compile('<p>Test run finished in: (.*)</p>')
  
    tableHeader = '''
    <table class="jump">
    <tr>
    <th>App under test</th>
    <th>Browser</th>
    <th>Test host</th>
    <th>Date</th>
    <th>Test duration</th>    
    <th>Test result</th>
    </tr>'''
  
    tableBody = ""
    for k in sorted(logs.iterkeys()):
      entry = "".join(logs[k])
      tableBody += '<tr>'
      appName = "Unnamed application"
      app = appre.search(entry)
      if (app):
        appName = app.group(1)
  
      agent = agentre.search(entry)
  
      browserName = "unidentified browser"
      browser = False
      if (agent):
        browser = self.getBrowser(agent.group(1))
  
      if (browser):
        browserName = browser
      
      platform = "unidentified platform"  
      platma = platre.search(entry)
      if (platma):
        platform = platma.group(1)
  
      dateString = "Date unknown"
      date = datere.search(entry)
      if (date):
        dateString = date.group(1)

      timeString = "Unknown"
      time = timere.search(entry)
      if (time):
        timeString = time.group(1)
  
      cellCol = '#FF0000'
  
      # if there is no "...with warnings or errors..." line in the log output,
      # assume the test didn't finish correctly.
      totalTestErrors = ""
      errors = errorre.search(entry)
      if (errors):
        print("Found " + errors.group(1) + " errors")
        totalTestErrors = errors.group(1)
        self.totalErrors += int(totalTestErrors)
        if (totalTestErrors == "0"):
          cellCol = '#00FF00'
        totalTestErrors += " warnings/errors"
      else:
        self.failedTests += 1
  
      import socket
      hostname = socket.gethostname()
      try:
        host = socket.gethostbyname(hostname)
      except socket.gaierror:
        host = '172.17.12.142'
  
  
      tableBody += '<td><a href="#t_' + k + '">' + appName + '</a></td>'
      tableBody += '<td>' + browserName + ' on ' + platform + '</td>'
      tableBody += '<td>' + host + '</td>'
      tableBody += '<td>' + dateString + '</td>'
      tableBody += '<td>' + timeString + '</td>'
      tableBody += '<td style="align:center; background-color: ' + cellCol + '">' + totalTestErrors + '</td>'
      tableBody += '</tr>'
  
    return tableHeader + tableBody + "</table>"    


  def getBrowser(self,agent):  
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


def getComputedConf():
  import optparse
  parser = optparse.OptionParser()

  parser.add_option(
    "-i", "--input-file", dest="logfile", default="/tmp/selenium.log", type="string",
    help="Selenium Server log file to process"
  )

  parser.add_option(
    "-o", "--output-file", dest="htmlfile", default="selenium-report.html", type="string",
    help="HTML file to create."
  )

  (options, args) = parser.parse_args()

  return (options, args)

  
if __name__ == "__main__":
  try:
    rc = 0
    (options,args) = getComputedConf()  
    logformat = QxLogFormat(options)
  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    rc = 1
  sys.exit(rc)