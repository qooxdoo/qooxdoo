#!/usr/bin/env python

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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# Base resource class
##

import re, os, sys, types

class Resource(object):
    
    def __init__(self, path=None):
        self.id     = None
        self.path   = path
        self.library= None

    def __str__(self):
        return self.id

    def __repr__(self):
        return "<%s:%s>" % (self.__class__.__name__, self.id)

    ##
    # make the .id significant for 'in' tests, and set() operations (?)
    def __eq__(self, other):
        return self.id == other.id

    ##
    # make the .id significant for set() operations
    def __hash__(self):
        return hash(self.id)
    
    def toResinfo(self):
        return self.library.namespace

    ##
    # Resource's last modified time (in epoch secs)
    def m_time(self):
        return os.stat(self.path).st_mtime

