#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#    * Yuecel Beser (ybeser)
#
################################################################################

##
# NAME
#  nph-qxadmin_cgi.py  -- CGI backend for qooxdoo's BuildTool app
#
# SYNTAX
#  http://localhost:8000/path/to/buildtool/bin/nph-qxamdin_cgi.py
#
# DESCRIPTION
#  The module 
#
# CAVEATS
#  - the 'nph-...' name is retained so it would run seamlessly under Apache or
#    other nph-capable web servers that look for the name to detect a
#    no-parsed-header script.
#
##

import sys, os, re, string, webbrowser, subprocess, ctypes

# calculate script path
scriptDir = os.path.dirname(os.path.abspath(sys.argv[0]))
print scriptDir
# extend PYTHONPATH with 'pylib'
sys.path.insert(0, 
    os.path.normpath(
        os.path.join( scriptDir, os.pardir, os.pardir, os.pardir, os.pardir, "tool", "pylib")))
print sys.path

from generator.runtime.Log import Log
#from time import *
## module import
##sys.path.append(os.path.join('tool', 'bin'))
##from createapplication import createApplication

import cgi
#import cgitb; cgitb.enable()


def invoke_external(cmd):
    import subprocess
    myProc = subprocess.Popen(cmd, shell=True,
                         stdout=sys.stdout,
                         stderr=subprocess.STDOUT)
    return myProc.wait()

global myProc

def invoke_piped(cmd):
    import subprocess
    myProc = subprocess.Popen(cmd, shell=True,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE,
                         universal_newlines=True)
    
    output, errout = myProc.communicate()
    rcode = myProc.returncode
    return (rcode, output, errout)




def dispatch_action(form): 
    if 'action' in form:
        action = form['action'].value
        if (action == 'create'):
          print "Content-type: text/plain"
          print
          createNewApplication(form)
        elif (action == 'generate_Source'): # generate source
            print "Content-type: text/plain"  
            print
            generateSource(form)
        elif (action == 'generate_Api'): # generate api
            print "Content-type: text/plain" 
            print
            generateApi(form)
        elif (action == 'open_In_Browser'):
            print "Content-type: text/plain"  
            print
            open_in_browser(form)
        elif (action == 'make_Pretty'): 
            print "Content-type: text/plain"  
            print
            makePretty(form)
        elif (action == 'validate_Code'): 
            print "Content-type: text/plain"  
            print
            validateCode(form)
        elif (action == 'show_Configuration'): 
            print "Content-type: text/plain"  
            print
            showConfiguration(form)
        elif (action == 'save_Configuration'): 
            print "Content-type: text/plain"  
            print
            saveConfiguration(form)
        elif (action == 'generate_Build'): 
            print "Content-type: text/plain"  
            print
            generateBuild(form) 
        elif (action == 'test_Application'): 
            print "Content-type: text/plain"  
            print
            testApplication(form) 
        elif (action == 'test_Source'): 
            print "Content-type: text/plain"  
            print
            testSource(form) 
        elif (action == 'abort_Process'): # TODO TODO TODO TODO TODO 
            print "Content-type: text/plain"  
            print
            print "myProc: " + str(myProc.pid)
#            subprocess.Popen(['taskkill', myProc.pid])      
        else:
            print "Content-type: text/plain"
            print
            print "Wrong action: %s" % action
    else:
        print "Content-type: text/plain"
        print
        print 'alert("no action!");'





def showConfiguration(form):
    sys.stdout.flush()
    
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'    
    
    list = open(myPath+myName+"\config.json", 'r').readlines()
    input = "".join(list)
    #input = "{ " + input + " }"

    print input
    return input

def saveConfiguration(form):
    sys.stdout.flush()
    
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'
    changedConfig = ""
    if 'changedConfig' in form:
        changedConfig = form['changedConfig'].value #changedConfig
    
    uCode = unicode(str(changedConfig))
    
    confFile = open(myPath+myName+"\config.json", 'w')
    confFile.write(uCode)

    

def testApplication(form):
    sys.stdout.flush()
    
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'    
    
    if 'cygwin' in form:
        #print "Content-type: text/plain"
        #print 'In CYGWIN'
        parts = form['cygwin'].value.split('\\')
        pypath = os.path.join(*parts)
        pypath = os.path.join(pypath,'bin','python.exe')
        pypath = pypath.replace(':', ':/')
        pypath = pypath.replace('\\', '/')
        
        libraryPath = os.getcwd().replace(":", "").replace("\\", "/").replace(' ', '" "')
        cmd = pypath +' /cygdrive/'+ 'c/tmp/'+myName+'/./generate.py test'
    else:
        makecmd = sys.executable +' ' + myPath+myName+'\\generate.py test' 
        cmd = makecmd
    
    (rcode, output, error) = invoke_piped(cmd)
    output = output.replace('"', "'")

    result = ' { testApp_state: ' + repr(rcode) + ', testApp_output: "' + output + '", testApp_error: "' + error + '" }'
    result = result.replace("\n", "<br/>")
    result = result.replace("\\", "/");
    result = result.replace("//", "/");
    print result
    return result



def testSource(form):
    sys.stdout.flush()
    
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'    
    
    if 'cygwin' in form:
        #print "Content-type: text/plain"
        #print 'In CYGWIN'
        parts = form['cygwin'].value.split('\\')
        pypath = os.path.join(*parts)
        pypath = os.path.join(pypath,'bin','python.exe')
        pypath = pypath.replace(':', ':/')
        pypath = pypath.replace('\\', '/')
        
        libraryPath = os.getcwd().replace(":", "").replace("\\", "/").replace(' ', '" "')
        cmd = pypath +' /cygdrive/'+ 'c/tmp/'+myName+'/./generate.py test-source'
    else:
        makecmd = sys.executable +' ' + myPath+myName+'\\generate.py test-source' 
        cmd = makecmd
    
    (rcode, output, error) = invoke_piped(cmd)
    output = output.replace('"', "'")

    result = ' { test_state: ' + repr(rcode) + ', test_output: "' + output + '", test_error: "' + error + '" }'
    result = result.replace("\n", "<br/>")
    result = result.replace("\\", "/");
    result = result.replace("//", "/");
    print result
    return result




def generateBuild(form):
    sys.stdout.flush()
    
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'    
    
    if 'cygwin' in form:
        #print "Content-type: text/plain"
        #print 'In CYGWIN'
        parts = form['cygwin'].value.split('\\')
        pypath = os.path.join(*parts)
        pypath = os.path.join(pypath,'bin','python.exe')
        pypath = pypath.replace(':', ':/')
        pypath = pypath.replace('\\', '/')
        
        libraryPath = os.getcwd().replace(":", "").replace("\\", "/").replace(' ', '" "')
        cmd = pypath +' /cygdrive/'+ 'c/tmp/'+myName+'/./generate.py build'
    else:
        makecmd = sys.executable +' ' + myPath+myName+'\\generate.py build' 
        cmd = makecmd
    
    (rcode, output, error) = invoke_piped(cmd)
    output = output.replace('"', "'")

    result = ' { build_state: ' + repr(rcode) + ', build_output: "' + output + '", build_error: "' + error + '" }'
    result = result.replace("\n", "<br/>")
    result = result.replace("\\", "/");
    result = result.replace("//", "/");
    print result
    return result



def validateCode(form):
    sys.stdout.flush()
    
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'    
    
    if 'cygwin' in form:
        #print "Content-type: text/plain"
        #print 'In CYGWIN'
        parts = form['cygwin'].value.split('\\')
        pypath = os.path.join(*parts)
        pypath = os.path.join(pypath,'bin','python.exe')
        pypath = pypath.replace(':', ':/')
        pypath = pypath.replace('\\', '/')
        
        libraryPath = os.getcwd().replace(":", "").replace("\\", "/").replace(' ', '" "')
        cmd = pypath +' /cygdrive/'+ 'c/tmp/'+myName+'/./generate.py lint'
    else:
        makecmd = sys.executable +' ' + myPath+myName+'\\generate.py lint' 
        cmd = makecmd
    
    (rcode, output, error) = invoke_piped(cmd)
    output = output.replace('"', "'")

    result = ' { val_state: ' + repr(rcode) + ', val_output: "' + output + '", val_error: "' + error + '" }'
    result = result.replace("\n", "<br/>")
    result = result.replace("\\", "/");
    result = result.replace("//", "/");
    print result
    return result



def makePretty(form):
    sys.stdout.flush()
    
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'    
    
    if 'cygwin' in form:
        #print "Content-type: text/plain"
        #print 'In CYGWIN'
        parts = form['cygwin'].value.split('\\')
        pypath = os.path.join(*parts)
        pypath = os.path.join(pypath,'bin','python.exe')
        pypath = pypath.replace(':', ':/')
        pypath = pypath.replace('\\', '/')
        
        libraryPath = os.getcwd().replace(":", "").replace("\\", "/").replace(' ', '" "')
        cmd = pypath +' /cygdrive/'+ 'c/tmp/'+myName+'/./generate.py pretty'
    else:
        makecmd = sys.executable +' ' + myPath+myName+'\\generate.py pretty' 
        cmd = makecmd
    
    (rcode, output, error) = invoke_piped(cmd)
    output = output.replace('"', "'")

    result = ' { pretty_state: ' + repr(rcode) + ', pretty_output: "' + output + '", pretty_error: "' + error + '" }'
    result = result.replace("\n", "<br/>")
    result = result.replace("\\", "/");
    result = result.replace("//", "/");
    print result
    return result



def open_in_browser(form):
    sys.stdout.flush()
    
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'
    if 'location' in form:
        location = form['location'].value     
    
    filename = myPath + myName + "/"+location+"/index.html"
    #os.startfile(filename)
    webbrowser.open_new_tab("file://" + filename)
    



def generateApi(form):
    sys.stdout.flush()
    
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'    
    
    if 'cygwin' in form:
        #print "Content-type: text/plain"
        #print 'In CYGWIN'
        parts = form['cygwin'].value.split('\\')
        pypath = os.path.join(*parts)
        pypath = os.path.join(pypath,'bin','python.exe')
        pypath = pypath.replace(':', ':/')
        pypath = pypath.replace('\\', '/')
        
        libraryPath = os.getcwd().replace(":", "").replace("\\", "/").replace(' ', '" "')
        cmd = pypath +' /cygdrive/'+ 'c/tmp/'+myName+'/./generate.py api'
        #cmd = cmd.replace(' ', '" "')
        #print cmd
    else:
        makecmd = sys.executable +' ' + myPath+myName+'\\generate.py api' 
        cmd = makecmd
    
    (rcode, output, error) = invoke_piped(cmd)
    output = output.replace('"', "'")

    result = ' { api_state: ' + repr(rcode) + ', api_output: "' + output + '", api_error: "' + error + '" }'
    result = result.replace("\n", "<br/>")
    result = result.replace("\\", "/");
    result = result.replace("//", "/");
    print result
    return result



def generateSource(form):
    sys.stdout.flush()
    
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'    
    
    if 'cygwin' in form:
        #print "Content-type: text/plain"
        #print 'In CYGWIN'
        parts = form['cygwin'].value.split('\\')
        pypath = os.path.join(*parts)
        pypath = os.path.join(pypath,'bin','python.exe')
        pypath = pypath.replace(':', ':/')
        pypath = pypath.replace('\\', '/')
        
        libraryPath = os.getcwd().replace(":", "").replace("\\", "/").replace(' ', '" "')
        cmd = pypath +' /cygdrive/'+ 'c/tmp/'+myName+'/./generate.py source'
        print cmd
    else:
        makecmd = sys.executable +' ' + myPath+myName+'\\generate.py source' 
        cmd = makecmd
    
    (rcode, output, error) = invoke_piped(cmd)
    output = output.replace('"', "'")

    result = '{ gen_state: ' + repr(rcode) + ', gen_output: "' + output + '", gen_error: "' + error + '" }'
    result = result.replace("\n", "<br/>")
    result = result.replace("\\", "/");
    result = result.replace("//", "/");
    print result
    return result





def createNewApplication(form):
    myName = ""
    myPath = ""
    myNamespace = ""
    myLogfile = ""
    myType = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
    if 'myNamespace' in form:
        myNamespace = form['myNamespace'].value #NameSpace
    if 'myLogfile' in form:
        myLogfile = form['myLogfile'].value #LogFile
    if 'myType' in form:
        myType = form['myType'].value #type
 
    if myName != "":
       myName = "--name="+myName
    if myPath != "":
       myPath = "--out="+myPath
    if myNamespace != "":
       myNamespace = "--namespace="+myNamespace
    if myLogfile != "":
       myLogfile = "--logfile="+myLogfile
    if myType != "":
       myType = "--type="+myType

    sys.stdout.flush()
 
    if 'cygwin' in form:
        #print "Content-type: text/plain"
        #print 'In CYGWIN'
        parts = form['cygwin'].value.split('\\')
        pypath = os.path.join(*parts)
        pypath = os.path.join(pypath,'bin','python.exe')
        pypath = pypath.replace(':', ':\\')
        libraryPath = os.getcwd().replace(":", "").replace("\\", "/").replace(' ', '" "')
        cmd = pypath+' /cygdrive/'+ libraryPath + '/tool/bin/create-application.py '+ myLogfile + ' ' + myPath + ' ' + myName + ' ' + myNamespace + ' ' + myType    
        #print cmd wenn das laeuft, dann wird im fenster nichts ausgegeben
    else:
        makecmd = 'tool\\bin\\create-application.py ' + myLogfile + ' ' + myPath + ' ' + myName + ' ' + myNamespace + ' ' + myType 
        cmd = makecmd

    (rcode, output, error) = invoke_piped(cmd)
    output = output.replace('"', "'")
    global result
    result = '{ state: ' + repr(rcode) + ', output: "' + output + '", error: "' + error + '"} '
    result = result.replace("\n", "<br/>")
    result = result.replace("\\", "/");
    result = result.replace("//", "/");
    print result
    return result



    
def emit_http_headers():
    # since we're nph, provide the minimal HTTP headers here
    #server_protocol = os.environ['SERVER_PROTOCOL']
    #server_software = os.environ['SERVER_SOFTWARE']
    # but CGIHTTPServer prints headers anyway, and still piping the output :-)
    #print "%s 200 OK" % server_protocol
    #print "Server: %s" % server_software
    # "Content-type: text/html\n\n" to be supplied by worker function
    pass

def process_parms():
    query = cgi.FieldStorage()
    return query

def fix_env(form):
    "Mostly patch PATH so everything will be found"
    if sys.platform == 'cygwin':  # on cygwin, webserver will not supply '/usr/bin'
        os.environ['PATH'] = '/usr/bin:'+os.environ['PATH']
    
    
def main():
    
    # Initialize console
    global console
    console = Log('toolbox.log', "info")
    
    form = process_parms()
    emit_http_headers()
    fix_env(form)
    dispatch_action(form)
    

if __name__ == "__main__":
    try:
        result = main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        result = 1
    sys.exit(result)
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    