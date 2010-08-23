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
# Immutable Class  -- class attributes with single-assignment semantics
#
# SYNTAX
#  class MyImmutable(Immutable,...)
# or
#  class MyImmutable(...):
#      __metaclass__ = ImmutableClass
##


class MutationError(RuntimeError):
    pass


class ImmutableClass(type):

    def __init__(cls, name, bases, attrd):

        def singlesetattr(self, attr, val):
            attrd = self.__dict__
            if attr not in attrd:
                super(cls, self).__setattr__(attr, val)
            else:
                raise MutationError(
                    "Attempt to change an immutable member: %s.%s" % (self.__class__.__name__, attr))

        super(ImmutableClass, cls).__init__(
            name, bases, attrd)
        setattr(cls, "__setattr__", singlesetattr)


class Immutable(object):
    __metaclass__ = ImmutableClass

