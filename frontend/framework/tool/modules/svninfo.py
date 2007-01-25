#!/usr/bin/env python

import os, sys, re, optparse
import filetool



DIRINFO = re.compile("dir\n([0-9]+)\nhttps://.*/svnroot/qooxdoo/(\w+)/(\w+)/", re.M | re.S)



def query(path):
  if os.path.exists(path):
    entries = os.path.join(path, ".svn", "entries")

    if os.path.exists(entries):
      content = filetool.read(entries)

      mtch = DIRINFO.search(content)
      if mtch:
        folder = mtch.group(2)
        if folder in [ "tags", "branches" ]:
          folder = mtch.group(3)

        revision = mtch.group(1)

        return revision, folder

  return None, None



def format(revision, folder):
  return "(r%s) [%s]" % (revision, folder)



if __name__ == '__main__':
  try:
    parser = optparse.OptionParser()

    (options, args) = parser.parse_args()

    revision, folder = query(args[0])
    if revision != None:
      print format(revision, folder)
    else:
      print "unknown"


  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    sys.exit(1)
