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
#    MIT: https://opensource.org/licenses/MIT
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# This module implements a high-level scanner. It uses the low-level scanner
# from the Scanner module. The main additional functionality is to accumulate
# literals, such as strings, comments and regular expression literals, and to
# turn all tokens into dicts suitable for the consumption of the treegenerator
# parser module.
##

import sys, re
from ecmascript.frontend                 import lang, Comment
from ecmascript.frontend.SyntaxException import SyntaxException
import Scanner
from Scanner import LQueue

##
# Generator to turn low-level token tuples into Scanner.Token objects and
# provide and eof Token.
def tokens_2_obj(content):
    #scanner = Scanner.Scanner(content)
    scanner = Scanner.Scanner(content).__iter__()
    Token   = Scanner.Token
    arg     = None
    token   = None
    #for stoken in scanner:
    while True:
        try:
            stoken = scanner.send(arg)  # pass arg, to switch low-level scan mode (s. parseCommentI)
        except StopIteration:
            break
        token = Token(stoken)
        arg = (yield token)
    yield Token(('eof', '', token.spos+token.len if token else 0, 0))


def scanner_slice(self, a, b):
    return self.content[a:b]


##
# check if the preceding tokens contain an odd number of '\'
def is_last_escaped_token(tokens):
    cnt = 0
    i   = 1
    while True:
        if tokens[-i]['source'] == '\\':
            cnt += 1
            i -= 1
        else:
            break
    return cnt % 2 == 1


def is_last_escaped_tokobj(tokens):
    cnt = 0
    i   = 1
    while True:
        if tokens[-i].value == '\\':
            cnt += 1
            i -= 1
        else:
            break
    return cnt % 2 == 1


class Tokenizer(object):

    def __init__(self):
        self.in_stream = None
        self.token_pipe = None # make this a pipe with ready-to-use Token()'s
        self.out_stream = None
        self.line = None
        self.column = None
        self.sol = None
        self.scanner = None
        self.uniqueId = None

    ##
    # Interface function
    def parseStream(self, content, uniqueId=""):
        self.out_stream = []
        self.uniqueId = uniqueId
        self.line = self.column = 1
        self.sol = 0  # index of start-of-line
        self.scanner = scanner = Scanner.LQueue(tokens_2_obj(content, ))
        scanner.content = content
        scanner.slice = scanner_slice

        # set up internal Token stream
        self.token_pipe = LQueue(self.parseToken())

        for token in self.token_pipe:
            # delayed property settings on tokens (because they need peek ahead in Token stream)
            if token['type'] == 'comment':
                if self.restLineIsEmpty(self.token_pipe):
                    token['end'] = True                 # last non-white token on line
                else:
                    token['end'] = False
                if token['end'] and not token['begin']:
                    token['connection'] = "after"
                else:
                    token['connection'] = "before"
            self.out_stream.append(token)

        return self.out_stream


    def parseToken(self):
        for tok in self.scanner:

            hasNoPreviousDot = True
            try:
                hasNoPreviousDot = self.out_stream[-1]['detail'] != "DOT"
            except (IndexError):
                pass

            # some inital values (tok isinstanceof Scanner.Token())
            token = {
                "source" : tok.value,
                "detail" : "",
                "line"   : self.line,
                "column" : tok.spos - self.sol + 1,
                "id"     : self.uniqueId
                }

            # white space
            if (tok.name == 'white'):
                #continue
                token['type'] = 'white'

            # end of file
            elif tok.name == 'eof':
                token['type'] = 'eof'

            # line break
            elif tok.name == 'nl':
                token['type']   = 'eol'
                token['source'] = '\n'
                self.line += 1                  # increase line count
                self.sol  = tok.spos + tok.len  # char pos of next line start

            # float
            elif tok.name == 'float':
                token['type'] = 'number'
                token['detail'] = 'float'

            # hex integer
            elif tok.name == 'hexnum':
                token['type'] = 'number'
                token['detail'] = 'int'

            # integer
            elif tok.name == 'number':
                token['type'] = 'number'
                token['detail'] = 'int'

            # string
            elif tok.value in ('"', "'"):
                # accumulate strings
                token['type'] = 'string'
                if tok.value == '"':
                    token['detail'] = 'doublequotes'
                else:
                    token['detail'] = 'singlequotes'
                try:
                    token['source'] = self.parseString(self.scanner, tok.value)
                except SyntaxException, e:
                    self.raiseSyntaxException(token, e.args[0])
                token['source'] = token['source'][:-1]
                # adapt line number -- this assumes multi-line strings are not generally out
                linecnt = len(re.findall("\n", token['source']))
                if linecnt > 0:
                    self.line += linecnt

            # identifier, operator
            elif tok.name in ("ident", "op", "mulop"):

                # JS operator symbols
                if tok.value in lang.TOKENS:
                    # division, div-assignment, regexp
                    if tok.value in ('/', '/='):
                        # get the preceding (real) token
                        for ptoken in reversed(self.out_stream):
                            if ptoken['type'] in ('eol', 'white'):
                                continue
                            else:
                                prev_token = ptoken
                                break
                        # regex literal
                        if (len(self.out_stream) == 0 or (
                                (prev_token['type'] not in ['number',   # divison of number
                                                            'name',     # var holding a number
                                                            'string'])  # string representing a number
                                and (prev_token['detail'] not in ['RP', # call returning a number
                                                                  'RB'])# <can't remember>
                                )):
                            try:
                                regexp = self.parseRegexp(self.scanner)
                            except SyntaxException, e:
                                self.raiseSyntaxException(token, e.args[0])
                            token['type'] = 'regexp'
                            token['source'] = tok.value + regexp
                        # div, div-assign
                        else:
                            token['type'] = 'token'
                            token['detail'] = lang.TOKENS[tok.value]

                    # comment, inline
                    elif tok.value == '//':
                        # accumulate inline comments
                        if (len(self.out_stream) == 0 or
                            not is_last_escaped_token(self.out_stream)):
                            #import pydb; pydb.debugger()
                            commnt = self.parseCommentI(self.scanner)
                            token['type'] = 'comment'
                            token['source'] = tok.value + commnt
                            token['begin'] = not self.hasLeadingContent(self.out_stream)
                            token['end'] = True
                            token['connection'] = "before" if token['begin'] else "after"  # "^//...\n i=1;" => comment *before* code; "i=1; //..." => comment *after* code
                            token['multiline'] = False
                            token['detail'] = 'inline'
                        else:
                            print >> sys.stderr, "Inline comment out of context"

                    # comment, multiline
                    elif tok.value == '/*':
                        # accumulate multiline comments
                        if (len(self.out_stream) == 0 or
                            not is_last_escaped_token(self.out_stream)):
                            token['type'] = 'comment'
                            try:
                                commnt = self.parseCommentM(self.scanner)
                            except SyntaxException, e:
                                self.raiseSyntaxException(token, e.args[0])
                            commnt = self.alignMultiLines(commnt, token['column'])
                            token['source'] = tok.value + commnt
                            token['detail'] = Comment.Comment(token['source']).getFormat()
                            token['begin'] = not self.hasLeadingContent(self.out_stream)  # first non-white token on line
                            if token['begin']:
                                token['source'] = Comment.Text(token['source']).outdent(self.column - 1)
                            # adapt line number
                            linecnt = len(re.findall("\n", token['source']))
                            if linecnt > 0:
                                self.line += linecnt
                                token['multiline'] = True
                            else:
                                token['multiline'] = False

                        else:
                            print >> sys.stderr, "Multiline comment out of context"

                    # every other operator goes as is
                    else:
                        token['type'] = 'token'
                        token['detail'] = lang.TOKENS[tok.value]

                # JS keywords
                elif tok.value in lang.RESERVED and hasNoPreviousDot:
                    # valid syntax:
                    #   a.import            // following if condition checks for this
                    #   a = { import: 1 }   // Note: Generator will still (incorrectly) grumble about that
                    #
                    # See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Reserved_Words#Reserved_word_usage
                    try:
                        prev = self.out_stream[-1]
                        prevprev = self.out_stream[-2]

                        # only allow FUTURE_RESERVED words because of backwards compatibility
                        # Note: In ES5 RESERVED_WORDS are allowed here also
                        if tok.value in lang.FUTURE_RESERVED and self.isPropertyWithinMemberExpression(tok, prev, prevprev):
                            token['type'] = 'name'
                            token['detail'] = 'public'  # wouldn't be reserved word if not public
                        else:
                            token['type'] = 'reserved'
                            token['detail'] = lang.RESERVED[tok.value]
                    except (IndexError):
                        token['type'] = 'reserved'
                        token['detail'] = lang.RESERVED[tok.value]

                # JS/BOM objects
                elif tok.value in lang.BUILTIN:
                    token['type'] = 'builtin'

                # identifier
                elif tok.value[:2] == "__":
                    token['type'] = 'name'
                    token['detail'] = 'private'
                elif tok.value[0] == "_":
                    token['type'] = 'name'
                    token['detail'] = 'protected'
                else:
                    token['type'] = 'name'
                    token['detail'] = 'public'

            # unknown token
            else:
                print >> sys.stderr, "Unhandled lexem: %s" % tok
                pass

            yield token


    ##
    # parse a string (both double and single quoted)
    def parseString(self, scanner, sstart):
        # parse string literals
        result = []
        try:
            while True:
                part = scanner.next(sstart)
                result.append(part.value)
                if not Scanner.is_last_escaped(part.value):  # be aware of escaped quotes
                    break
        except StopIteration:
            raise SyntaxException("Unterminated string: '%s'" % u''.join(result))
        return u"".join(result)


    ##
    # parse a regular expression
    def parseRegexp(self, scanner):
        # leading '/' is already consumed
        rexp = ""
        in_char_class = False
        token = scanner.next()
        try:
            while True:
                rexp += token.value      # accumulate token strings

                # -- Check last token
                # character classes
                if token.value == "[":
                    if not Scanner.is_last_escaped(rexp): # i.e. not preceded by an odd number of "\"
                        in_char_class = True
                elif token.value == "]" and in_char_class:
                    if not Scanner.is_last_escaped(rexp):
                        in_char_class = False
                elif token.name in ['nl','eof']:
                    raise StopIteration
                # check for termination of rexp
                elif rexp[-1] == "/" and not in_char_class:  # rexp[-1] != token.value if token.value == "//"
                    if not Scanner.is_last_escaped(rexp):
                        break
                token = scanner.next()

        except StopIteration:
            raise SyntaxException("Unterminated regexp literal: '%s'" % rexp)

        # regexp modifiers
        try:
            if scanner.peek()[0].name == "ident":
                token = scanner.next()
                rexp += token.value
        except StopIteration:
            pass

        return rexp


    ##
    # parse an inline comment // ...
    def parseCommentI(self, scanner):
        result = scanner.next('\n')  # inform the low-level scanner to switch to commentI
        return result.value


    ##
    # parse a multiline comment /* ... */
    def parseCommentM(self, scanner):
        res = []
        try:
            while True:
                token = scanner.next(r'\*/')  # inform the low-level scanner to switch to commentM
                res.append(token.value)
                if not Scanner.is_last_escaped(token.value):
                    break
        except StopIteration:
            raise SyntaxException("Unterminated multi-line comment:\n '%s'" % u''.join(res))
        return u"".join(res)


    ##
    # generic element parser for delimited strings (string/regex literals,
    # comments)
    # both start token and terminator token will be part of the element
    def parseDelimited(self, scanner, terminator):
        tokens = []
        for token in scanner:
            tokens.append(token)
            if token.value == terminator:
                if not is_last_escaped_tokobj (tokens):
                    break
        else:
            res = scanner.slice(tokens[0].spos, token.spos + token.len)
            raise SyntaxException ("Run-away element", res)

        return tokens


    ##
    # syntax exception helper
    def raiseSyntaxException (self, token, desc = u""):
        msg = desc + " (%s:%d)" % (token['id'], token['line'])
        raise SyntaxException (msg)

    ##
    # check if the rest of the line is empty (only white)
    def restLineIsEmpty(self, scanner):
        try:
            toks = scanner.peek(2)
        except StopIteration:
            return True   # TODO: this is a hack

        if (toks[0]['type'] == 'eol' or
            (toks[0]['type'] == 'white' and toks[1]['type'] == 'eol')):
            return True
        else:
            return False

    ##
    # Whether tok is a property within a MemberExpression.
    #
    # Example:
    #   foo.bar.interestingProperty
    #     tok = interestingProperty
    #     prevtok = .
    #     preprevtok = bar
    #
    #   returns True
    #
    def isPropertyWithinMemberExpression(self, tok, prevtok, prevprevtok):
        pt = prevtok
        ppt = prevprevtok
        return (tok.name == 'ident' and (pt['detail'] == 'DOT' and pt['type'] == 'token') and
                (ppt['detail'] in ('public', 'protected', 'private') and ppt['type'] == 'name'))

    ##
    # check if there is a preceding non-white token on this line
    def hasLeadingContent(self, tokens):
        # tokens empty
        if not len(tokens):
            return False
        else:
            for token in reversed(tokens):
                if token["type"] == 'eol':
                    break
                if token["type"] not in ('white', 'eol'):
                    return True
            return False

    ##
    # Remove whitespace at the beginning of subsequent lines in a multiline text
    # (usually comment).
    LeadingSpace = re.compile('\A\s+',re.U)
    def alignMultiLines(self, text, firstColumn):
        firstIndent = firstColumn - 1 # columns start with 1
        lines = text.split('\n')
        nlines = [lines[0]]
        for line in lines[1:]:
            mo = self.LeadingSpace.search(line)
            # only touch lines that are at least indented as the first line
            if mo and len(mo.group()) >= firstIndent:
                nline = self.LeadingSpace.sub(' ' * (len(mo.group())-firstIndent), line)
            else :
                nline = line
            nlines.append(nline)
        return '\n'.join(nlines)


if __name__ == "__main__":
    from misc import filetool
    if len(sys.argv)>1:
        fname = sys.argv[1]
        text = filetool.read(fname)
        tokenizer = Tokenizer()
        toks = tokenizer.parseStream(text)
        for tok in toks:
            print tok
