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
#    * Sebastian Werner (wpbasti)
#    * Alessandro Sala (asala)
#
################################################################################

##
#<h2>Module Description</h2>
#<pre>
# NAME
#  tokenizer.py -- create tokens from JavaScript source code
#
# SYNTAX
#  tokenizer.py --help
#
#  or
#
#  import tokenizer
#  result = tokenizer.parseStream(string, id)
#
# DESCRIPTION
#  The module tokenizer.py creates JSON-style tokens from JavaScript source code.
#
#</pre>
##

import sys, string, re, optparse, types
import config, filetool, comment

R_WHITESPACE = re.compile(r"(?:\s+)")
R_NONWHITESPACE = re.compile("\S+")
R_NUMBER = re.compile("^[0-9]+")
R_NEWLINE = re.compile(r"(\n)")  # don't touch this subgroup!

# Ideas from: http://www.regular-expressions.info/examplesprogrammer.html
# Multicomment RegExp inspired by: http://ostermiller.org/findcomment.html

# Build Regexps for JavaScript
# quoted strings (single and double)
S_STRING_A = "'[^'\\\n]*(?:\\.|\n[^'\\\n]*)*'"
S_STRING_B = '"[^"\\\n]*(?:\\.|\n[^"\\\n]*)*"'

S_FLOAT = "(?:[0-9]*\.[0-9]+(?:[eE][+-]?[0-9]+)?)"

S_OPERATORS_2 = r"==|!=|\+\+|--|-=|\+=|\*=|/=|%=|&&|\|\||\>=|\<=|>>|<<|\^\||\|=|\^=|&=|::|\.\."
S_OPERATORS_3 = r"===|!==|\<\<=|\>\>=|\>\>\>"
S_OPERATORS_4 = r"\>\>\>="
S_OPERATORS = "(?:" + S_OPERATORS_4 + "|" + S_OPERATORS_3 + "|" + S_OPERATORS_2 + ")"

S_REGEXP   = "(?:\/(?!\*)[^\t\n\r\f\v\/]+?\/[mgi]*)"
S_REGEXP_A = "\.(?:match|search|split)\s*\(\s*\(*\s*" + S_REGEXP + "\s*\)*\s*\)"
S_REGEXP_B = "\.(?:replace)\s*\(\s*\(*\s*" + S_REGEXP + "\s*\)*\s*?,?"
S_REGEXP_C = "\s*\(*\s*" + S_REGEXP + "\)*\.(?:test|exec)\s*\(\s*"
S_REGEXP_D = "(?::|=|\?)\s*\(*\s*" + S_REGEXP + "\s*\)*"
S_REGEXP_E = "[\(,]\s*" + S_REGEXP + "\s*[,\)]"          # regexp as parameter/tuple entry
S_REGEXP_ALL = S_REGEXP_A + "|" + S_REGEXP_B + "|" + S_REGEXP_C + "|" + S_REGEXP_D + "|" + S_REGEXP_E
#S_REGEXP_ALL = "(?P<REGEXP>" + S_REGEXP_A + "|" + S_REGEXP_B + "|" + S_REGEXP_C + "|" + S_REGEXP_D + ")"
            # I would rather group only on the top-level expression, and there create a named group
            # (sub-groups only if in dire need); the named groups provide not only the match, but
            # also the classification (like "REGEXP"), to be retrieved through mo.groupdict(). this
            # would allow you to build a tokenizer through regexps entirely.

S_ALL = "(?:" + comment.S_BLOCK_COMMENT + "|" + comment.S_INLINE_COMMENT + "|" + S_STRING_A + "|" + S_STRING_B + "|" + S_REGEXP_ALL + "|" + S_FLOAT + "|" + S_OPERATORS + ")"

# compile regexp strings
R_STRING_A = re.compile("^" + S_STRING_A + "$")
R_STRING_B = re.compile("^" + S_STRING_B + "$")
R_FLOAT = re.compile("^" + S_FLOAT + "$")
R_OPERATORS = re.compile(S_OPERATORS)
R_REGEXP = re.compile(S_REGEXP)
R_REGEXP_A = re.compile(S_REGEXP_A)
R_REGEXP_B = re.compile(S_REGEXP_B)
R_REGEXP_C = re.compile(S_REGEXP_C)
R_REGEXP_D = re.compile(S_REGEXP_D)
R_REGEXP_E = re.compile(S_REGEXP_E)
R_ALL = re.compile(S_ALL)




parseLine = 1
parseColumn = 1
parseUniqueId = ""



def protectEscape(s):
    return s.replace("\\\\", "__$ESCAPE0$__").replace("\\\"", "__$ESCAPE1$__").replace("\\\'", "__$ESCAPE2__").replace("\/", "__$ESCAPE3__").replace("\!", "__$ESCAPE4__")



def recoverEscape(s):
    return s.replace("__$ESCAPE0$__", "\\\\").replace("__$ESCAPE1$__", "\\\"").replace("__$ESCAPE2__", "\\'").replace("__$ESCAPE3__", "\/").replace("__$ESCAPE4__", "\!")



def parseElement(element, tokens=[]):
    # to be consistent with other worker 'parse*' routines, this should be passed
    # and extend the tokens[] array, rather than just returning new tokens (postponed)
    global parseUniqueId
    global parseLine
    global parseColumn

    if config.JSRESERVED.has_key(element):
        # print "PROTECTED: %s" % JSRESERVED[content]
        tok = { "type" : "reserved", "detail" : config.JSRESERVED[element], "source" : element, "line" : parseLine, "column" : parseColumn, "id" : parseUniqueId }

    elif element in config.JSBUILTIN:
        # print "BUILTIN: %s" % content
        tok = { "type" : "builtin", "detail" : "", "source" : element, "line" : parseLine, "column" : parseColumn, "id" : parseUniqueId }

    elif R_NUMBER.search(element):
        # print "NUMBER: %s" % content
        tok = { "type" : "number", "detail" : "int", "source" : element, "line" : parseLine, "column" : parseColumn, "id" : parseUniqueId }

    elif element.startswith("__"):
        # print "PRIVATE NAME: %s" % content
        tok = { "type" : "name", "detail" : "private", "source" : element, "line" : parseLine, "column" : parseColumn, "id" : parseUniqueId }

    elif element.startswith("_"):
        # print "PROTECTED NAME: %s" % content
        tok = { "type" : "name", "detail" : "protected", "source" : element, "line" : parseLine, "column" : parseColumn, "id" : parseUniqueId }

    elif len(element) > 0:
        # print "PUBLIC NAME: %s" % content
        tok = { "type" : "name", "detail" : "public", "source" : element, "line" : parseLine, "column" : parseColumn, "id" : parseUniqueId }

    parseColumn += len(element)

    return tok


def parsePart(part, tokens=[]):
    global parseUniqueId
    global parseLine
    global parseColumn

    #tokens = []
    element = ""

    for line in R_NEWLINE.split(part):
        if line == "\n":
            tokens.append({ "type" : "eol", "source" : "", "detail" : "", "line" : parseLine, "column" : parseColumn, "id" : parseUniqueId })
            parseColumn = 1
            parseLine += 1

        else:
            for item in R_WHITESPACE.split(line):
                if item == "":
                    continue

                if not R_NONWHITESPACE.search(item):
                    parseColumn += len(item)
                    continue

                # print "ITEM: '%s'" % item

                # doing the per-char iteration by hand, to be able to leap
                # forward
                i = 0
                while item[i:]:
                #for char in item:
                    # look for a regexp
                    mo = R_REGEXP.match(item[i:])
                    if mo:
                        # if this thingy looks like a regexp, look that the preceding token is no
                        # "left-hand operand" that might turn the expression into a division

                        # convert existing element
                        if element != "":
                            if R_NONWHITESPACE.search(element):
                                tokens.append(parseElement(element))

                            element = ""

                        # look behind: this is only a regexp if there is nothing
                        # preceding it which makes it something else
                        if (    len(tokens) == 0 or (
                                (tokens[-1]['detail'] != 'int')   and
                                (tokens[-1]['detail'] != 'float') and
                                (tokens[-1]['detail'] != 'RP')    and
                                (tokens[-1]['detail'] != 'public'))):
                            tokens.append({ "type" : "regexp", "detail" : "", "source" : recoverEscape(mo.group(0)), "id" : parseUniqueId, "line" : parseLine, "column" : parseColumn })
                            parseColumn += len(mo.group(0))
                            i += len(mo.group(0))
                        

                    # work on single character tokens, otherwise concat to a bigger element

                    if i>=len(item):
                        continue
                    char = item[i]
                    i += 1
                    if config.JSTOKENS.has_key(char):
                        # convert existing element
                        if element != "":
                            if R_NONWHITESPACE.search(element):
                                tokens.append(parseElement(element))

                            element = ""

                        # add character to token list
                        tokens.append({ "type" : "token", "detail" : config.JSTOKENS[char], "source" : char, "line" : parseLine, "column" : parseColumn, "id" : parseUniqueId })
                        parseColumn += 1

                    else:
                        element += char

                # convert remaining stuff to tokens
                if element != "":
                    if R_NONWHITESPACE.search(element):
                        tokens.append(parseElement(element))

                    element = ""

    return tokens


##
# parseFragmentLead -- find starting char POS of pattern match result <fragment>
#       in source text <content>, process <content>'s prefix up to POS, thereby
#       building up token array <tokens>,
#       and return <content> without the processed prefix
#

def parseFragmentLead(content, fragment, tokens):
    pos = content.find(fragment)

    if pos > 0:
        #tokens.extend(parsePart(recoverEscape(content[0:pos])))
        parsePart(recoverEscape(content[0:pos]), tokens)

    return content[pos+len(fragment):]



def hasLeadingContent(tokens):
    pos = len(tokens) - 1
    while pos > 0:
        if tokens[pos]["type"] == "eol":
            break

        else:
            return True

    return False





##
# Main parsing routine, in that it qualifies tokens from the stream (operators,
# nums, strings, ...)
#
def parseStream(content, uniqueId=""):
    # make global variables available
    global parseLine
    global parseColumn
    global parseUniqueId

    # reset global stuff
    parseColumn = 1
    parseLine = 1
    parseUniqueId = uniqueId

    # prepare storage
    tokens = []
    content = protectEscape(content)

    # print "      * searching for patterns..."
    try:
        all = R_ALL.findall(content)
    except RuntimeError:
        print "Could not parse file %s" % uniqueId
        print "Generally this means that there is a syntactial problem with your source-code."
        print "Please omit the usage of nested comments like '/* foo /* bar */'."
        sys.exit(1)

    # print "      * structuring..."

    #for item in all:
    #    if type(item) != types.TupleType:   # item's no longer a tuple!
    #        item = (item,)
    #    fragment = item[0]

    while content:
        mo = R_ALL.search(content)
        if mo:
            fragment = mo.group(0)
        else:
            break

        # print "Found: '%s'" % fragment

        # Handle block comment
        if comment.R_BLOCK_COMMENT.match(fragment):
            source = recoverEscape(fragment)
            format = comment.getFormat(source)
            multiline = comment.isMultiLine(source)

            # print "Type:MultiComment"
            content = parseFragmentLead(content, fragment, tokens)  # sort of intelligent "pop"

            atBegin = not hasLeadingContent(tokens)
            if re.compile("^\s*\n").search(content):
                atEnd = True
            else:
                atEnd = False

            # print "Begin: %s, End: %s" % (atBegin, atEnd)

            # Fixing source content
            if atBegin:
                source = comment.outdent(source, parseColumn - 1)

            source = comment.correct(source)

            connection = "before"

            if atEnd and not atBegin:
                connection = "after"
            else:
                connection = "before"

            tokens.append({ "type" : "comment", "detail" : format, "multiline" : multiline, "connection" : connection, "source" : source, "id" : parseUniqueId, "line" : parseLine, "column" : parseColumn, "begin" : atBegin, "end" : atEnd })
            parseLine += len(fragment.split("\n")) - 1

        # Handle inline comment
        elif comment.R_INLINE_COMMENT.match(fragment):
            # print "Type:SingleComment"
            source = recoverEscape(fragment)
            content = parseFragmentLead(content, fragment, tokens)

            atBegin = hasLeadingContent(tokens)
            atEnd = True

            if atBegin:
                connection = "after"
            else:
                connection = "before"

            source = comment.correct(source)

            tokens.append({ "type" : "comment", "detail" : "inline", "multiline" : False, "connection" : connection, "source" : source, "id" : parseUniqueId, "line" : parseLine, "column" : parseColumn, "begin" : atBegin, "end" : atEnd })

        # Handle string
        elif R_STRING_A.match(fragment):
            # print "Type:StringA: %s" % fragment
            content = parseFragmentLead(content, fragment, tokens)
            source = recoverEscape(fragment)[1:-1]
            tokens.append({ "type" : "string", "detail" : "singlequotes", "source" : source.replace("\\\n",""), "id" : parseUniqueId, "line" : parseLine, "column" : parseColumn })
            newLines = source.count("\\\n")
            parseLine += newLines
            if newLines:
                parseColumn = len(source) - source.rfind("\\\n") + 2
            else:
                parseColumn += len(source) + 2

        # Handle string
        elif R_STRING_B.match(fragment):
            # print "Type:StringB: %s" % fragment
            content = parseFragmentLead(content, fragment, tokens)
            source = recoverEscape(fragment)[1:-1]
            tokens.append({ "type" : "string", "detail" : "doublequotes", "source" : source.replace("\\\n",""), "id" : parseUniqueId, "line" : parseLine, "column" : parseColumn })
            newLines = source.count("\\\n")
            parseLine += newLines
            if newLines:
                parseColumn = len(source) - source.rfind("\\\n") + 2
            else:
                parseColumn += len(source) + 2

        # Handle float num
        elif R_FLOAT.match(fragment):
            # print "Type:Float: %s" % fragment
            content = parseFragmentLead(content, fragment, tokens)
            tokens.append({ "type" : "number", "detail" : "float", "source" : fragment, "id" : parseUniqueId, "line" : parseLine, "column" : parseColumn })

        # Handle regexps
        #elif R_REGEXP.search(content[:content.index('\n')]):
        #    mo = R_REGEXP.search(content)
        #    regmatch = mo.group(0)
        #    content = parseFragmentLead(content, regmatch, tokens)
        #    tokens.append({ "type" : "regexp", "detail" : "", "source" : recoverEscape(regmatch), "id" : parseUniqueId, "line" : parseLine, "column" : parseColumn })
        #    parseColumn += len(regmatch)

        # Handle operator
        elif R_OPERATORS.match(fragment):
            # print "Type:Operator: %s" % fragment
            content = parseFragmentLead(content, fragment, tokens)
            tokens.append({ "type" : "token", "detail" : config.JSTOKENS[fragment], "source" : fragment, "id" : parseUniqueId, "line" : parseLine, "column" : parseColumn })

        # Handle everything else
        else:
            fragresult = R_REGEXP.search(fragment)

            if fragresult:
                # print "Type:RegExp: %s" % fragresult.group(0)

                if R_REGEXP_A.match(fragment) or R_REGEXP_B.match(fragment) or R_REGEXP_C.match(fragment) or R_REGEXP_D.match(fragment) or R_REGEXP_E.match(fragment):
                    content = parseFragmentLead(content, fragresult.group(0), tokens)
                    tokens.append({ "type" : "regexp", "detail" : "", "source" : recoverEscape(fragresult.group(0)), "id" : parseUniqueId, "line" : parseLine, "column" : parseColumn })

                else:
                    print "Bad regular expression: %s" % fragresult.group(0)

            else:
                print "Type:None!"

    #tokens.extend(parsePart(recoverEscape(content)))
    parsePart(recoverEscape(content), tokens)
    tokens.append({ "type" : "eof", "source" : "", "detail" : "", "id" : parseUniqueId, "line" : parseLine, "column" : parseColumn })

    return tokens



def parseFile(fileName, uniqueId="", encoding="utf-8"):
    return parseStream(filetool.read(fileName, encoding), uniqueId)




def convertTokensToString(tokens):
    tokenizedString = ""

    for token in tokens:
        tokenizedString += "%s%s" % (token, "\n")

    return tokenizedString





def main():
    parser = optparse.OptionParser()

    parser.add_option("-w", "--write", action="store_true", dest="write", default=False, help="Writes file to incoming fileName + EXTENSION.")
    parser.add_option("-e", "--extension", dest="extension", metavar="EXTENSION", help="The EXTENSION to use", default=".tokenized")
    parser.add_option("--encoding", dest="encoding", default="utf-8", metavar="ENCODING", help="Defines the encoding expected for input files.")

    (options, args) = parser.parse_args()

    if len(args) == 0:
        print "Needs one or more arguments (files) to tokenize!"
        sys.exit(1)

    for fileName in args:
        if options.write:
            print "Compiling %s => %s%s" % (fileName, fileName, options.extension)
        else:
            print "Compiling %s => stdout" % fileName

        tokenString = convertTokensToString(parseFile(fileName, fileName, options.encoding))

        if options.write:
            filetool.save(fileName + options.extension, tokenString, options.encoding)

        else:
            try:
                print tokenString

            except UnicodeEncodeError:
                print "  * Could not encode result to ascii. Use '-w' instead."
                sys.exit(1)




if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        sys.exit(1)
