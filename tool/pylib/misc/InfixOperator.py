#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  This is too good to miss, the famous Infix operator hack.
#  From ActiveState Code.
#
#  Terms of use:
#    http://code.activestate.com/help/terms/
#
#  Author:
#    Ferdinand Jamitzky
#
#  Source:
#    http://code.activestate.com/recipes/384122-infix-operators/
#
#  License:
#    PSF:  http://www.python.org/psf/license/
#
################################################################################

##
# Example:
#  x = Infix(lambda x,y: x*y)
#  print 2 |x| 4   # => 8
#  print 3 <<x>> 4 # => 12
#
class Infix(object):
    def __init__(self, function):
        self.function = function
    def __ror__(self, other):
        return Infix(lambda x, self=self, other=other: self.function(other, x))
    def __or__(self, other):
        return self.function(other)
    def __rlshift__(self, other):
        return Infix(lambda x, self=self, other=other: self.function(other, x))
    def __rshift__(self, other):
        return self.function(other)
    def __call__(self, value1, value2):
        return self.function(value1, value2)
