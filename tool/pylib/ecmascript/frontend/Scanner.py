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
# The main purpose of this module is to provide a low-level JS scanner,
# materialized in the Scanner class. It only recognizes primitive lexems, like
# numbers, operators, and symbol names, but nothing that requires context
# awareness like strings or comments.
##

import sys, os, re, types
from collections import deque
from ecmascript.frontend.SyntaxException import SyntaxException

##
# IterObject  -- abstract base class for iterators, making them resettable and
#                providing an immediate .next() method
#

class IterObject(object):

    def __init__(self, inData):
        self.inData = inData
        self.resetIter()

    def resetIter(self):
        self._iter = self.__iter__()
        self.next  = self._iter.next

    def __iter__(self):
        raise RuntimeError("You have to overload the __iter__ method!")


##
# Scanner -- low-level scanner that reads text from a stream and returns simple tokens as tuples
#
# Usage:
#   f=open('file.js')
#   fs= f.read()
#   x=Scanner(text)
#   a=[y for y in Scanner(text)]

class Scanner(IterObject):

    def __init__(self, stream):
        super(Scanner, self).__init__(stream)
        self.next_start = 0

    patt  = re.compile(ur'''
         (?P<float>
                 \d*\.\d+(?:[eE][+-]?\d+)?        # float, dotted
                |\d+[eE][+-]?\d+                  # undotted, with 'e'
                )
        |(?P<hexnum> 0x[0-9A-Fa-f]+)  # hex number
        |(?P<number> \d+)       # number  TODO: there is no such thing in JS!
        |(?P<ident>  [$\w]+)    # identifier, name
        |(?P<nl>                # unicode line separators
                 \x0D\x0A
                #|\x20\x28      # strange: this is ' (' !?
                #|\x20\x29      # strange: this is ' )' !?
                |\x0A
                |\x0D
                )
        |(?P<white> (?:(?:\s|\ufeff)(?<!\n))+)     # white ( + BOM - \n)
        |(?P<mulop>         # multi-char operators
                 <<=?           # <<, <<=
                |>=             # >=
                |<=             # <=
                |===?           # ==, ===
                |!==?           # !=, !==
                |[-+*/%|^&]=    # -=, +=, *=, /=, %=, |=, ^=, &=
                |>>>?=?         # >>, >>>, >>=, >>>=
                |&&             # &&
                |[|^]\|         # ||, ^|
                |\+\+           # ++
                |--             # --
                |::             # ::
                |\.\.           # ..
                |//             # // (end-of-line comment)
                |/\*            # /* (start multi-line comment)
                |\*/            # */ (end multi-line comment)
                )
        |(?P<op> \W)            # what remains (operators)
        ''', re.VERBOSE|re.DOTALL|re.MULTILINE|re.UNICODE) # re.LOCALE?!

    # individual regex to search fast-forward to potential string ends (both comments and quoted)
    stringEnd         = {}
    stringEnd['\n']   = re.compile('(?P<commI>.*(?=\n|$))', re.UNICODE)
    stringEnd[r'\*/'] = re.compile(r'(?P<commM>.*?\*/)',  re.DOTALL|re.MULTILINE|re.UNICODE)
    stringEnd['"']    = re.compile(r'(?P<dquote>.*?")', re.DOTALL|re.UNICODE)
    stringEnd["'"]    = re.compile(r"(?P<squote>.*?')", re.DOTALL|re.UNICODE)

    ##
    # yields :
    # ( <group_name> , <scan_string> , <start_pos> , <scan_length> )
    def __iter__(self):
        delimiter  = None
        inData     = self.inData
        lenData    = len(inData)
        cursor     = 0
        while cursor < lenData:
            if delimiter:
                mo = self.stringEnd[delimiter].search(inData, pos=cursor)
            else:
                mo = self.patt.match(inData, pos=cursor)
            if mo:
                mo_lastgroup = mo.lastgroup
                mstart       = mo.start()
                mend         = mo.end()
                mlength      = mend - mstart
                if cursor != mstart:
                    raise RuntimeError("(This should never happen). There is a scan gap AFTER:\n \"%s\"\nAND BEFORE:\n \"%s\"" % (inData[cursor-100:cursor], inData[mstart:mstart+100]))
                cursor       = mend # when using the 'pos' parameter in re.search, mo.start/end refer to the *entire* underlying string
                delimiter = (yield (mo_lastgroup, mo.group(mo_lastgroup), mstart, mlength))
            else:
                raise SyntaxException("Unable to tokenize text starting with: \"%s\"" % inData[cursor:cursor+200])


##
# Token  -- wraps a low-level scanner tuple into a simple object

class Token(object):
    __slots__ = 'name', 'value', 'spos', 'len'

    def __init__(self, ttup):
        (
        self.name,    # type
        self.value,
        self.spos,    # character position within stream
        self.len,     # length of value
        )         = ttup

    def __str__(self):
        return "(%s, %r, %d, %d)" % (self.name, self.value, self.spos, self.len)


##
# LQueue  -- enhanced queue that allows push-back from one ("Left") side
#
#  I'm using this class as a wrapper around (token) iterators, so I can not
#  only get the next item from the iterator, but also push it back again.
#  This allows peek-ahead processing of tokens, and methods can push tokens
#  back into the stream if they find they don't want to use them.
#  The implementation is based on a collections.deque double ended queue that
#  uses one end (the "right" one) to fill from the iterator, and the other
#  (the "left") end as the producer end for .next() iteration and the push-
#  back method. Here are the schematics:
#
#                     -------------------------
#   to consumer <---         LQueue              <--- from source iterator
#    (.next())        -------------------------
#
#   from consumer--->
#    (.putBack())
#
#  The StopIteration exception is propagated (i.e.: uncaught) from the ori-
#  ginal iterator. The interesting end of the deque is the left, hence the
#  name "LQueue".

class LQueue(object):

    def __init__(self, iterator):
        self.iterator = iterator
        self.queue     = deque(())

    def next(self, arg=None):
        if len(self.queue) == 0:
            self.queue.append(self.iterator.send(arg))
        return self.queue.popleft()

    ##
    # peek n tokens ahead
    def peek(self, n=1):
        toks = []
        cnt  = 0

        # get the desired token
        while cnt < n:
            try:
                t = self.next()
            except StopIteration:
                break
            toks.append(t)
            cnt += 1

        # put all retrieved tokens back
        for t in toks[::-1]:
            self.putBack(t)

        return toks


    def putBack(self, item):
        self.queue.appendleft(item)


    def __iter__(self):
        while True:
            if len(self.queue) == 0:
                self.queue.append(self.iterator.next())  # let self.iterator's StopIteration propagate
            yield self.queue.popleft()


##
# LimLQueue   -- limited queue that only allows adding from the "Left"
#
# Elements can be added from the left, and accessed with their index (like an array).
# If more than <limit> elements are added to the left, elements are dropped from the right.
#
class LimLQueue(deque):

    def __init__(self, limit=10, iterable=[]):
        self._limit = limit
        deque.__init__(self, iterable)

    def appendleft(self, elem):
        if len(self) >= self._limit:
            self.pop()
        deque.appendleft(self, elem)



# - Helpers -------------------------------------------------------------------

## 
# is_last_escaped  -- check whether the last char in a string is escaped, i.e. preceded
#                     by an odd number of consecutive escape chars ("\")

def is_last_escaped(s):
        i = len(s) - 2  # start from but-last char
        c = 0
        while i>=0:     # indexing backwards
            if s[i] == "\\":
                c += 1  # counting escape chars
                i -= 1
            else:
                break
        return c % 2 == 1  # odd number means last char is escaped


# - Main ----------------------------------------------------------------------

# syntax: ./Scanner.py <classfile>.js

if __name__ == "__main__":
    file = open(sys.argv[1]).read()
    tokenizer = Scanner(file).__iter__()
    #for tok in tokenizer:
    #    print tok
    c = None
    while True:
        try:
            tok = tokenizer.send(c)
        except StopIteration:
            break
        if tok[1] ==  '//':
            c = '\n'
        elif tok[1] == '/*':
            c = r'\*/'
        elif tok[1] in ['"', "'"]:
            c = tok[1]
        else:
            c = None
        print tok

