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

import sys, re
from ecmascript.frontend import lang, comment
import Scanner

##
# Interface function
def parseStream(content, uniqueId=""):
    tokens = []
    line = column = sol = 1
    #scanner = Scanner.Tokenizer(content, ) #.__iter__()
    scanner = Scanner.LQueue(Scanner.Tokenizer(content, )) #.__iter__()
    for tok in scanner:
        # tok isinstanceof Scanner.Token()
        token = {"source": tok.value, "detail" : "", "line": line, "column": tok.spos - sol + 1, "id": uniqueId}
        if (tok.name == 'white'):
            continue
        elif tok.name in ('commentI', 'commentM'):
            raise SyntaxException("Wrong token from scanner: %r" % tok)
        elif tok.name == 'eof':
            token['type'] = 'eof'
        elif tok.name == 'nl':
            token['type']   = 'eol'
            token['source'] = ''    # that's the way the old tokenizer does it
            line += 1                  # increase line count
            sol  = tok.spos + tok.len  # char pos of next line start
        elif tok.name == 'float':
            token['type'] = 'number'
            token['detail'] = 'float'
        elif tok.name == 'hexnum':
            token['type'] = 'number'
            token['detail'] = 'int'
        elif tok.name == 'number':
            token['type'] = 'number'
            token['detail'] = 'int'
        elif tok.name == 'stringD':
            token['type'] = 'string'
            token['detail'] = 'doublequotes'
            token['source'] = tok.value[1:-1]  # strip quotes
        elif tok.name == 'stringS':
            token['type'] = 'string'
            token['detail'] = 'singlequotes'
            token['source'] = tok.value[1:-1]  # strip quotes
        elif tok.value in ('"', "'"):
            token['type'] = 'string'
            if tok.value == '"':
                token['detail'] = 'doublequotes'
            else:
                token['detail'] = 'singlequotes'
            token['source'] = parseString(scanner, tok.value)
            token['source'] = token['source'][:-1]
            #print "(string)", token['source']
        elif tok.name in ("ident", "op", "mulop"):
            if tok.value in lang.TOKENS:
                if tok.value == '/':
                    if (len(tokens) == 0 or (
                                (tokens[-1]['detail'] != 'int')   and
                                (tokens[-1]['detail'] != 'float') and
                                (tokens[-1]['detail'] != 'RP')    and
                                (tokens[-1]['detail'] != 'RB')    and
                                (tokens[-1]['type']   != 'name'))):
                        regexp = parseRegexp(scanner)
                        token['type'] = 'regexp'
                        token['source'] = '/' + regexp
                    else:
                        token['type'] = 'token'
                        token['detail'] = lang.TOKENS[tok.value]
                elif tok.value == '//':
                    if (len(tokens) == 0 or
                        not is_last_escaped_token(tokens)):
                        commnt = parseCommentI(scanner)
                        token['type'] = 'comment'
                        token['source'] = '//' + commnt
                        token['begin'] = not hasLeadingContent(tokens)
                        token['end'] = True
                        token['connection'] = "before" if token['begin'] else "after"  # "^//...\n i=1;" => comment *before* code; "i=1; //..." => comment *after* code
                        token['multiline'] = False
                        token['detail'] = 'inline'
                    else:
                        print >> sys.stderror, "Inline comment out of context"
                elif tok.value == '/*':
                    if (len(tokens) == 0 or
                        not is_last_escaped_token(tokens)):
                        commnt = parseCommentM(scanner)
                        token['type'] = 'comment'
                        token['source'] = '/*' + commnt
                        token['detail'] = comment.getFormat(token['source'])
                        token['begin'] = not hasLeadingContent(tokens)
                        if restLineIsEmpty(scanner):
                            token['end'] = True
                        else:
                            token['end'] = False
                        if token['begin']:
                            token['source'] = comment.outdent(token['source'], column - 1)
                        token['source'] = comment.correct(token['source'])
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
                        print >> sys.stderror, "Multiline comment out of context"
                                
                else:
                    token['type'] = 'token'
                    token['detail'] = lang.TOKENS[tok.value]
            elif tok.value in lang.RESERVED:
                token['type'] = 'reserved'
                token['detail'] = lang.RESERVED[tok.value]
            elif tok.value in lang.BUILTIN:
                token['type'] = 'builtin'
            elif tok.value.startswith("__"):
                token['type'] = 'name'
                token['detail'] = 'private'
            elif tok.value.startswith("_"):
                token['type'] = 'name'
                token['detail'] = 'protected'
            else:
                token['type'] = 'name'
                token['detail'] = 'public'
        else:
            print >> sys.stderr, "Unhandled lexem: %s" % tok
            pass

        tokens.append(token)
    return tokens


def parseString(scanner, sstart):
    # parse string literals
    result = ""
    for token in scanner:
        result += token.value
        if (token.value == sstart and not Scanner.is_last_escaped(result)):  # be aware of escaped quotes
            break
    return result



def parseRegexp(scanner):
    # leading '/' is already consumed
    rexp = ""
    token = scanner.next()
    while True:
        #print "(rexp)", token.value
        rexp += token.value      # accumulate token strings
        if rexp.endswith("/"):   # check for end of regexp
            # make sure "/" is not escaped, ie. preceded by an odd number of "\"
            if not Scanner.is_last_escaped(rexp):
                #rexp = rexp[:-1] # remove closing "/"
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


def parseCommentI(scanner):
    result = ""
    for token in scanner:
        #print "(commentI)", "[%s]" % token.name, token.value
        if token.name == 'nl':
            scanner.putBack(token)
            break
        result += token.value
    return result


def parseCommentM(scanner):
    result = ""
    for token in scanner:
        result += token.value
        if "The new setting" in result:
            pass
        if token.value == '*/':
            if not Scanner.is_last_escaped(result):
                break
    return result

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


def hasLeadingContent(tokens):
    # tokens empty
    if not len(tokens):
        return False
    else:
        if tokens[-1]["type"] == "eol":
            return False
        else:
            return True


