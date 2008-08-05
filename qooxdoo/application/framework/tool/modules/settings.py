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

import sys, re, os, optparse
import filetool, optparseext




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
def generate(settingsList, newLines):
    typeNumber = re.compile("^([0-9\-]+)$")

    if newLines:
        lineBreak = "\n"
    else:
        lineBreak = ""

    settingsStr = 'if(!window.qxsettings)qxsettings={};' + lineBreak

    for setting in settingsList:
        settingSplit = setting.split(":")
        settingKey = settingSplit.pop(0)
        settingValue = ":".join(settingSplit)

        if not (settingValue == "false" or settingValue == "true" or settingValue == "null" or typeNumber.match(settingValue)):
            settingValue = '"%s"' % settingValue.replace("\"", "\\\"")

        settingsStr += 'if(qxsettings["%s"]==undefined)qxsettings["%s"]=%s;%s' % (settingKey, settingKey, settingValue, lineBreak)

    return settingsStr




def main():
    parser = optparse.OptionParser("usage: %prog [options]", option_class=optparseext.ExtendAction)

    parser.add_option("-d", "--use-setting", action="extend", dest="useSetting", type="string", metavar="NAMESPACE.KEY:VALUE", default=[], help="Define a setting.")
    parser.add_option("-o", "--output-file", dest="outputFile", metavar="FILENAME", help="Name of settings script file.")
    parser.add_option("-n", "--add-new-lines", action="store_true", dest="addNewLines", default=False, help="Keep newlines in compiled files.")

    (options, args) = parser.parse_args()

    if options.outputFile == None:
        print generate(options.useSetting, options.addNewLines)
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
