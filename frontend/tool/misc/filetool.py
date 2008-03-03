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

import os, codecs, cPickle, sys, re
import gzip as sys_gzip
import textutil
import roothelper

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
    return os.path.normcase(os.path.normpath(filename))


def read(filePath, encoding="utf_8"):
    try:
        ref = codecs.open(filePath, encoding=encoding, mode="r")
        content = ref.read()
        ref.close()

        return textutil.any2Unix(unicode(content))

    except IOError, (errno, strerror):
        print "  * I/O error(%s): %s" % (errno, strerror)
        sys.exit(1)

    except ValueError:
        print "  * Invalid Encoding. Required encoding %s in %s" % (encoding, filePath)
        sys.exit(1)

    except:
        print "  * Unexpected error:", sys.exc_info()[0]
        sys.exit(1)


def root():
    modulepath = str(roothelper).split(None,3)[3][1:-2]
    
    miscfolder = os.path.dirname(modulepath)
    toolfolder = os.path.dirname(miscfolder)
    
    root = os.path.abspath(toolfolder)

    # Try to remove bytecode
    if modulepath.endswith(".py"):
        modulepath = modulepath[:-2] + "pyc"
        
    try:
        os.remove(modulepath)
    except OSError:
        pass
    
    return root


def find(rootpath, pattern):
    dirwalker = os.walk(rootpath)

    for (path, dirlist, filelist) in dirwalker:
        for filename in filelist:
            if not re.search(pattern, filename):
                continue

            yield os.path.join(path,filename)

