#!/usr/bin/env python
import re, sys, os

class QxLogFormat:
  def __init__(self,options):
    self.options = options
    
    if not(os.path.exists(options.logfile)):
      print("Couldn't open Selenium server log file, quitting...")
      sys.exit(1)

    self.formatLog()

  def formatLog(self):
    log = open(self.options.logfile,"r")
    html = open(self.options.htmlfile, "w")
  
    htmlHeader = '''<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>qooxdoo Test Report</title>
        <style type="text/css">
          body {
            font-family: Arial, sans-serif;
          }
          h1 {
            font-size: 18px;
            padding: 8px;
            margin: 0;
          }
          h2 {
            font-size: 16px;
            padding: 8px;
            margin: 0;
          }
          h3 {
            font-size: 14px;
            padding: 8px;
            margin: 0;
          }
          .jump {
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .jump td {
            border: 1px solid black;
          }
          .jump th {
            font-size: 12px;
            font-weight: bold;
            color: white;
            background-color: black;
            border: 1px solid black;
          }
          p, td {
            font-size: 12px;
            padding: 8px;
            margin: 0;
          }
          .qxappender{
            font-family:Consolas,"Bitstream Vera Sans Mono","Courier New",monospace;
            font-size:11px;
          }
          .qxappender .level-debug{background:white}
          .qxappender .level-info{background:#DEEDFA}
          .qxappender .level-warn{background:#FFF7D5}
          .qxappender .level-error{background:#FFE2D5}
          .qxappender .level-user{background:#E3EFE9}
          .qxappender .type-string{color:black;font-weight:normal;}
          .qxappender .type-number{color:#155791;font-weight:normal;}
          .qxappender .type-boolean{color:#15BC91;font-weight:normal;}
          .qxappender .type-array{color:#CC3E8A;font-weight:bold;}
          .qxappender .type-map{color:#CC3E8A;font-weight:bold;}
          .qxappender .type-key{color:#565656;font-style:italic}
          .qxappender .type-class{color:#5F3E8A;font-weight:bold}
          .qxappender .type-instance{color:#565656;font-weight:bold}
          .qxappender .type-stringify{color:#565656;font-weight:bold}
          .qxappender .noerror{background-color:#A9FF93}
  
          .testResult{
            font-family: "Consolas", "Courier New", monospace;
            font-size: 11px;
            margin: 4px;
            padding-top:4px;
            background-color:lime;
          }
  
          .totalerrors {
            font-weight: bold;
          }
  
          .testResult h3{
            font-size: 11px;
            font-weight: bold;
            color: #134275;
            padding-left:4px;
            margin: 0;
          }
  
          .error,
          .failure{
            background-color: #FEF4F4;
            border-left: 3px solid #9D1111;
          }
  
          .success{
            background-color: #FAFFED;
            border-left: 3px solid #DEFF83;
          }
  
          #sessionlog{
            font-family: "Consolas", "Courier New", monospace;
            font-size: 11px;
          }
  
          .level-debug,
          .level-info,
          .level-warn,
          .level-error{
            margin: 4px;
          }
        </style>
      </head>
      <body>\n'''
  
    htmlFooter = '  </body>\n'
    htmlFooter+= '</html>\n'
  
    logs = {}
    logre = re.compile('.*browserSideLog - qxSimulator_(\d*): (.*)')
  
    # group log entries by date
    for line in log:
      found = logre.match(line)
      if found:
        if found.group(1) in logs.keys():
          logs[found.group(1)] = logs[found.group(1)] + found.group(2) + "\n"
        else:
          logs[found.group(1)] = found.group(2) + "\n"
    log.close
  
    if (not( len(logs.keys()) > 0 )):
      print("No qxSimulator entries found in " + self.options.logfile + ", quitting")
      sys.exit(1)
  
    totalErrors = 0
    failedTests = 0
  
    print("Writing HTML to file " + self.options.htmlfile)
  
    html.write(htmlHeader)
  
  
    appre = re.compile('<h1>(.*) results')
    agentre = re.compile('(?s).*<p>User agent: (.*?)</p>')
    platre = re.compile('(?s).*<p>Platform: (.*?)</p>')
    datere = re.compile('from (.*)</h1>')
    errorre = re.compile('with warnings or errors: (\d*?)</p>')
  
    html.write('<table class="jump">\n')
    html.write('  <tr>')
    html.write('    <th>App under test</th>')
    html.write('    <th>Browser</th>')
    html.write('    <th>Test host</th>')
    html.write('    <th>Date</th>')
    html.write('    <th>Test result</th>')
    html.write('  </tr>')
  
    for k in sorted(logs.iterkeys()):
      html.write('  <tr>\n')
      appName = "Unnamed application"
      app = appre.search(logs[k])
      if (app):
        appName = app.group(1)
  
      agent = agentre.search(logs[k])
  
      browserName = "unidentified browser"
      browser = False
      if (agent):
        browser = self.getBrowser(agent.group(1))
  
      if (browser):
        browserName = browser
      
      platform = "unidentified platform"  
      platma = platre.search(logs[k])
      if (platma):
        platform = platma.group(1)
  
      dateString = "Date unknown"
      date = datere.search(logs[k])
      if (date):
        dateString = date.group(1)
  
      cellCol = '#FF0000'
  
      # if there is no "...with warnings or errors..." line in the log output,
      # assume the test didn't finish correctly.
      totalTestErrors = ""
      errors = errorre.search(logs[k])
      if (errors):
        print("Found " + errors.group(1) + " errors")
        totalTestErrors = errors.group(1)
        totalErrors += int(totalTestErrors)
        if (totalTestErrors == "0"):
          cellCol = '#00FF00'
        totalTestErrors += " warnings/errors"
      else:
        failedTests += 1
  
      import socket
      hostname = socket.gethostname()
      try:
        host = socket.gethostbyname(hostname)
      except socket.gaierror:
        host = '172.17.12.142'
  
  
      html.write('    <td><a href="#t_' + k + '">' + appName + '</a></td>\n')
      html.write('    <td>' + browserName + ' on ' + platform + '</td>\n')
      html.write('    <td>' + host + '</td>\n')
      html.write('    <td>' + dateString + '</td>\n')
      html.write('    <td style="align:center; background-color: ' + cellCol + '">' + totalTestErrors + '</td>\n')
      html.write('  </tr>\n')
  
    html.write('</table>\n')
  
    for k in sorted(logs.iterkeys()):
      html.write('\n<div id="t_' + k + '">\n')
      html.write('  ' + logs[k])
      html.write('</div>\n')
  
    if (failedTests > 0):
      html.write('<p class="failedtests">' + str(failedTests) + ' Test runs didn\'t finish correctly!</p>')
    html.write('<p class="totalerrors">Total errors in report: ' + repr(totalErrors) + '</p>' )
    html.write(htmlFooter)
  
    html.close

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