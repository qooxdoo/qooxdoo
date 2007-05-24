#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, optparse, codecs



basic = u"""
_demoData_ = [%s];

qx.Class.include(qx.core.Init, qx.core.MLegacyInit);
"""


def main(dist, scan):
  res = ""

  firstCategory = True
  # for category in os.listdir(scan):
  for category in [ "example", ]:
    if category == ".svn":
      continue

    if not firstCategory:
      res += "},"

    res += "{"
    res += "classname:\""+category+"s\",tests:["

    firstItem = True
    for item in os.listdir(os.path.join(scan, category)):
      if item == ".svn":
        continue

      if os.path.splitext(item)[1] != ".html":
        continue

      if item == "index.html":
        continue

      if not firstItem:
        res += ","

      res += '"%s"' % item

      firstItem = False

    res += "]"
    firstCategory = False

  res += "}"

  distdir = os.path.dirname(dist)

  if not os.path.exists(distdir):
    os.makedirs(distdir)

  content = basic % res

  outputFile = codecs.open(dist, encoding="utf-8", mode="w", errors="replace")
  outputFile.write(content)
  outputFile.flush()
  outputFile.close()




if __name__ == '__main__':
  try:
    parser = optparse.OptionParser()

    (options, args) = parser.parse_args()

    dist = args[0]
    scan = args[1]

    main(dist, scan)

  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    sys.exit(1)
