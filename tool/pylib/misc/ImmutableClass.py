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
#
# CAVEATS
# - An issue with an immutable class is how *new* instance members are treated;
#   should they be rejected?! I.e. if an object is considered immutable,
#   existing members cannot be changed. But should you be able to add new object
#   members?
##


##
# Error class

class MutationError(RuntimeError):
    pass


##
# Meta-class for classes with single-assignment semantics

class SingleAssignmentClass(type):

    def __init__(cls, name, bases, attrd):

        def singlesetattr(self, attr, val):
            attrd = self.__dict__
            if attr not in attrd:
                super(cls, self).__setattr__(attr, val)
            else:
                raise MutationError(
                    "Attempt to change an immutable member: %s.%s" % (self.__class__.__name__, attr))

        super(SingleAssignmentClass, cls).__init__(
            name, bases, attrd)
        setattr(cls, "__setattr__", singlesetattr)


##
# Inheritable immutable class

class SingleAssignment(object):
    __metaclass__ = SingleAssignmentClass


##
# Meta-class for classes that can be switched to read-only;

class FreezableClass(type):

    def __init__(cls, name, bases, attrd):

        def singlesetattr(self, attr, val):
            attrd = self.__dict__
            if (not hasattr(self, '_frozen__')
                or attr not in attrd):
                super(cls, self).__setattr__(attr, val)
            else:
                raise MutationError(
                    "Attempt to change an immutable member: %s.%s" % (self.__class__.__name__, attr))

        def freeze(self):
            self._frozen__ = True
   
        super(FreezableClass, cls).__init__(
            name, bases, attrd)
        setattr(cls, "__setattr__", singlesetattr)
        setattr(cls, "freeze", freeze)


##
# Inheritable freezable class
# after calling .freeze() attributes of a child instance cannot
# be changed anymore.

class Freezable(object):
    __metaclass__ = FreezableClass

