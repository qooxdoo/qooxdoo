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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

# NAME
#  BAT Server - qooxdoo Build And Test server
#
# DESCRIPTION
#  The purpose of this program is to implement the server part of a simple
#  network client-server scenario. The purpose of this server is to accept
#  client connections and to exchange information about jobs to run (so called
#  "workpackages") and the results of these runs. The client first registers
#  itself with the server, possibly providing some details about its nature and
#  the kind of job it is willing to take. The server then responds with the
#  location of a workpackage that should be run by the client. After the client
#  has run the workpackage it reports the results back to the server which does
#  some logging etc. - That's the basic protocol.

import sys, os, platform
import SimpleXMLRPCServer
import re

servconf = {
    'bathost'       : '172.17.12.142',
    'batport'       : 8000,
    'downloadhost'  : '172.17.12.142',
    'downloadport'  : 80,
    'reportfile'    : "bat_client_reports.log",
    'defaultTarget' : 'qooxdoo-0.8-sdk',
}

workpackopts = [
    #"--autPath /qx/tags/release_0_8_1/qooxdoo/framework/test/index.html"
    "--autPath /qx/trunk/qooxdoo/framework/test/index.html"
]


class ServFunctions(object):
    def __init__(self):
        import string
        self.python_string = string
    
    def register_client(self,clientconf):
        import time
        print >>rfile,'Registering Client with ClientConf:'
        for m in clientconf:
            print >>rfile, "\t" + m + " : " + repr(clientconf[m])
        rfile.flush()
        jobid = time.time()
        wpopts = list(workpackopts)  # init workpackoptions with global
        selectWorkOpts(clientconf,wpopts)
        return (jobid, "http://" + servconf['downloadhost'] + "/~dwagner/workspace/qooxdoo.trunk/tool/app/batserver/workpack_test.py", wpopts)
    
    def receive_report(self,jobid,clientreport):
        rfile.write(repr(jobid)+": ")
        rfile.write(clientreport)
        rfile.write(os.linesep)
        rfile.flush()
        return 0

def selectWorkOpts(clientconf,wpopts):
    # select package
    wpopts.append('--package-name')
    if ('target' in clientconf) and (clientconf['target'] != None):
        wpopts.append(clientconf['target']) # maybe override?
    else:
        wpopts.append(servconf['defaultTarget']) # here we could use more elab. selection, e.g. the newest archive

    # select archive format
    wpopts.append('--archive-format')
    if clientconf['packarch'] != None:
        wpopts.append(clientconf['packarch'])
    else:
        if re.search('win',clientconf['platform'],re.I):
            wpopts.append('.zip')
        else:
            wpopts.append('.tar.gz')

    # select work dir
    if 'work_dir' in clientconf:
        wpopts.append('--work-dir')
        wpopts.append(clientconf['work_dir'])

    # select amount of work
    if clientconf['unpack_only']:
        wpopts.append('--unpack-only')

    return

def main():
    global rfile
    server = SimpleXMLRPCServer.SimpleXMLRPCServer((servconf["bathost"],servconf['batport']))
    server.register_instance(ServFunctions(), allow_dotted_names = True)
    server.register_introspection_functions()
    #server.list_public_methods()
    rfile = open(servconf['reportfile'], 'a')
    server.serve_forever()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        sys.exit(1)
