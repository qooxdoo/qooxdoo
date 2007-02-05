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

import sys, re, os, optparse
import filetool, optparseext




def generate(settingsList, newLines):
  if len(settingsList) == 0:
    return ""

  typeFloat = re.compile("^([0-9\-]+\.[0-9]+)$")
  typeNumber = re.compile("^([0-9\-])$")

  if newLines:
    lineBreak = "\n"
  else:
    lineBreak = ""

  settingsStr = 'window.qxsettings={' + lineBreak

  first = True
  for setting in settingsList:
    settingSplit = setting.split(":")
    settingKey = settingSplit.pop(0)
    settingValue = ":".join(settingSplit)

    if not (settingValue == "false" or settingValue == "true" or typeNumber.match(settingValue)):
      settingValue = '"%s"' % settingValue.replace("\"", "\\\"")

    if not first:
      settingsStr += "," + lineBreak

    settingsStr += '"%s":%s' % (settingKey, settingValue)
    first = False

  settingsStr += lineBreak
  settingsStr += "};"

  return settingsStr




def main():
  parser = optparse.OptionParser("usage: %prog [options]", option_class=optparseext.ExtendAction)

  parser.add_option("-d", "--define-setting", action="extend", dest="defineSetting", type="string", metavar="NAMESPACE.KEY:VALUE", default=[], help="Define a setting.")
  parser.add_option("-o", "--output-file", dest="outputFile", metavar="FILENAME", help="Name of settings script file.")
  parser.add_option("-n", "--add-new-lines", action="store_true", dest="addNewLines", default=False, help="Keep newlines in compiled files.")

  (options, args) = parser.parse_args()

  if options.outputFile == None:
    print generate(options.defineSetting, options.addNewLines)
  else:
    print "   * Saving settings to %s" % options.outputFile
    filetool.save(options.outputFile, generate(options))




if __name__ == '__main__':
  try:
    main()

  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    sys.exit(1)
