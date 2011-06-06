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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# NAME
#  NameSpace  -- an empty, extensible class
#
# SYNTAX
#  from NameSpace import NameSpace
#  p = NameSpace()
#  p.name = "foo"
#  p.opts.basic.log.level = 3
#  p.opts.advanced.dithering.shaded = True
#
# DESCRIPTION
#  Empty mock class; instances of this class are easily extendable, like
#  c = NameSpace()
#  c.i = 1
#  This wouldn't be possible using the build in 'object' class, e.g. 
#  'c = object(); c.i = 1' would fail with an error.
#  It is good for creating a protected name space with mutable variables,
#  as you would need e.g. in a nested function.
#
#  This class has the additional convenience that deeply nested members of an
#  instance "spring into life" just by assigning to them. You never have to
#  construct the intervening levels first. Therefore, NameSpace is also a
#  convenient data type to represent data in a structured way. There are many
#  examples of path-like expressions in the computing area:
#    - /usr/local/bin/python        -- file system paths
#    - com.sun.java.swing.text.html -- Java classes
#    - 10.20.40.5                   -- IP addresses
#
#  which can be easily instantiated using NameSpace objects (this was inspired
#  by Rebol's 'path' type). No more "opts['advanced']['dithering']['shaded']"
#  with dictionaries, or tedious constructor calls for embedded objects.
##                                                                            

class NameSpace(object):

    # this little thing does all the magic of automatically constructing nested
    # objects
    def __getattr__(self,name):
        p = NameSpace()
        self.__dict__[name] = p
        return p
