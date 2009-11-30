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
#    * Sebastian Werner (wpbasti)
#
################################################################################

import os, codecs, cPickle, sys, re, time
import gzip as sys_gzip
import textutil

VERSIONCONTROL_DIR_PATTS = (r'^\.svn$', r'^_svn$', r'^CVS$')

def gzip(filePath, content, encoding="utf-8"):
    if not filePath.endswith(".gz"):
        filePath = filePath + ".gz"
    
    content = unicode(content).encode(encoding)
    
    outputFile = sys_gzip.open(filePath, "wb", 9)
    outputFile.write(content)
    outputFile.close()


def gunzip(filePath, encoding="utf-8"):
    if not filePath.endswith(".gz"):
        filePath = filePath + ".gz"

    inputFile = sys_gzip.open(filePath, "rb")
    content = inputFile.read()
    
    return textutil.any2Unix(unicode(content))


def remove(filePath):
    # Normalize
    filePath = normalize(filePath)

    # Removing file
    try:
        if os.path.exists(filePath):
            os.remove(filePath)

    except IOError, (errno, strerror):
        print "  * I/O error(%s): %s" % (errno, strerror)
        sys.exit(1)

    except:
        print "  * Unexpected error:", sys.exc_info()[0]
        sys.exit(1)


def save(filePath, content="", encoding="utf-8"):
    # Normalize
    filePath = normalize(filePath)

    # Create directory
    directory(os.path.dirname(filePath))

    # Writing file
    try:
        outputFile = codecs.open(filePath, encoding=encoding, mode="w", errors="replace")
        outputFile.write(content)

    except IOError, (errno, strerror):
        print "  * I/O error(%s): %s" % (errno, strerror)
        sys.exit(1)

    except UnicodeDecodeError:
        print "  * Could not decode result to %s" % encoding
        sys.exit(1)

    except:
        print "  * Unexpected error:", sys.exc_info()[0]
        sys.exit(1)

    outputFile.flush()
    outputFile.close()


def directory(dirname):
    # Normalize
    dirname = normalize(dirname)

    # Check/Create directory
    if dirname != "" and not os.path.exists(dirname):
        os.makedirs(dirname)


def normalize(filename):
    return os.path.normpath(filename)


def read(filePath, encoding="utf_8"):
    try:
        ref = codecs.open(filePath, encoding=encoding, mode="r")
        content = ref.read()
        ref.close()

        return textutil.any2Unix(unicode(content))

    except IOError, (errno, strerror):
        print "  * I/O error(%s): %s (%s)" % (errno, strerror, filePath)
        sys.exit(1)

    except ValueError:
        print "  * Invalid Encoding. Required encoding %s in %s" % (encoding, filePath)
        sys.exit(1)

    except:
        print "  * Unexpected error:", sys.exc_info()[0], " (%s)" % filePath
        sys.exit(1)


def root():
    modulepath = unicode(__file__)
    
    miscfolder = os.path.dirname(modulepath)
    toolfolder = os.path.dirname(miscfolder)
    
    root = os.path.abspath(toolfolder)

    return root


def find(rootpath, pattern=None, includedirs=False):
    dirwalker   = os.walk(rootpath)
    findPattern = None
    if pattern:
        findPattern = re.compile(pattern)
    alwaysSkip  = re.compile(r'%s' % '|'.join(VERSIONCONTROL_DIR_PATTS),re.I)

    for (path, dirlist, filelist) in dirwalker:
        # correct dirlist (only with 'while' you can change it in place)
        i,j = 0,len(dirlist)
        while i<j:
            if re.search(alwaysSkip, dirlist[i]):
                del dirlist[i]
                j -= 1
            i += 1

        ## go through files
        if includedirs: 
            checklist = dirlist + filelist
        else:
            checklist = filelist
        for filename in checklist:
            if re.search(alwaysSkip, filename):
                continue
            if (findPattern and not re.search(findPattern, filename)):
                continue

            yield os.path.join(path,filename)


def findYoungest(rootpath, pattern=None):
    # find the node with the most recent modified date

    def lastModified(path):
        return os.stat(path).st_mtime

    youngest = rootpath
    ymodified= lastModified(rootpath)

    for path in find(rootpath, pattern, includedirs=True):
        m = lastModified(path)
        if m > ymodified:
            ymodified = m
            youngest  = path

    return (youngest, ymodified)


def lockFileName(path):
    return '.'.join((path, "lock"))


def lock(path, retries=4, timeout=0.5):
    #print "xxx creating file lock on: %r" % path
    lockfile = lockFileName(path)
    retry    = 0
    while True:
        try:
            fd = os.open(lockfile, os.O_CREAT|os.O_EXCL|os.O_RDWR)
        except:
            #print "xxx cache lock collision (%d)" % retry
            retry += 1
            if retry > retries:
                return None
            else:
                time.sleep(timeout)
                continue
        if fd:
            os.close(fd)
            return lockfile
        else:
            return None

def unlock(path):
    lockfile = lockFileName(path)
    if lockfile and os.path.exists(lockfile):
        #print "xxx releasing file lock on: %r" % path
        os.unlink(lockfile)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise RuntimeError, "Usage: %s <dirpath>" % sys.argv[0]
    for entry in find(*sys.argv[1:]):
        print entry