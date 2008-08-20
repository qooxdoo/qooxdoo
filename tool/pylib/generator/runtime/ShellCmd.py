#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de
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

import sys, os, re, subprocess, shutil, errno

class ShellCmd(object):
    def __init__(self):
        pass

    
    def eval_wait(self, rcode):
        lb = (rcode << 8) >> 8 # get low-byte from 16-bit word
        if (lb == 0):  # check low-byte for signal
            rc = rcode >> 8  # high-byte has exit code
        else:
            rc = lb  # return signal/coredump val
        return rc


    def execute(self,cmd, wd=None):
        # subprocess-based version
        if wd:
            olddir = os.getcwdu()
            os.chdir(wd)
        p = subprocess.Popen(cmd, shell=True,
                             # problems in python 2.4.4 with passing std streams (?)
                             #stdout=sys.stdout,
                             #stderr=subprocess.STDOUT
                             #stderr=sys.stderr
                             )
        if wd:
            os.chdir(olddir)
        return p.wait()


    def execute_piped(cmd):
        p = subprocess.Popen(cmd, shell=True,
                             stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE,
                             universal_newlines=True)
        output, errout = p.communicate()
        rcode = p.returncode

        return (rcode, output, errout)


    def execute1(self, shellcmd):
        # os-based version; bombs intermittendly due to os.wait() coming too late
        (cin,couterr) = os.popen4(shellcmd)
        cin.close()  # no need to pass data to child
        couterrNo = couterr.fileno()
        stdoutNo  = sys.stdout.fileno()
        while(1):
            buf = os.read(couterrNo,50)
            if buf == "":
                break
            os.write(stdoutNo,buf)
        (pid,rcode) = os.wait()  # wish: (os.wait())[1] >> 8 -- unreliable on Windows
        rc = self.eval_wait(rcode)

        return rc


    def execvp(self, cmd, args):
        '''this is just a dummy method, to have this code as a template for later use
           Overlay the current process with a new (python) command'''
        CMD_PYTHON = 'python'

        argList = []
        argList.append(CMD_PYTHON)
        argList.append(cmd)
        argList.extend(args)

        os.execvp(CMD_PYTHON, argList)


    def rm_rf(self, fileOrDir):
        '''Deletes files and directories recursively'''

        def handleRemoveReadonly(func, path, exc):
        # For Windows the 'readonly' must not be set for resources to be removed    
            excvalue = exc[1]
            if func in (os.rmdir, os.remove) and excvalue.errno == errno.EACCES:
                os.chmod(path, 0777)
                func(path)
            else:
                raise
    
        if not os.path.exists(fileOrDir):  # nothing to delete
            return

        if os.path.isdir(fileOrDir):
            shutil.rmtree(fileOrDir, ignore_errors=False, onerror=handleRemoveReadonly)
        else:
            os.unlink(fileOrDir)


