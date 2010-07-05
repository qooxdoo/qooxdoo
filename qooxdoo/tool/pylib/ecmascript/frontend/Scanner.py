#!/usr/bin/env python

import sys, os, re, types
from collections import deque

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
         (?P<float>\d*\.\d+(?:[eE][+-]?\d+)?          # float, dotted
                  |\d+[eE][+-]?\d+                    # undotted, with 'e'
                  )
        |(?P<hexnum>0x[0-9A-Fa-f]+)  # hex number
        |(?P<number>\d+)    # number  TODO: there is no such thing in JS!
        |(?P<ident>[$\w]+)  # identifier, name
        |(?P<nl>            # unicode line separators
                 \x0D\x0A
                #|\x20\x28      # strange: this is ' (' !?
                #|\x20\x29      # strange: this is ' )' !?
                |\x0A
                |\x0D
                )
        |(?P<white>(?:(?:\s|\ufeff)(?<!\n))+)     # white ( + BOM - \n)
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
        |(?P<op>\W)         # what remains (operators)
        ''', re.VERBOSE|re.DOTALL|re.MULTILINE|re.UNICODE) # re.LOCALE?!

    # yields :
    # ( <group_name> , <scan_string> , <start_pos> , <scan_length> )
    def __iter__(self):
        miter = self.patt.finditer(self.inData)
        for mo in miter:
            mstart = mo.start(0)
            mend   = mo.end(0)
            if mstart != self.next_start:  # assure compactness of scan
                raise AssertionError, "There's a scan gap before: %s (at pos %d)" % (mo.group(), self.next_start)
            self.next_start = mend   # match range is [mo.start(), mo.end()[
            yield (mo.lastgroup, mo.groupdict()[mo.lastgroup], mstart, mend - mstart)


##
# Tokenizer -- the second layer of the tokenizer; this should be used by a parser
#
#  It uses the low-level Scanner and amends it in these ways:
#  - accumulating strings inside quotes
#  - accumulating comments, both // and /*..*/ style
#  - (classifies operators and key words ?)
#
#  It returns tokens as Token objects.
#  These tokens will then be used by the (various) parser(s) that might e.g. turn
#  each token into a different token object and/or node for the AST.
#
#  This second-level tokenizer is implemented as a low-level parser.

class Tokenizer(IterObject):
   
    def __init__(self, stream):
        super(Tokenizer, self).__init__(stream)

    def resetIter(self):
        self.scanner = LQueue(Scanner(self.inData).__iter__())
        self.scanner.next = self.scanner.__iter__().next
        super(Tokenizer, self).resetIter()

    def string(self, sstart):
        # parse string literals
        result = sstart
        for stoken in self.scanner:
            t = Token(stoken)
            result += t.value
            if (t.value == sstart and not is_last_escaped(result)):  # be aware of escaped quotes
                break
        return result

    def comment_inline(self, cstart):
        # parse // type comments
        result = cstart
        for stoken in self.scanner:
            t = Token(stoken)
            if t.name == 'nl':
                result += t.value  # include <nl> in comment for now
                break
            else:
                result += t.value
        return result

    def comment_multi(self, cstart):
        # parse /**/ type comments
        result = cstart
        for stoken in self.scanner:
            t = Token(stoken)
            if t.value == '*/':
                result += t.value
                break
            else:
                result += t.value
        return result

    
    def peek(self, n=1):
        "peek n tokens ahead"
        toks = []
        pushback = []
        cnt  = 0

        # get the desired token
        while cnt < n:
            t = self.scanner.next()
            pushback.append(t)
            token = Token(t)
            toks.append(token)
            if token.name == "eof":
                break
            cnt += 1

        # put all retrieved tokens back
        for t in pushback[::-1]:
            self.scanner.putBack(t)

        return toks




    # yields :
    # Token 
    #  .name  : [ float   | number   | ident    | nl | white | mulop | op | stringD
    #           | stringS | commentI | commentM ],
    #  .value : <scanned_string>,
    #  .spos  : <number>,           # starting char position in stream
    #  .len   : <number>,           # length of value
    def __iter__(self):
        for stoken in self.scanner:
            token = Token(stoken)
            # TODO: Problem comment /* foo bar's (<- starts string parsing) ...
            #if token.value in ['"', "'"]:  # parse a complete string
            #    s = self.string(token.value)
            #    token.value = s
            #    if token.value[0] == '"':
            #        token.name  = 'stringD'  # double-quoted
            #    else:
            #        token.name  = 'stringS'  # single-quoted
            # TODO: Problem regexp: /\//g => '/', '\', '//', ...
            #elif token.value == '//':      # parse // comment
            #    s = self.comment_inline(token.value)
            #    token.value = s
            #    token.name  = 'commentI'     # inline comment
            #elif token.value == '/*':      # parse /**/ comment
            #    s = self.comment_multi(token.value)
            #    token.value = s
            #    token.name  = 'commentM'     # multi-line comment

            yield token

        yield Token(('eof', '', token.spos+token.len, 0)) # temp., to please tdop-4.py


##
# Token  -- token class returned by the Tokenizer class
#           mainly parses low-level scanner tuples into objects

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
#    (.pushBack())
#
#  The StopIteration exception is propagated (i.e.: uncaught) from the ori-
#  ginal iterator. The interesting end of the deque is the left, hence the
#  name "LQueue".

class LQueue(object):

    def __init__(self, iterator):
        self.iterator = iterator
        self.queue     = deque(())

    def next(self):
        if len(self.queue) == 0:
            self.queue.append(self.iterator.next())
        return self.queue.popleft()

    def peek(self, *args):
        return self.iterator.peek(*args)

    def __iter__(self):
        while True:
            if len(self.queue) == 0:
                self.queue.append(self.iterator.next())
            yield self.queue.popleft()

    def putBack(self, item):
        self.queue.appendleft(item)



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
    tokenizer = Tokenizer(file)
    for tok in tokenizer:
        print tok

