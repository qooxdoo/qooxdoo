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
import qxenviron
from misc import filetool
from generator.runtime.Log import Log
from elementtree import ElementTree

# Supported icon sizes
SIZES = [ 16, 22, 32, 48, 64, 128 ]

# Select the SVG processor
# * batik.local (Batik renderer, requires JRE>=1.4, in working folder under batik)
# * inkscape.cmd (Inkscape installed in path)
# * inkscape.dmg (Mac Inkscape in /Application folder)
# * rsvg.cmd (rsvg-convert command line tool)
SVG = "inkscape.mac"

# Temporary file names
TMPPNG = os.path.join(tempfile.gettempdir(), "tmp-iconpkg.png")
TMPOUT = os.path.join(tempfile.gettempdir(), "tmp-iconpkg.png")


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
    parser.add_option("--sync", dest="sync", action="store_true", default=False)

    (options, args) = parser.parse_args(sys.argv[1:])

    if options.source == None or options.target == None:
        console.error("Please define both, the target and the source folder!")
        sys.exit(1)

    data = getData()
    source = os.path.abspath(options.source)
    target = os.path.abspath(options.target)
    sync = options.sync
    
    console.info("Processing theme...")
    console.info("Source folder: %s" % source)
    console.info("Target folder: %s" % target)
    console.indent()

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
            
        # Copy images in different sizes
        for size in SIZES:
            copyFile(source, target, entry, size, sync)

        console.outdent()

    console.outdent()


def copyFile(source, target, names, size, sync):
    name = names[0]
    dest = os.path.join(target, str(size), name + ".png")
    
    # Get scalable
    scale = getScalable(source, names, size)
    
    if not scale:
        console.warn("Missing %spx icon" % size)
        return
        

    # Syncronization support
    if sync:
        process = True
        try:
            destTime = os.stat(dest).st_mtime
            sourceTime = os.stat(scale).st_mtime
            process = sourceTime > destTime
            
        except OSError:
            # Ignore non existent files
            pass
            
        if not process:
            return

        
    # Convert to pixmap
    pixmap = getPixmap(scale, size)
    if not pixmap:
        return
        
    if not isinstance(pixmap, basestring):
        keeper = pixmap
        pixmap = pixmap.name

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


def getPixmap(scale, size):
    console.debug("Rendering image...")
    pngtmp = file(TMPPNG, "wb")
    outtmp = file(TMPOUT, "wb")
    
    if SVG == "rsvg.cmd":
        svgreturn = subprocess.Popen(["rsvg-convert", "-w", str(size), "-h", str(size), "-a", "-o", pngtmp.name, scale], stderr=outtmp, stdout=outtmp).wait()
    elif SVG == "inkscape.cmd":
        svgreturn = subprocess.Popen(["inkscape", "--export-background-opacity=0", "--export-dpi=72", "-z", "-w", str(size), "-h", str(size), "-z", "-e", pngtmp.name, "-f", scale], stderr=outtmp, stdout=outtmp).wait()
    elif SVG == "inkscape.mac":
        svgreturn = subprocess.Popen(["/Applications/Inkscape.app/Contents/Resources/bin/inkscape", "--export-background-opacity=0", "--export-dpi=72", "-z", "-w", str(size), "-h", str(size), "-e", pngtmp.name, "-f", scale], stderr=outtmp, stdout=outtmp).wait()
    elif SVG == "batik.local":
        svgreturn = subprocess.Popen(["java", "-jar", "batik/batik-rasterizer.jar", "-w", str(size), "-h", str(size), "-m", "image/png", "-d", pngtmp.name, scale], stderr=outtmp, stdout=outtmp).wait()
    else:
        svgreturn = 1
        
    if svgreturn != 0:
        console.error("Could not convert SVG file: %s" % scale)
        sys.exit(1)

    return pngtmp.name


def getScalable(path, names, size):
    extensions = [ "svg", "svgz" ]
    optimized = SIZES[SIZES.index(size):]
    
    for name in names:
        category = name[:name.index("/")]
        filename = name[name.index("/")+1:]
        
        files = []
        for ext in extensions:
            for optsize in optimized:
                files.append("scalable/%s/small/%sx%s/%s.%s" % (category, optsize, optsize, filename, ext))

            files.append("scalable/%s/%s.%s" % (category, filename, ext))
        
        for name in files:
            fullname = os.path.join(path, name)
            try:
                os.stat(fullname)
                console.debug("Size %s uses SVG source: %s" % (size, name))
                return fullname

            except OSError:
                pass

    return None


def getData():
    data = os.path.join(filetool.root(), os.pardir, "data", "icon", "qooxdoo.dat")
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
