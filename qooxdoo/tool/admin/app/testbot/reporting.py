#! /usr/bin/env python

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

import urllib
import urllib2
import util

def sendResultToReportServer(reportServerUrl, data, resultType = "testRun" ):
    if type(data).__name__ != "str":
        data = util.getJson(data)
    
    postdata = urllib.urlencode({resultType : data})
    req = urllib2.Request(reportServerUrl, postdata)
    
    try:
        response = urllib2.urlopen(req)    
    except urllib2.URLError, e:
        try:
            fileName = "reportservererror_%s.html" %util.getTimestamp()
            errorFile = open(fileName, "w")
            errorFile.write(e.read())
            errorFile.close()
        except Exception:
            pass
        raise RuntimeError, e
      
    return response.read()