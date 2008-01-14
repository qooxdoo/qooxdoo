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
#  The module module does blah.
#
# CAVEATS
#  - the 'nph-...' name is retained so it would run seamlessly under Apache or
#    other nph-capable web servers that look for the name to detect a
#    no-parsed-header script.
#
##

import sys, os, re, string
import cgi
#import cgitb; cgitb.enable()

config = {
    'debug': 0,
    'makefile': "Makefile",
    'versionfile' : "VERSION",
}


def invoke_external(cmd):
    import subprocess
    p = subprocess.Popen(cmd, shell=True,
                         stdout=sys.stdout,
                         stderr=subprocess.STDOUT)
    return p.wait()

def invoke_external1(cmd):
    "Just os. based"
    rc = 0
    (cin,couterr) = os.popen4(cmd)
    cin.close()  # no need to pass data to child
    couterrNo = couterr.fileno()
    stdoutNo  = sys.stdout.fileno()
    while(1):
        buf = os.read(couterrNo,50)
        if buf == "":
            break
        os.write(stdoutNo,buf)
    (pid,rcode) = os.wait()  # wish: (os.wait())[1] >> 8 -- unreliable on Windows
    rc = eval_wait(rcode)
    return rc

def eval_wait(rcode):
    lb = (rcode << 8) >> 8 # get low-byte from 16-bit word
    if (lb == 0):  # check low-byte for signal
        rc = rcode >> 8  # high-byte has exit code
    else:
        rc = lb  # return signal/coredump val
    return rc

def invoke_piped(cmd):
    import subprocess
    p = subprocess.Popen(cmd, shell=True,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE,
                         universal_newlines=True)
    output, errout = p.communicate()
    rcode = p.returncode

    return (rcode, output, errout)

def invoke_piped1(cmd):
    "Just os. based"
    rcode = 0
    (cin,cout,cerr) = os.popen3(cmd)
    cin.close()
    # the next code is roughly from stdlib:popen2's 'flow control issues' doc
    errout = cerr.read()
    output = cout.read()
    cout.close()
    cerr.close()
    (pid,rc) = os.wait()
    rcode = eval_wait(rc)

    return (rcode, output, errout)


def find_common_prefix (p1, p2):
  # Of two paths p1 and p2 return the common path prefix, the rest of p1, and
  # the rest of p2: find_common_prefix("/home/thron7/div/corp","/home/thron7/workspace/qooxdoo.trunk") =>
  #'"/home/thron7/" "div/corp" "workspace/qooxdoo.trunk"
  a1 = p1.split(os.sep)
  a2 = p2.split(os.sep)
  com= []
  common = ""
  p1rest = "" 
  p2rest = "" 
  ind = 0 
  for i in range(len(a1)): 
    if (i >= len(a2) or a1[i] != a2[i]): 
      ind = i 
      break
    com.append(a1[i]) 
  p1rest = os.sep.join( a1[ind:])
  p2rest = os.sep.join( a2[ind:])
  common = os.sep.join( com)
  return (common, p1rest, p2rest)

def part_to_ups (part):
  #"../.."
  a1 = string.split(part, os.sep)
  s  = []
  for i in a1:           
    s.append( "..")
  return os.sep.join(s) or ""

def check_qx(pexp):
    # expect directory
    if os.path.isdir(pexp):
        dir = pexp
    else:
        dir = os.path.dirname(pexp)
    fle = os.path.join(dir,"frontend","framework",config['makefile'])
    if os.path.exists(fle):
        f = open(fle)
        cont = f.read()
        if re.search(r'qooxdoo - the new era',cont):
            return 1
    return 0

def normalize_path(dospath):
    # use cygpath to do the conversion
    (rc,out,err) = invoke_piped1("cygpath -u '"+dospath+"'")
    if rc==0:
        return out
    else:
        return err

def do_getroot(form):
    print "Content-type: text/plain"
    print
    print os.getcwd()

def do_reldir(form):
    # relativize local directory path to Makefile directory and check it's
    # a qooxdoo installation
    rc = 0
    print "Content-type: text/plain"
    print
    if not 'path' in form:
        print "Missing parameter 'make'; aborting..."
        return -1
    else:
        path_exp = form['path'].value
    cwd = os.getcwd()
    if re.match(r'^[a-zA-Z]:',path_exp):  # is it a DOS path?
        path_exp = normalize_path(path_exp)
    common = find_common_prefix (cwd, os.path.abspath(path_exp))
    ups = part_to_ups (common[1])
    reldir = os.sep.join([ups,common[2]])
    # get rid of trailing file name
    if not os.path.isdir(reldir):
        reldir = os.path.dirname(reldir)
    if check_qx(reldir):
        print reldir
    else:
        print "-1"
    return rc

def do_make(form):
    # our output is text/plain
    print "Content-type: text/plain"
    print
    sys.stdout.flush()
    if not 'make' in form:
        print "Missing parameter 'make'; aborting..."
        return -1
    else:
        makecmd = "make " + form['make'].value
    if 'cygwin' in form:
        parts = form['cygwin'].value.split('\\')
        bashpath = os.path.join(*parts)
        bashpath = os.path.join(bashpath,'bin','bash.exe')
        cmd = bashpath + " -c 'export PATH=/usr/bin; " + makecmd + "'"
    else:
        cmd = makecmd
    rc = invoke_external1(cmd)

    return rc

def do_save(form):
    # our output is text/plain
    print "Content-type: text/plain"
    print
    # get parms - JSON string?
    json  = form['makvars'].value
    makvars = eval(json)
    if config['debug']:
        print "dumping json map:"
        for item in makvars:
            print item['lab']+"="+item['dat']
    save_makvars(json)
    rc = gen_makefile(makvars)
    if rc==0:
        print "Successfully saved Configuration"
    else:
        print ("Problem saving Makefile (return code of gen_makefile was: %d);" % rc + 
               "please check the Makefile by hand.")

    return rc

def do_getmakvars(form):
    print "Content-type: text/plain"
    print
    rc = 0
    makvars = read_makefile()
    print makvars

    return rc

def save_makvars(json):
    "Saves makvars in a js file (for later editing sessions)"
    f = open("makvars.js","w")
    f.write(json)
    f.close()

    return

def gen_makefile(makvars):
    "Generate Makefile from the passed makvars"
    import shutil, StringIO
    rc = 0
    mkfile=config['makefile']
    mkback=mkfile+".bak"
    # make a list of the config keywords
    makkeys = []
    for item in makvars:
        makkeys.append(item['lab'])
    # backup copy
    shutil.copy(mkfile, mkback)
    infile = open(mkback,'rU')
    f = StringIO.StringIO()

    # Processing
    # copy prolog
    #for s in infile:
        #if kvpat.match(s):
            #fkey = kvpat.match(s)[0]
            #if fkey in makkeys:
                #item = finditem(makvars,fkey)
                #writeitem(f,item)
                #item['written']=True
                #continue

        #f.write(s)
    
    # dump the remaining settings
    #for item in makvars:
        #if not 'written' in item:
            #writeitem(f,item)

    # Entire File Version
    #text = infile.read()
    # patch existing entries
    #for mkey in makkeys:
        #if /mkey\s*=\s*(.*)$/m:
            #item = finditem(makvars,mkey)
            #text.insert($1,item['dat'])
            #item['written']=True
    # dump remaining settings
    #find_custom_section()
    #for item in makvars:
        #if not 'written' in item:
            #text.insert(item['lab']+" = "+item['dat']+"\n")

    #f.write(text)

    # Array of Lines Version
    text = infile.readlines()
    j = find_custom_section(text)
    if j < 0:
        print "Unable to edit Makfile; aborting ..."
        return -1

    kvpat = re.compile(r'^([^=]+?)\s*=\s*.*$') # a key=value line in the Makefile, capturing key
    # until the end of the custom section
    for i in range(0,j+1):  # range(0,N) := [0,N[ (right-exclusive)
        # copy or patch
        mo = kvpat.search(text[i])
        if mo:
            fkey = mo.group(1)
            fkey = fkey.strip()
            # patch with new value?
            if fkey in makkeys:
                item = finditem(makvars,fkey)
                if item['dat'] == "__REMOVEME__":
                    # remove this keyword from the makefile
                    pass
                else:
                    writeitem(f,item)
                item['written']=True
                continue
            # default is just to copy over
            f.write(text[i])
        else:
            f.write(text[i])

    # at the end of the custom section
    for item in makvars:
        # dump yet unwritten settings
        if not 'written' in item:
            writeitem(f,item)

    # after the custom section
    for i in range(j+1,len(text)):
        # copy rest
        f.write(text[i])

    # Processing - Done

    infile.close()
    # write new contents
    f.seek(0)
    outtext = f.readlines()
    if len(outtext) > 20:  # heuristic for a correct Makefile
        mf = open(mkfile,'w')
        if mf:
            for line in outtext:
                mf.write(line)
            mf.close()
        else:
            print "Cannot write to Makefile; changes were not saved"
            return -2
    f.close()

    return rc

def find_custom_section(text):
    " text is an array of lines representing the current Makefile"
    reg1 = re.compile(r'^#+\s*$')
    reg2 = re.compile(r'^# INTERNALS \(PLEASE DO NOT CHANGE\)\s*$')
    reg3 = re.compile(r'^# INCLUDE CORE\s*$')
    for i in range(0,len(text)-2):
        if (reg1.search(text[i]) and
           (reg2.search(text[i+1]) or reg3.search(text[i+1])) and
           reg1.search(text[i+2])):
           return i-1
    return -1

def finditem(mvars,label):
    for item in mvars:
        if item['lab'] == label:
            return item
    return None

def writeitem(fh,item):
    fh.write(item['lab']+" = "+item['dat']+"\n")

def read_makefile():
    "Read the var settings from Makefile and return as Json"
    rc = 0
    mkfile=config['makefile']
    # make a list of the settings [{'lab': 'QX_SOMETHING','dat': 'qx-0.7'},...]
    makvars = []
    infile = open(mkfile,'rU')
    kvpat = re.compile(r'^([^=#]+?)\s*=\s*(.*)$') # a key=value line in the Makefile, capturing key

    for line in infile:
        mo = kvpat.search(line)
        if mo:
            fkey = mo.group(1)
            fkey = fkey.strip()
            fval = mo.group(2)
            fval = fval.strip()
            makvars.append({'lab':fkey, 'dat':fval})

    infile.close()

    makjson = jsonify(makvars)

    return makjson

def jsonify(arrayofmaps):
    json = ""
    if isinstance(arrayofmaps, list):
        json += "["
        al = len(arrayofmaps)
        for i,item in enumerate(arrayofmaps):
            if isinstance(item, dict):
                json += "{"
                for j,key in enumerate(item):
                    json += "'"+key+"':"
                    json += repr(item[key])
                    if j<len(item)-1:
                        json += ","
                json += "}"
                if i<al-1:
                    json += ","
        json += "]"
    return json

def dispatch_action(form):
    if 'action' in form:
        action = form['action'].value
        if (action == 'save'): # save to makefile
            do_save(form)
        elif (action == 'run'): # run make file
            do_make(form)
        elif (action == 'getvars'): # get existing Makefile vars
            do_getmakvars(form)
        elif (action == 'reldir'): # relativize absolute path
            do_reldir(form)
        elif (action == 'getroot'): # get web server's pwd
            do_getroot(form)
        else:
            print "Content-type: text/plain"
            print
            print "Wrong action <hihihi>: %s" % action
    #elif (form['action'] == 'get'): pass # get makefile vars? - not necessary
    else:
        print "Content-type: text/plain"
        print
        print 'qx.io.remote.ScriptTransport._requestFinished(%s, "Thank you for asking");' % form["_ScriptTransport_id"].value

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
    form = process_parms()
    emit_http_headers()
    fix_env(form)
    dispatch_action(form)

if __name__ == "__main__":
    try:
        rc = main()
    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        rc = 1
    sys.exit(rc)

