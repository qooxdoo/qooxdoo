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

import os, sys, optparse, subprocess, tempfile, shutil
from misc import filetool
from generator.Log import Log
from elementtree import ElementTree


# Supported icon sizes
SIZES = [ 8, 16, 22, 32, 48, 64, 128 ]

# Temporary file names
TMPSVG = os.path.join(tempfile.gettempdir(), "tmp-iconpkg.svg")
TMPPNG = os.path.join(tempfile.gettempdir(), "tmp-iconpkg.png")


def main():
    global console
    
    # Init console object
    console = Log()
    
    if len(sys.argv[1:]) == 0:
        basename = os.path.basename(sys.argv[0])
        console.info("Usage: %s [options]" % basename)
        console.info("Try '%s -h' or '%s --help' to show the help message." % (basename, basename))
        sys.exit(1)

    parser = optparse.OptionParser()

    parser.add_option("--source", dest="source", metavar="DIRECTORY", help="Source directory of theme")
    parser.add_option("--target", dest="target", metavar="DIRECTORY", help="Target directory for theme")

    (options, args) = parser.parse_args(sys.argv[1:])

    if options.source == None or options.target == None:
        console.error("Please define both, the target and the source folder!")
        sys.exit(1)

    data = getData()
    source = os.path.abspath(options.source)
    target = os.path.abspath(options.target)
    
    console.info("Processing theme...")
    console.info("Source folder: %s" % source)
    console.info("Target folder: %s" % target)    
    console.indent()

    # Load legacy alternatives
    mapping = getMapping()
    
    # Process entries
    for entry in data:
        name = entry[0]
        
        console.info("Processing entry %s" % name)
        console.indent()

        # Preparing name list
        name = entry[0]
        pre = name.split("/")[0]
        short = name.split("/")[1]
        names = []
        names.extend(entry)
        if mapping.has_key(short):
            for sub in mapping[short]:
                names.append(pre + "/" + sub)        
            
        # Copy images in different sizes
        for size in SIZES:
            copyFile(source, target, entry, size)

        console.outdent()

    console.outdent()


def getMapping():
    legacyFile = os.path.join(filetool.root(), "data", "icon", "legacy-icon-mapping.xml")
    tree = ElementTree.parse(legacyFile)
    
    ret = {}
    for icon in tree.findall("//icon"):
        altlist = []
        for alt in icon.findall("link"):
            altlist.append(alt.text)
            
        ret[icon.get("name")] = altlist

    return ret


def copyFile(source, target, names, size):
    name = names[0]
    
    # Get pixmap (may return None!)
    pixmap = getPixmapSmart(source, names, size)
    if not pixmap:
        return
        
    if not isinstance(pixmap, basestring):
        keeper = pixmap
        pixmap = pixmap.name

    dest = os.path.join(target, str(size), name + ".png")

    console.debug("copying: %s" % pixmap)
    console.debug("     to: %s" % dest)
    
    destDir = os.path.dirname(dest)

    try:
        os.stat(destDir)
    except OSError:
        os.makedirs(destDir)
        
    shutil.copy(pixmap, dest)

    try: os.remove(TMPPNG)
    except OSError: pass

    try: os.remove(TMPSVG)
    except OSError: pass


def getPixmapSmart(path, names, size):
    pixmap = getPixmap(path, names, size)
    if pixmap:
        return pixmap

    scale = getScalable(path, names)
    if scale:
        if os.path.splitext(scale)[-1] == ".svgz":
            console.debug("Decompressing source...")
            gztmp = file(TMPSVG, "wb")
            gzreturn = subprocess.Popen(["gzip", "-d", "-c", scale], stdout=gztmp).wait()
            if gzreturn != 0:
                console.error("Could not extract file: %s" % scale)
                sys.exit(1)

            gztmp.flush()
            scale = gztmp.name

        console.debug("Rendering image...")
        svgtmp = file(TMPPNG, "wb")
        svgreturn = subprocess.Popen(["rsvg-convert", "-w", str(size), "-h", str(size), "-o", svgtmp.name, scale]).wait()
        if svgreturn != 0:
            console.error("Could not convert SVG file: %s" % scale)
            sys.exit(1)

        return svgtmp.name

    console.warn("Missing %spx icon" % size)
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
            console.error("Duplicate key found: %s" % key)
            sys.exit(1)

        result[key] = alternative

    # convert to array
    arr = []
    keys = result.keys()
    keys.sort()
    for key in keys:
        tmp = []
        tmp.append(key)
        tmp.extend(result[key])
        arr.append(tmp)

    return arr


if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        sys.exit(1)
