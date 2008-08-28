#!/usr/bin/env python

# BAT Server - qooxdoo Build And Test server

import sys, os, platform
import SimpleXMLRPCServer
import re

servconf = {
    'bathost'       : '172.17.12.117',
    'batport'       : 8000,
    'downloadhost'  : '172.17.12.117',
    'downloadport'  : 80,
    'reportfile'    : "bat_client_reports.log",
    'defaultTarget' : 'qooxdoo-0.8-sdk',
}

workpackopts = [
    #'--unpack-only'
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
        return (jobid, "http://" + servconf['downloadhost'] + "/downloads/workpack1.py", wpopts)
    
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
