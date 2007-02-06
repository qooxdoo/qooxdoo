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




def generate(variantsList, newLines):
  typeFloat = re.compile("^([0-9\-]+\.[0-9]+)$")
  typeNumber = re.compile("^([0-9\-])$")

  if newLines:
    lineBreak = "\n"
  else:
    lineBreak = ""

  variantsStr = 'if(!window.qxvariants)qxvariants={};' + lineBreak

  for variant in variantsList:
    variantSplit = variant.split(":")
    variantKey = variantSplit.pop(0)
    variantValue = ":".join(variantSplit)

    if not (variantValue == "false" or variantValue == "true" or typeNumber.match(variantValue)):
      variantValue = '"%s"' % variantValue.replace("\"", "\\\"")

    variantsStr += 'qxvariants["%s"]=%s;%s' % (variantKey, variantValue, lineBreak)

  return variantsStr




def main():
  parser = optparse.OptionParser("usage: %prog [options]", option_class=optparseext.ExtendAction)

  parser.add_option("-d", "--use-variant", action="extend", dest="useVariant", type="string", metavar="NAMESPACE.KEY:VALUE", default=[], help="Define a variant.")
  parser.add_option("-o", "--output-file", dest="outputFile", metavar="FILENAME", help="Name of variants script file.")
  parser.add_option("-n", "--add-new-lines", action="store_true", dest="addNewLines", default=False, help="Keep newlines in compiled files.")

  (options, args) = parser.parse_args()

  if options.outputFile == None:
    print generate(options.useVariant, options.addNewLines)
  else:
    print "   * Saving variants to %s" % options.outputFile
    filetool.save(options.outputFile, generate(options))




if __name__ == '__main__':
  try:
    main()

  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    sys.exit(1)
