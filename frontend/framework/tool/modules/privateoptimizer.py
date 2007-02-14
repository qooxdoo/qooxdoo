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

import tree, mapper

def patch(node, known, prefix, verbose):
  if node.type == "identifier":
    name = node.get("name", False)

    if name != None and name.startswith("__"):
      if not name in known:
        known[name] = "__%s%s" % (prefix, len(known))

      if verbose:
        print "      - Replace: %s with %s" % (name, known[name])

      node.set("name", known[name])

  if node.hasChildren():
    for child in node.children:
      patch(child, known, prefix, verbose)
