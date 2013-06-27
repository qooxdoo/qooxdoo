#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2013 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import sys, os, re

##
# Compiler Hints Support
#
# 'ignore' hints can have globs (like 'qx.test.*')
# This class provides a wrapper around those entries so you can immediately match
# agaist the regexp.
##

class HintArgument(object):

    def __init__ (self, source=""):
        self.source = source  # "qx/test/*"
        if source.endswith('.*'):
            end_wildcard = True
            so = source[:-2]
        else:
            end_wildcard = False
            so = source
        so = re.escape(so)  # for '.', '$'
        so = so.replace(r'\*', '.*')  # re-activate '*'
        if end_wildcard:
            so += r'(?:\..*|$)'
        else:
            so += '$'
        self.regex = re.compile(r'^%s' % so) # re.compile("qx\.test\.*")

    ##
    # Overloading __eq__ with regex match (but mind that 'in' uses hashes first!)
    def __eq__ (self, other):
        return self.regex.match(other)

    ##
    # Let self behave like a string in most situations
    #def __getattr__(self, name):
    #    return getattr(self.source, name)

