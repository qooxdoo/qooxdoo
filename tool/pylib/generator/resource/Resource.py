#!/usr/bin/env python
# -*- coding: utf-8 -*-

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2011 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    MIT: https://opensource.org/licenses/MIT
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# Base resource class
#
# A resource in our context is simply a file that has relevance for a
# JavaScript application.
##

import re, os, sys, types, unicodedata as unidata

class Resource(object):
    
    def __init__(self, path=None):
        self.path   = path
        self.set_id(unicode(id(self)))  # this is just a default, to have something
        self.library= None
        self.m_time_= None  # last-modified time stamp

    ##
    # <id> -- must be type unicode()
    def set_id(self, id):
        self.id = unidata.normalize("NFC", id)

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
        #return self.hash
        if hasattr(self, 'id'):
            return hash(self.id)
        else:
            return id(self)
    
    def toResinfo(self):
        return self.library.namespace

    ##
    # Resource's last modified time (in epoch secs)
    def m_time(self, force=False):
        if not self.m_time_ or force:
            self.m_time_ = os.stat(self.path).st_mtime
        return self.m_time_
