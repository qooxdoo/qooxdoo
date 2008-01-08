#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1and1.org
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

import os, sys, optparse, subprocess, tempfile
from misc import filetool

SIZES = [ 8, 16, 22, 32, 48, 64, 128 ]


def main():
    if len(sys.argv[1:]) == 0:
        basename = os.path.basename(sys.argv[0])
        print "usage: %s [options]" % basename
        print "Try '%s -h' or '%s --help' to show the help message." % (basename, basename)
        sys.exit(1)

    parser = optparse.OptionParser()

    parser.add_option("-t", "--theme", dest="theme", metavar="DIRECTORY", help="Icon theme base directory")

    (options, args) = parser.parse_args(sys.argv[1:])

    data = getData()
    path = options.theme

    for entry in data:
        for size in SIZES:
            copyFile(path, entry, data[entry], size)


def copyFile(path, entry, alternate, size):
    names = [entry]
    names.extend(alternate)

    pixmap = getPixmapSmart(path, names, size)

    return

    if pixmap:
        print "Copying %s" % pixmap


def getPixmapSmart(path, names, size):

    pixmap = getPixmap(path, names, size)
    if pixmap:
        return pixmap

    scale = getScalable(path, names)
    if scale:
        if os.path.splitext(scale)[-1] == ".svgz":
            gztmp = tempfile.NamedTemporaryFile()
            gzreturn = subprocess.Popen(["gzip", "-d", "-c", scale], stdout=gztmp).wait()
            if gzreturn != 0:
                print ">>> Could not extract file: %s" % scale
                sys.exit(1)

            gztmp.flush()
            scale = gztmp.name

        svgtmp = tempfile.NamedTemporaryFile()
        svgreturn = subprocess.Popen(["rsvg-convert", "-w", str(size), "-h", str(size), "-o", svgtmp.name, scale]).wait()
        if svgreturn != 0:
            print ">>> Could not convert SVG file: %s" % scale
            sys.exit(1)

        print ">>> Return converted file..."
        return svgtmp.name

    print "Missing pixmap %s in %spx" % (names[0], size)
    return None



def getPixmap(path, names, size):
    return getFile(path, names, "%sx%s" % (size, size), [ "png" ])


def getScalable(path, names):
    return getFile(path, names, "scalable", [ "svg", "svgz" ])


def getFile(path, names, size, extensions):
    for name in names:
        for ext in extensions:
            fileName = os.path.join(path, size, ("%s.%s" % (name, ext)))

            try:
                os.stat(fileName)
                return fileName

            except OSError:
                pass

    return None


def getData():
    data = os.path.join(filetool.root(), "data", "icon", "qooxdoo.dat")
    lines = filetool.read(data).split("\n")
    result = {}

    for line in lines:
        if line == "" or line.startswith(" ") or line.startswith("#"):
            continue

        if ":" in line:
            alternative = line[line.index(":")+1:].split(",")
            key = line[:line.index(":")]
        else:
            alternative = []
            key = line

        if result.has_key(key):
            print ">>> Duplicate key found: %s" % key
            sys.exit(1)

        result[key] = alternative

    return result


if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        sys.exit(1)
