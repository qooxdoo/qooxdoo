#!/usr/bin/env python
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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
#<h2>Module Description</h2>
#<pre>
#
# NAME
#  path.py -- Implements a 'path' data type.
#
# SYNTAX
#  from path import Path
#  p = Path()
#  p.opts.basic.log.level = 3
#  p.opts.advanced.dithering.shaded = True
#
# DESCRIPTION
#  Paths are a convenient data type to represent data in a structured way. There
#  are many examples of path-like expressions in the computing area:
#    - /usr/local/bin/python        -- file system paths
#    - com.sun.java.swing.text.html -- Java classes
#    - 10.20.40.5                   -- IP addresses
#
#  This data type was inspired by Rebol's 'path' type (www.rebol.com).
#
#  Currently, the only thing it does is to allow you to reference deeply nested
#  attributes without first constructing the intermediate layers. The path
#  object will do that for you. This way you can create nicely nested name
#  structures with a single top-level symbol and meaningful intermediate
#  nesting. No more "opts['advanced']['dithering']['shaded']" with dictionaries,
#  or tedious constructor calls for embedded objects.
#
#</pre>                                                                       
##                                                                            

##
# The Path class

class Path(object):
    def __getattr__(self,name):
        p = Path()
        self.__dict__[name] = p
        return p

