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

import sys, os, re, string, subprocess, webbrowser, ctypes

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
    global myProc
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
        elif (action == 'generate'):
            print "Content-type: text/plain" 
            print
            generateTarget(form)    
        elif (action == 'open_In_Browser'):
            print "Content-type: text/plain" 
            print
            openInBrowser(form)
        elif (action == 'show_Configuration'): 
            print "Content-type: text/plain"  
            print
            showConfiguration(form)
        elif (action == 'save_Configuration'): 
            print "Content-type: text/plain"  
            print
            saveConfiguration(form)
        elif (action == 'show_Application_List'):
            print "Content-type: text/plain"  
            print
            showApplicationList(form)
        elif (action == 'save_Application_List'):
            print "Content-type: text/plain"  
            print
            saveApplicationList(form)
        elif (action == 'save_BuiltIn_List'):
            print "Content-type: text/plain"  
            print
            saveBuiltInList(form)
        elif (action == 'show_BuiltIn_List'):
            print "Content-type: text/plain"  
            print
            showBuiltInList(form)  
        elif (action == 'delete_Application'):
            print "Content-type: text/plain"  
            print
            deleteApplication(form)     
        else:
            print "Content-type: text/plain"
            print
            print "Wrong action: %s" % action
    else:
        print "Content-type: text/plain"
        print
        print 'alert("no action!");'


def generateTarget(form):
    sys.stdout.flush()
    
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        myPath = myPath.replace(' ', '" "')   
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\' 
    myType = ""
    if 'myType' in form:
        myType = form['myType'].value #Generation type          
    isBuiltIn = ""
    if 'isBuiltIn' in form:
        isBuiltIn = form['isBuiltIn'].value #is Built-in    
    myTypeBuilt = "" 
    if 'myTypeBuilt' in form:
        myTypeBuilt = form['myTypeBuilt'].value #is Built-in
    
    if isBuiltIn == "true":
       directory, filename = os.path.split(os.path.abspath(sys.argv[0]))
       configFile = directory.replace(' ', '" "') + "\\..\\..\\..\\..\\" + myTypeBuilt + "\\"+ myName +"\\config.json"
       makecmd = sys.executable +' ' + directory.replace(' ', '" "') + "\\..\\..\\..\\..\\" + myTypeBuilt + "\\" +myName+'\\generate.py -c ' + configFile + " " + myType 
       cmd = makecmd
       (rcode, output, error) = invoke_piped(cmd)
       output = output.replace('"', "'")
       result = ' { state: ' + repr(rcode) + ', output: "' + output + '", error: "' + error + '" }'
       result = result.replace("\n", "<br/>")
       result = result.replace("\\", "/");
       result = result.replace("//", "/");
       result = result.replace('"source"', 'source');
       result = result.replace('"build-script"', 'build-script');
       print result
    else: 
        if os.path.exists(myPath+"\\"+myName):
            if 'cygwin' in form:
                parts = form['cygwin'].value.split('\\')
                pypath = os.path.join(*parts)
                pypath = os.path.join(pypath,'bin','python.exe')
                pypath = pypath.replace(':', ':/')
                pypath = pypath.replace('\\', '/')
                libraryPath = os.getcwd().replace(":", "").replace("\\", "/").replace(' ', '" "')
                cmd = pypath +' /cygdrive/'+ 'c/tmp/'+myName+'/./generate.py ' + myType
            else:
                makecmd = sys.executable +' ' + myPath+myName+'\\generate.py '+ myType 
                cmd = makecmd
                (rcode, output, error) = invoke_piped(cmd)
                output = output.replace('"', "'")
                result = ' { state: ' + repr(rcode) + ', output: "' + output + '", error: "' + error + '" }'
                result = result.replace("\n", "<br/>")
                result = result.replace("\\", "/");
                result = result.replace("//", "/");
                print result
        else:
            result = '{ error: "' + myName + ' not found in ' + myPath.replace('\\', '\\\\') + ' <br/>Application maybe does not exist any more" }'
            print result
        
    return result


def showConfiguration(form):
    sys.stdout.flush()
    
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        myPath = myPath.replace(' ', '" "')   
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'    
    
    list = open(myPath+myName+"\config.json", 'r').readlines()
    input = "".join(list)

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
        myPath = myPath.replace(' ', '" "')   
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'
    changedConfig = ""
    if 'changedConfig' in form:
        changedConfig = form['changedConfig'].value #changedConfig
    
    uCode = unicode(str(changedConfig))
    
    confFile = open(myPath+myName+"\config.json", 'w')
    confFile.write(uCode)
    
    
def showApplicationList(form):
    sys.stdout.flush()  
    
    directory, filename = os.path.split(os.path.abspath(sys.argv[0]))
    directory = directory.replace('\\', '\\\\')
    list = open(directory+'\\..\\persistence\\applicationList.json', 'r').readlines()
    input = "".join(list)
    print input
    return input


def saveApplicationList(form):
    sys.stdout.flush()

    if 'changedAppList' in form:
        changedAppList = form['changedAppList'].value #changedAppList
    
    uCode = unicode(str(changedAppList))
    
    directory, filename = os.path.split(os.path.abspath(sys.argv[0]))
    directory = directory.replace('\\', '\\\\')
    confFile = open(directory+'\\..\\persistence\\applicationList.json', 'w')
    confFile.write(uCode)

def saveBuiltInList(form):
    sys.stdout.flush()

    if 'changedBuiltInList' in form:
        changedBuiltInList = form['changedBuiltInList'].value #changedAppList
    
    uCode = unicode(str(changedBuiltInList)) 
    directory, filename = os.path.split(os.path.abspath(sys.argv[0]))
    directory = directory.replace('\\', '\\\\')
    confFile = open(directory+'\\..\\persistence\\builtInList.json', 'w')
    confFile.write(uCode)

def showBuiltInList(form):
    sys.stdout.flush()
    
    directory, filename = os.path.split(os.path.abspath(sys.argv[0]))
    directory = directory.replace('\\', '\\\\')
    list = open(directory+'\\..\\persistence\\builtInList.json', 'r').readlines()
    input = "".join(list)
    print input
    return input

def deleteApplication(form):
    sys.stdout.flush()
    import shutil
    saveApplicationList(form)
    myName = ""
    if 'myName' in form:
        myName = form['myName'].value #Name
    myPath = ""
    if 'myPath' in form:
        myPath = form['myPath'].value #Path
        myPath = myPath.replace(' ', '" "')   
        if myPath[(len(myPath)-1)] != "\\":
           myPath = myPath + '\\'    
    
    shutil.rmtree(myPath+myName) 


def openInBrowser(form):
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
           
    filePath = myPath+myName+"\\"+location+"\\index.html"
    if (os.path.exists(filePath)):
    	webbrowser.open_new_tab("file:///" + filePath);
    	result = '{open_state: ' + repr(0) + ' , open_output: "' + myName + ' in ' + myPath.replace('\\', '\\\\') + ' was started successfully" }'
        print result
    else:
        result = '{open_state: ' + repr(1) + ' , open_error: "' + myName + ' not found in ' + myPath.replace('\\', '\\\\') + ' <br/>Application maybe does not exist" }'
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
        myPath = myPath.replace(' ', '" "')
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
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    