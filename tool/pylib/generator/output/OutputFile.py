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

##
# OutputFile - base class for generated files (mostly .js)
##

import sys, os, re, types

class OutputFile(object):

    def __init__(self, path=None):
        self.path   = path
        self.m_time_= None  # last-modified time stamp

    ##
    # Resource's last modified time (in epoch secs)
    def m_time(self, force=False):
        if not self.m_time_ or force:
            self.m_time_ = os.stat(self.path).st_mtime
        return self.m_time_
