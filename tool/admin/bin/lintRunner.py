#!/usr/bin/env python
# -*- coding: utf-8 -*-

################################################################################
#
#    qooxdoo - the new era of web development
#
#    http://qooxdoo.org
#
#    Copyright:
#        2008-2012 1&1 Internet AG, Germany, http://www.1und1.de
#
#    License:
#        LGPL: http://www.gnu.org/licenses/lgpl.html
#        EPL: http://www.eclipse.org/org/documents/epl-v10.php
#        See the LICENSE file in the project's top-level directory for details.
#
#    Authors:
#        * Daniel Wagner (d_wagner)
#
################################################################################

# NAME
#    Lint Runner
#
# DESCRIPTION
#    This script runs qooxdoo's "lint" generator job on a given directory and
#    outputs the result as either a JSON data structure or an HTML report which
#    can optionally be sent by email.

import optparse
import re
import sys
import os
import codecs
try:
    import json
except ImportError, e:
    try:
        import simplejson as json
    except ImportError, e:
        print "No Json module available, quitting!"
        sys.exit(1)

sys.path.append(os.path.join(os.path.dirname(sys.argv[0]), '..', 'app', 'batserver'))
import qxtest

filter_errors = []
filter_classes = []

mailConf = {
    'mailFrom': 'testing@qooxdoo.org',
    'smtpHost': 'smtp.1und1.de',
    'smtpPort': 587
}


class QxLint:
    def __init__(self, options):
        self.options = options

        if (not hasattr(options, "ignoreClasses")):
            self.options.ignoreClasses = filter_classes

        if (not hasattr(options, "ignoreErrors")):
            self.options.ignoreErrors = filter_errors

        if (options.workdir):
            log = self.runLint(options.workdir)

        elif (options.inputfile):
            log = codecs.open(options.inputfile, "r", "utf-8")

        else:
            print("Please choose either: A working directory with the -w option or a file containing ecmalint output with the -f option.")
            sys.exit(1)

        print("Parsing Lint output")
        data = self.parseLog(log)
        self.data = data

        categories = len(data)
        messages = 0
        for key in data:
            messages += len(data[key])
        print("Found " + repr(messages) + " lint issues in " + repr(categories) + " categories")

        if (options.outputfile):
            ext = options.outputfile[(len(options.outputfile) - 4):len(options.outputfile)]
            if (ext == "html"):
                print("Generating HTML output")
                html = self.createHtml(data)
                print("Writing HTML to file " + options.outputfile)
                outfile = codecs.open(options.outputfile, "w", "utf-8")
                outfile.write(html)

            else:
                print("Generating JSON output")
                jsonOut = self.getJson(data)
                print("Writing JSON to file " + options.outputfile)
                outfile = codecs.open(options.outputfile, "w", "utf-8")
                outfile.write(jsonOut)

        elif (options.mailto):
            print("Generating HTML output")
            html = self.createHtml(data)
            self.sendReport(html, options.workdir, repr(messages))

    def runLint(self, workdir):
        if not os.path.isdir(workdir):
            raise RuntimeError("Directory %s does not exist!" % workdir)

        startdir = os.getcwd()
        print("Changing dir to " + workdir)
        os.chdir(workdir)
        print("Running Lint")
        ret, out, err = qxtest.invokePiped("%s generate.py lint" % sys.executable)

        if (ret > 0):
            raise RuntimeError("Lint run failed. " + err)

        print("Changing dir back to " + startdir)
        os.chdir(startdir)
        return err

    def parseLog(self, text):
        msgre = re.compile('(.*?) (\(.*\)): (.*)')
        detailre = re.compile("(.*): '(.*)'")
        log = ""
        if (isinstance(text, str)):
            import string
            log = string.split(text, "\n")
        else:
            log = text

        data = {}
        for line in log:
            msgma = msgre.match(line)
            if (msgma):
                info = {}
                # Class name
                if msgma.group(1):
                    info['path'] = msgma.group(1)
                    if info['path'] in self.options.ignoreClasses:
                        continue

                # Line/column number
                if msgma.group(2):
                    info['line'] = msgma.group(2)

                # Lint issue
                if msgma.group(3):
                    msg = msgma.group(3)

                    if not "core.Environment" in msg and ":" in msg:
                        detail = detailre.match(msg)
                        if detail:
                            msg = detail.group(1)
                            info['member'] = detail.group(2)

                    if not msg in data:
                        data[msg] = []

                    data[msg].append(info)

        return data

    def getMessage(self, fullmsg):
        genericmsg = None
        member = None
        hint = None

        msgre = re.compile("^([\w\- ]+)'([^\s]*)'([\w ]*)[\. ]*(.*)$")
        msgrma = msgre.match(fullmsg)
        if (msgrma):
            genericmsg = msgrma.group(1) + msgrma.group(3)
            if (genericmsg[len(genericmsg) - 1] == " "):
                genericmsg = genericmsg[:-1]
            member = msgrma.group(2)
            hint = msgrma.group(4)

        return (genericmsg, member, hint)

    def createHtml(self, data):
        html = '''<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>qooxdoo Test Report</title>
            <style type="text/css">
                body {
                    font-family: Arial, sans-serif;
                }
                div {
                    display: block;
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
                table {
                    border-collapse: collapse;
                    margin-bottom: 25px;
                }
                td {
                    border: 1px solid black;
                }
                th {
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
            </style>
        </head>
        <body>
        <h1>Lint Report</h1>\n'''

        if (len(self.options.ignoreErrors) > 0):
            html += '<p><strong>Ignored error categories:</strong> ' + repr(self.options.ignoreErrors) + '</p>'

        if (len(self.options.ignoreClasses) > 0):
            html += '<p><strong>Ignored class paths:</strong> ' + repr(self.options.ignoreClasses) + '</p>'

        for k, v in data.iteritems():
            import random
            uid = 'i' + repr(random.randint(9999, 99999))
            html += '<h2>' + k + '</h2>\n'
            html += '<div id="' + uid + '">\n'
            if ("hint" in v[0]):
                html += '    <p><em>' + v[0]["hint"] + '</em></p>\n'
            html += '    <table border="0" cellpadding="0" cellspacing="0">\n'
            html += '        <tr>\n'
            html += '            <th>File</th>\n'
            html += '            <th>Line/Column</th>\n'
            if ("member" in v[0] and v[0]["member"] != "{}"):
                html += '            <th>Member</th>\n'
            #if (v[0]["hint"]):
            #    html += '            <th>Hint</th>\n'
            html += '        </tr>\n'
            for entry in v:
                html += '        <tr>\n'
                html += '            <td>' + entry["path"] + '</td>\n'
                html += '            <td>' + entry["line"] + '</td>\n'
                if ("member" in entry):
                    html += '            <td>' + entry["member"] + '</td>\n'
                #if (entry["hint"]):
                #    html += '            <td>' + entry["hint"] + '</td>\n'
                html += '        </tr>\n'
            html += '    </table>\n'
            html += '</div>\n'

        html += '</body>\n'
        html += '</html>\n'
        return html

    def getJson(self, data):
        import simplejson
        return simplejson.dumps(data, sort_keys=True, indent=2)

    def sendReport(self, html, target=None, messages=None):
        arr = target.split('/')
        app = ""
        if (arr[len(arr) - 1] != ""):
            app = arr[len(arr) - 1].capitalize()
        else:
            app = arr[len(arr) - 2].capitalize()

        mailConf['subject'] = "[qooxdoo-test] Lint " + app

        if (messages):
            mailConf['subject'] += ': ' + messages + ' issues'

        mailConf['html'] = html

        mailConf['mailTo'] = self.options.mailto

        if (html != ""):
            qxtest.sendMultipartMail(mailConf)
        else:
            print("Report HTML seems incomplete, report not sent.")

    def reportResults(self, reportServerUrl, target="", revision="", branch=""):
        import urllib
        import urllib2
        if not reportServerUrl:
            raise RuntimeError("No report server URL specified")
        print("Sending Lint results to report server")

        flatData = []
        for message in self.data:
            for messageDetails in self.data[message]:
                flatMessage = {
                    "message": message,
                    "path": messageDetails["path"],
                    "line": messageDetails["line"],
                    "target": target,
                    "revision": revision,
                    "branch": branch
                }
                if "member" in messageDetails:
                    flatMessage["member"] = messageDetails["member"]
                flatData.append(flatMessage)

        postdata = urllib.urlencode({"lintRun": self.getJson(flatData)})
        req = urllib2.Request(reportServerUrl, postdata)

        try:
                response = urllib2.urlopen(req)
        except urllib2.URLError, e:
                print("Unable to contact report server: Error %s" % e.code)
                errorFile = open("reportingerror_lint.html", "w")
                errorFile.write(e.read())
                errorFile.close()
                return
        except urllib2.HTTPError, e:
                errMsg = ""
                if (e.code):
                        errMsg = repr(e.code)
                print("Report server couldn't store report: %s" % errMsg)
                return

        content = response.read()
        print("Report server response: %s" % content)


def getComputedConf():
    parser = optparse.OptionParser()

    parser.add_option(
        "-w", "--workdir", dest="workdir", default=None, type="string",
        help="Directory to run generate.py lint in."
    )

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

    (options, args) = parser.parse_args()

    return (options, args)


if __name__ == "__main__":
    try:
        rc = 0
        (options, args) = getComputedConf()
        qxlint = QxLint(options)
    except KeyboardInterrupt:
        print
        print "    * Keyboard Interrupt"
        rc = 1
    sys.exit(rc)
