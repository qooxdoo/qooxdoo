#!/usr/bin/env python

# BAT Server - qooxdoo Build And Test server

import sys
import SimpleXMLRPCServer

servconf = {
    'bathost'  : '172.17.12.117',
    'batport'  : 8000,
    'downloadhost'  : '172.17.12.117',
    'downloadport'  : 80,
    'reportfile'    : "bat_client_reports.log"
}

workpackopts = [
    '--unpack-only'
]


class ServFunctions(object):
    def __init__(self):
        import string
        self.python_string = string
    
    def register_client(self,clientconf):
        import time
        print >>rfile,'Registering Client with ClientConf:'
        for m in clientconf:
            print >>rfile, m + " : " + repr(clientconf[m])
        jobid = time.time()
        return (jobid, "http://" + servconf['downloadhost'] + "/downloads/workpack1.py", workpackopts)
    
    def receive_report(self,jobid,clientreport):
        #rfile = open(servconf['reportfile'], 'a')
        rfile.write(repr(jobid)+": ")
        rfile.write(clientreport)
        #rfile.close()
        return 1

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
