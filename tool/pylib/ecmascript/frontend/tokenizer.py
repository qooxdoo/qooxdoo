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
# Interface function
def parseStream(content, uniqueId=""):
    tokens = []
    line = column = 1
    sol = 0  # index of start-of-line
    scanner = Scanner.LQueue(tokens_2_obj(content, ))
    scanner.content = content
    scanner.slice = scanner_slice
    for tok in scanner:
        # some inital values (tok isinstanceof Scanner.Token())
        token = {
            "source" : tok.value, 
            "detail" : "",
            "line"   : line, 
            "column" : tok.spos - sol + 1, 
            "id"     : uniqueId
            }

        # white space
        if (tok.name == 'white'):
            continue

        # end of file
        elif tok.name == 'eof':
            token['type'] = 'eof'
        
        # line break
        elif tok.name == 'nl':
            token['type']   = 'eol'
            token['source'] = ''    # that's the way the old tokenizer does it
            line += 1                  # increase line count
            sol  = tok.spos + tok.len  # char pos of next line start
        
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
                token['source'] = parseString(scanner, tok.value)
            except SyntaxException, e:
                raiseSyntaxException(token, e.args[0])
            token['source'] = token['source'][:-1]
            # adapt line number -- this assumes multi-line strings are not generally out
            linecnt = len(re.findall("\n", token['source']))
            if linecnt > 0:
                line += linecnt

        # identifier, operator
        elif tok.name in ("ident", "op", "mulop"):

            # JS operator symbols
            if tok.value in lang.TOKENS:
                # division, div-assignment, regexp
                if tok.value in ('/', '/='):
                    # get the preceding (real) token
                    for ptoken in reversed(tokens):
                        if ptoken['type'] in ('eol', 'white'):
                            continue
                        else:
                            prev_token = ptoken
                            break
                    # regex literal
                    if (len(tokens) == 0 or (
                            (prev_token['type']   != 'number') and
                            (prev_token['detail'] != 'RP')     and
                            (prev_token['detail'] != 'RB')     and
                            (prev_token['type']   != 'name'))):
                        regexp = parseRegexp(scanner)
                        token['type'] = 'regexp'
                        token['source'] = tok.value + regexp
                    # div, div-assign
                    else:
                        token['type'] = 'token'
                        token['detail'] = lang.TOKENS[tok.value]

                # comment, inline
                elif tok.value == '//':
                    # accumulate inline comments
                    if (len(tokens) == 0 or
                        not is_last_escaped_token(tokens)):
                        commnt = parseCommentI(scanner)
                        token['type'] = 'comment'
                        token['source'] = tok.value + commnt
                        token['begin'] = not hasLeadingContent(tokens)
                        token['end'] = True
                        token['connection'] = "before" if token['begin'] else "after"  # "^//...\n i=1;" => comment *before* code; "i=1; //..." => comment *after* code
                        token['multiline'] = False
                        token['detail'] = 'inline'
                    else:
                        print >> sys.stderr, "Inline comment out of context"
                
                # comment, multiline
                elif tok.value == '/*':
                    # accumulate multiline comments
                    if (len(tokens) == 0 or
                        not is_last_escaped_token(tokens)):
                        token['type'] = 'comment'
                        try:
                            commnt = parseCommentM(scanner)
                        except SyntaxException, e:
                            raiseSyntaxException(token, e.args[0])
                        commnt = alignMultiLines(commnt, token['column'])
                        token['source'] = tok.value + commnt
                        token['detail'] = Comment.Comment(token['source']).getFormat()
                        token['begin'] = not hasLeadingContent(tokens)
                        if restLineIsEmpty(scanner):
                            token['end'] = True
                        else:
                            token['end'] = False
                        if token['begin']:
                            token['source'] = Comment.Text(token['source']).outdent(column - 1)
                        token['source'] = Comment.Comment(token['source']).correct()
                        if token['end'] and not token['begin']:
                            token['connection'] = "after"
                        else:
                            token['connection'] = "before"
                        # adapt line number
                        linecnt = len(re.findall("\n", token['source']))
                        if linecnt > 0:
                            line += linecnt
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
            elif tok.value in lang.RESERVED:
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

        tokens.append(token)
    return tokens


##
# parse a string (both double and single quoted)
def parseString(scanner, sstart):
    # parse string literals
    result = []
    while True:
        part = scanner.next(sstart)
        result.append(part.value)
        if not Scanner.is_last_escaped(part.value):  # be aware of escaped quotes
            break
        # run-away strings bomb in the above scanner.next()
    return u"".join(result)


##
# parse a regular expression
def parseRegexp(scanner):
    # leading '/' is already consumed
    rexp = ""
    in_char_class = False
    token = scanner.next()
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
        # check for termination of rexp
        elif rexp[-1] == "/" and not in_char_class:  # rexp[-1] != token.value if token.value == "//"
            if not Scanner.is_last_escaped(rexp):
                break

        token = scanner.next()

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
def parseCommentI(scanner):
    result = scanner.next('\n')  # inform the low-level scanner to switch to commentI
    return result.value


##
# parse a multiline comment /* ... */
def parseCommentM(scanner):
    res = []
    while True:
        token = scanner.next(r'\*/')  # inform the low-level scanner to switch to commentM
        res.append(token.value)
        if not Scanner.is_last_escaped(token.value):
            break
        # run-away comments bomb in the above scanner.next()
    return u"".join(res)


##
# generic element parser for delimited strings (string/regex literals, 
# comments)
# both start token and terminator token will be part of the element
def parseDelimited(scanner, terminator):
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
def raiseSyntaxException (token, desc = u""):
    msg = desc + " (%s:%d)" % (token['id'], token['line'])
    raise SyntaxException (msg)

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


##
# check if the rest of the line is empty (only white)
def restLineIsEmpty(scanner):
    try:
        toks = scanner.peek(2)
    except StopIteration:
        return True   # TODO: this is a hack

    if (toks[0].name == 'nl' or
        (toks[0].name == 'white' and toks[1].name == 'nl')):
        return True
    else:
        return False


##
# check if there is a preceding token on this line
def hasLeadingContent(tokens):
    # tokens empty
    if not len(tokens):
        return False
    else:
        if tokens[-1]["type"] == "eol":
            return False
        else:
            return True

##
# Remove whitespace at the beginning of subsequent lines in a multiline text
# (usually comment).
LeadingSpace = re.compile('\A\s+',re.U)
def alignMultiLines(text, firstColumn):
    firstIndent = firstColumn - 1 # columns start with 1
    lines = text.split('\n')
    nlines = [lines[0]]
    for line in lines[1:]:
        mo = LeadingSpace.search(line)
        # only touch lines that are at least indented as the first line
        if mo and len(mo.group()) >= firstIndent:
            nline = LeadingSpace.sub(' ' * (len(mo.group())-firstIndent), line)
        else :
            nline = line
        nlines.append(nline)
    return '\n'.join(nlines)


if __name__ == "__main__":
    from misc import filetool
    if len(sys.argv)>1:
        fname = sys.argv[1]
        text = filetool.read(fname)
        toks = parseStream(text)
        for tok in toks:
            print tok
