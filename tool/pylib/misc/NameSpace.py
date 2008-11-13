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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# NAME
#  NameSpace  -- an empty, extensible class
#
# DESCRIPTION
#  Empty mock class; instances of this class are easily extendable, like
#  c = NameSpace(); c.i = 1
#  This wouldn't be possible using the build in 'object' class, e.g. 
#  'c = object(); c.i = 1' would fail with an error.
#  It is good to create a protected name space, and to have mutable variables,
#  as you would need e.g. in a nested function.
#
##

class NameSpace(object):
    pass
