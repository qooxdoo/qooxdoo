#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, optparse, codecs, re



basic = u"""
_demoData_ = [%s];

(function ()
{
  if (parent && parent.demobrowser) {
    var demobrowser = parent.demobrowser;
    var logger = parent.qx.core.Init.getInstance().getApplication().viewer.logappender;
    if (logger)
    {
      qx.log.Logger.ROOT_LOGGER.removeAllAppenders();
      qx.log.Logger.ROOT_LOGGER.addAppender(logger);
    } else 
    {
      alert("Could not attach parent logger (" + parent.qx.core.Init.getInstance().getApplication().viewer + ")");
    }
  } 
  else
  {
    alert("Cannot set demobrowswer's log appender!");
  }
})();

qx.Class.include(qx.core.Init, qx.core.MLegacyInit);
"""


def main(dist, scan):
  res = ""

  firstCategory = True
  # for category in os.listdir(scan):
  for category in [ "example", "test", "performance" ]:
    if category == ".svn":
      continue

    if not firstCategory:
      res += "},"

    res += "{"
    res += "classname:\""+category+"\",tests:["

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

      desc = getDesc(os.path.join(scan, category, item))
      desc = re.sub('"','\\"',desc)

      res += '{name:"%s",desc:"%s"}' % (item, desc)
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


def getDesc(filepath):
    desc = ""
    # open file
    file = open(filepath).read()
    if file:
        # scan for div id="demoDescription
        m = re.search(r'<div\s+id="demoDescription">(.*?)</div>', file, 
                         re.IGNORECASE|re.DOTALL)
        if m: 
            desc = m.group(1)
            desc = re.sub("\n"," ",desc)
            desc = desc.strip()
    else:
        print "Failed to open filepath: ", filepath
    # return text

    return desc



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
