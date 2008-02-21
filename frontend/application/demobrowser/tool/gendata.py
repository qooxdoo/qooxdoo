#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, optparse, codecs, re

basic = u"""[%s]"""

def main(dist, scan):
  res = ""
  structurize = False

  firstCategory = True
  for category in os.listdir(scan):
    if category == ".svn":
      continue

    if not firstCategory:
      res += "},"

    res += "{"
    res += "\"classname\":\""+category+"\",\"tests\":[\n"

    firstItem = True
    lastbasename = None

    for item in os.listdir(os.path.join(scan, category)):
      if item == ".svn":
        continue

      if os.path.splitext(item)[1] != ".html":
        continue

      title = item[:item.find(".")]

      if "_" in title:
        nr = title[title.find("_")+1:]
        basename = title[:title.find("_")]
      else:
        nr = 0
        basename = title

      title = title.replace("_", " ")

      if structurize:
        if lastbasename != basename:
          firstItem = True

          if lastbasename != None:
            res += "\n]},\n"

          res += "{"
          res += "\"classname\":\""+basename+"\",\"desc\":\"Folder %s\",\"tests\":[\n" % basename

      if not firstItem:
        res += ",\n"

      res += '{\"nr\":"%s",\"title\":"%s",\"name\":"%s",\"desc\":"%s"}' % (nr, title, item, "TODO")
      lastbasename = basename
      firstItem = False

    if structurize:
      if lastbasename != None:
        res += "\n]}\n"

    res += "\n]\n"
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

    main(args[0], args[1])

  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    sys.exit(1)
