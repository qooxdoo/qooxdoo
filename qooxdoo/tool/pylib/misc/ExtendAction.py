#!/usr/bin/env python
# -*- coding: utf-8 -*-

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Andreas Ecker (ecker)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

from optparse import *
from misc import json

##
# This is a modified version from the docs, e.g. doc/2.4.4/lib/optparse-adding-new-actions.html

class ExtendAction(Option):
    ACTIONS = Option.ACTIONS + ("extend", "map")
    STORE_ACTIONS = Option.STORE_ACTIONS + ("extend", "map")
    TYPED_ACTIONS = Option.TYPED_ACTIONS + ("extend", "map")

    def take_action(self, action, dest, opt, value, values, parser):
        if action == "extend":
            lvalue = value.split(",")
            while "" in lvalue:
                lvalue.remove("")
            values.ensure_value(dest, []).extend(lvalue)
        elif action == "map":
            keyval = value.split(":", 1)
            if len(keyval) == 2 and len(keyval[0]) > 0:
                if keyval[1][0] in ["[", "{"]: # decode a Json value
                    val = json.loads(keyval[1])
                else:
                    val = keyval[1]
                values.ensure_value(dest, {})[keyval[0]] = val
            else:
                raise OptionValueError("Value has to be of the form '<key>:<val>': %s" % value)
        else:
            Option.take_action(
                self, action, dest, opt, value, values, parser)
