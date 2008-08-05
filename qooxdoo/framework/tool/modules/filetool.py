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

##
#<h2>Module Description</h2>
#<pre>
# NAME
#  module.py -- module short description
#
# SYNTAX
#  module.py --help
#
#  or
#
#  import module
#  result = module.func()
#
# DESCRIPTION
#  The module module does blah.
#
# CAVEATS
#
# KNOWN ISSUES
#  There are no known issues.
#</pre>
##

import os, codecs, cPickle, sys
import gzip as sys_gzip
import textutil

##
# Some nice short description of foo(); this can contain html and
# {@link #foo Links} to items in the current file.
#
# @param     a        Describe a positional parameter
# @keyparam  b        Describe a keyword parameter
# @def       foo(name)    # overwrites auto-generated function signature
# @param     name     Describe aliased parameter
# @return             Description of the things returned
# @defreturn          The return type
# @exception IOError  The error it throws
#
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


# deprecated
def storeCache(cachePath, data):
    try:
        cPickle.dump(data, open(cachePath, 'wb'), 2)

    except (EOFError, cPickle.PickleError, cPickle.PicklingError):
        print "  * Could not store cache to %s" % cachePath
        sys.exit(1)


# deprecated
def readCache(cachePath):
    try:
        return cPickle.load(open(cachePath, 'rb'))

    except (EOFError, cPickle.PickleError, cPickle.UnpicklingError):
        print "  * Could not read cache from %s" % cachePath
        sys.exit(1)


# deprecated
def checkCache(filePath, cachePath):
    fileModTime = os.stat(filePath).st_mtime

    try:
        cacheModTime = os.stat(cachePath).st_mtime
    except OSError:
        cacheModTime = 0

    return fileModTime > cacheModTime
