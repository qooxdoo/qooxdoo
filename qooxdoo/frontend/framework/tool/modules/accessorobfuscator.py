################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Andreas Ecker (ecker)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

import tree, treeutil

def process(node, verbose=False):
    return process_loop(node, verbose)

def process_loop(node, verbose):
    if node.type == "variable" and node.hasChildren():
        repl = ""
        first = True

        for child in node.children:
            if child.type == "identifier":
                if first:
                  repl = child.get("name")
                  first = False
                else:
                  repl += '["' + child.get("name") + '"]'

            else:
              return

        replNode = treeutil.compileString(repl)
        node.parent.replaceChild(node, replNode)

        return

    if node.hasChildren():
        for child in node.children:
            process_loop(child, verbose)
