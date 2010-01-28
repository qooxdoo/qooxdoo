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
#    * Daniel Wagner (d_wagner)
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
import optparse
import SimpleXMLRPCServer
import socket
import re

servconf = {
    'bathost'       : '172.17.12.142',
    'batport'       : 8000,
    'downloadhost'  : '172.17.12.142',
    'downloadport'  : 80,
    'downloaddir'   : '/~dwagner/workspace/qooxdoo.trunk/tool/app/batserver/',
    'workpack'      : 'workpack_test.py',
    'reportfile'    : "bat_client_reports.log",
    'defaultTarget' : 'qooxdoo-1.0-sdk',
}

workpackopts = [
    #"--autPath /qx/tags/release_0_8_1/qooxdoo/framework/test/index.html"
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
        selectWorkOpts(clientconf,wpopts,server_opts)
        return (jobid, "http://" + servconf['downloadhost'] + servconf['downloaddir'] + servconf['workpack'], wpopts)
    
    def receive_report(self,jobid,clientreport):
        rfile.write(repr(jobid)+": ")
        rfile.write(clientreport)
        rfile.write(os.linesep)
        rfile.flush()
        return 0
    
def getServerOpts():
    parser = optparse.OptionParser()
    
    parser.add_option(
        "-a", "--aut-host", dest="aut_host", default="http://" + servconf['bathost'], type="string",
        help="Host of the application to be tested by the client, e.g. http://example.com"
    )
    
    parser.add_option(
        "-r", "--aut-port", dest="aut_port", default=None, type="string",
        help="Host of the application to be tested by the client, e.g. http://example.com"
    )
    
    parser.add_option(
        "-q", "--qx-path", dest="qx_path", default=None, type="string",
        help="Qooxdoo path on the host"
    )
    
    (options, args) = parser.parse_args()

    return options    

def selectWorkOpts(clientconf,wpopts,server_opts):
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
    
    if('selenium_script' in clientconf and clientconf['selenium_script'] != None):
        wpopts.append('--selenium-script')
        wpopts.append(clientconf['selenium_script'])
        
    if('classpath' in clientconf and clientconf['classpath'] != None):
        wpopts.append('--java-classpath')
        wpopts.append(clientconf['classpath'])

    if('logformatter' in clientconf and clientconf['logformatter'] != None):
        wpopts.append('--log-formatter')
        wpopts.append(clientconf['logformatter'])
        
    if('autpath' in clientconf and clientconf['autpath'] != None):
        wpopts.append('--autPath')
        wpopts.append(clientconf['autpath'])
        
    if('testbrowsers' in clientconf and clientconf['testbrowsers'] != None):
        wpopts.append('--testBrowsers')
        wpopts.append(clientconf['testbrowsers'])
    
    if server_opts.aut_host:
        wpopts.append("--autHost")
        wpopts.append(server_opts.aut_host)  
        
    if server_opts.aut_port:
        wpopts.append("--autPort")
        wpopts.append(server_opts.aut_port)
        
    if server_opts.qx_path:
        wpopts.append("--qxPath")
        wpopts.append(server_opts.qx_path)              

    return

def main():
    global rfile
    global server_opts
    try:
        server = SimpleXMLRPCServer.SimpleXMLRPCServer((servconf["bathost"],servconf['batport']))
        server.register_instance(ServFunctions(), allow_dotted_names = True)
        server.register_introspection_functions()
        #server.list_public_methods()
        rfile = open(servconf['reportfile'], 'a')
        server_opts = getServerOpts()
        server.serve_forever()
    except socket.error, e:
        print "Error creating socket: %s" % e


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        sys.exit(1)
