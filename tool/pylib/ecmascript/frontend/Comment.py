#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2012 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Fabian Jakobs (fjakobs)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import sys, string, re

from ecmascript.frontend import tree, lang
from generator import Context as context
from pyparse import pyparsing as py
from textile import textile

##
# Many Regexp's
S_INLINE_COMMENT = "//.*"
R_INLINE_COMMENT = re.compile("^" + S_INLINE_COMMENT + "$")

R_INLINE_COMMENT_TIGHT = re.compile("^//\S+")
R_INLINE_COMMENT_PURE = re.compile("^//")


S_BLOCK_COMMENT = "/\*(?:[^*]|[\n]|(?:\*+(?:[^*/]|[\n])))*\*+/"
R_BLOCK_COMMENT = re.compile("^" + S_BLOCK_COMMENT + "$")

R_BLOCK_COMMENT_JAVADOC = re.compile("^/\*\*")
R_BLOCK_COMMENT_QTDOC = re.compile("^/\*!")
R_BLOCK_COMMENT_AREA = re.compile("^/\*\n\s*\*\*\*\*\*")
R_BLOCK_COMMENT_DIVIDER = re.compile("^/\*\n\s*----")
R_BLOCK_COMMENT_HEADER = re.compile("^/\* \*\*\*\*")

R_BLOCK_COMMENT_TIGHT_START = re.compile("^/\*\S+")
R_BLOCK_COMMENT_TIGHT_END = re.compile("\S+\*/$")
R_BLOCK_COMMENT_PURE_START = re.compile("^/\*")
R_BLOCK_COMMENT_PURE_END = re.compile("\*/$")

R_ATTRIBUTE = re.compile(r'(?<!{)@(\w+)\b')
R_JAVADOC_STARS = re.compile(r'^\s*\*')


R_NAMED_TYPE = re.compile(r'^\s*([a-zA-Z0-9_\.#-]+)\s*({([^}]+)})?')
R_SIMPLE_TYPE = re.compile(r'^\s*({([^}]+)})?')


VARPREFIXES = {
    "a" : "Array",
    "b" : "Boolean",
    "d" : "Date",
    "f" : "Function",
    "i" : "Integer",
    "h" : "Map",
    "m" : "Map",
    "n" : "Number",
    "o" : "Object",
    "r" : "RegExp",
    "s" : "String",
    "v" : "var",
    "w" : "Widget"
}

VARNAMES = {
    "a" : "Array",
    "arr" : "Array",

    "doc" : "Document",

    "e" : "Event",
    "ev" : "Event",
    "evt" : "Event",

    "el" : "Element",
    "elem" : "Element",
    "elm" : "Element",

    "ex" : "Exception",
    "exc" : "Exception",

    "flag" : "Boolean",
    "force" : "Boolean",

    "f" : "Function",
    "func" : "Function",

    "h" : "Map",
    "hash" : "Map",
    "map" : "Map",

    "node" : "Node",

    "n" : "Number",
    "num" : "Number",

    "o" : "Object",
    "obj" : "Object",

    "reg" : "RegExp",

    "s" : "String",
    "str" : "String",

    "win" : "Window"
}

VARDESC = {
    "propValue" : "Current value",
    "propOldValue" : "Previous value",
    "propData" : "Property configuration map"
}


def nameToType(name):
    typ = "var"

    # Evaluate type from name
    if name in VARNAMES:
        typ = VARNAMES[name]

    elif len(name) > 1:
        if name[1].isupper():
            if name[0] in VARPREFIXES:
                typ = VARPREFIXES[name[0]]

    return typ


def nameToDescription(name):
    desc = "TODOC"

    if name in VARDESC:
        desc = VARDESC[name]

    return desc

##
# Parsed comments are represented as lists of "attributes". This is a schematic:
# [{
#   'category' : 'description'|'param'|'throws'|'return'| ... (prob. all '@' tags),
#   'text'     : <descriptive string>,
#   'name'     : <name e.g. param name>,
#   'defaultValue' : <param default value>,
#   'type'     : [{                    (array for alternatives, e.g. "{Map|null}")
#     'type': 'Map'|'String'|...,   (from e.g. "{String[]}")
#     'dimensions': <int>  (0 = scalar, 1 = array, ...)
#   }]
# }]
#

def getAttrib(attribList, category):
    for attrib in attribList:
        if attrib["category"] == category:
            return attrib


def getParam(attribList, name):
    for attrib in attribList:
        if attrib["category"] == "param":
            if "name" in attrib and attrib["name"] == name:
                return attrib


def attribHas(attrib, key):
    if attrib != None and key in attrib and not attrib[key] in ["", None]:
        return True

    return False



##
# Holds a string representing a JS comment
#
class Comment(object):

    def __init__(self, s):
        self.string = s


    def correctInline(self):
        if R_INLINE_COMMENT_TIGHT.match(self.string):
            return R_INLINE_COMMENT_PURE.sub("// ", self.string)

        return self.string


    def correctBlock(self):
        source = self.string
        if not self.getFormat() in ["javadoc", "qtdoc"]:
            if R_BLOCK_COMMENT_TIGHT_START.search(source):
                source = R_BLOCK_COMMENT_PURE_START.sub("/* ", source)

            if R_BLOCK_COMMENT_TIGHT_END.search(source):
                source = R_BLOCK_COMMENT_PURE_END.sub(" */", source)

        return source


    def correct(self):
        if self.string[:2] == "//":
            return self.correctInline()
        else:
            return self.correctBlock()


    def isMultiLine(self):
        return self.string.find("\n") != -1


    def getFormat(self):
        if R_BLOCK_COMMENT_JAVADOC.search(self.string):
            return "javadoc"
        elif R_BLOCK_COMMENT_QTDOC.search(self.string):
            return "qtdoc"
        elif R_BLOCK_COMMENT_AREA.search(self.string):
            return "area"
        elif R_BLOCK_COMMENT_DIVIDER.search(self.string):
            return "divider"
        elif R_BLOCK_COMMENT_HEADER.search(self.string):
            return "header"

        return "block"


    def qt2javadoc(self):
        attribList = self.parse(False)
        res = "/**"

        desc = self.getAttrib(attribList, "description")
        if "text" in desc:
            desc = desc["text"]
        else:
            desc = ""
        if "\n" in desc:
            res += "\n"
            for line in desc.split("\n"):
                res += " * %s\n" % line
            res += " "
        else:
            res += " %s " % desc
        res += "*/"

        return res


    ##
    # Returns comment attributes ("commentAttributes") for a comment e.g.
    # 
    #  /**
    #   * Checks if a class is compatible to the given mixin (no conflicts)
    #   *
    #   * @param mixin {Mixin} mixin to check
    #   * @param clazz {Class} class to check
    #   * @throws an exception when the given mixin is incompatible to the class
    #   * @return {Boolean} true if the mixin is compatible to the given class
    #   */    
    #
    # like this:
    #  [{'category': 'description',
    #    'text': u'<p>Checks if a class is compatible to the given mixin (no conflicts)</p>'},
    #   {'category': u'param',
    #    'name': u'mixin',
    #    'text': u'<p>mixin to check</p>',
    #    'type': [{'dimensions': 0, 'type': u'Mixin'}]},
    #   {'category': u'param',
    #    'name': u'clazz',
    #    'text': u'<p>class to check</p>',
    #    'type': [{'dimensions': 0, 'type': u'Class'}]},
    #   {'category': u'throws',
    #    'text': u'<p>an exception when the given mixin is incompatible to the class</p>'},
    #   {'category': u'return',
    #    'text': u'<p>true if the mixin is compatible to the given class</p>',
    #      'type': [{'dimensions': 0, 'type': u'Boolean'}]}]
    #
    def parse(self, format_=True):

        hint_sign = re.compile(r'^\s*@(\w+)')

        def remove_decoration(text):
            # Strip "/**", "/*!" and "*/"
            intext = self.string[3:-2]
            # Strip leading stars in every line
            text = []
            for line in intext.split("\n"):
                text.append(R_JAVADOC_STARS.sub("", line))
            # Autodent
            text = Text(text).autoOutdent_list()
            return text

        def lines_to_sections(comment_lines):
            # compact sections
            section_lines = ['']  # add a fake empty description
            in_hint = 0
            for line in comment_lines:
                if hint_sign.search(line):
                    section_lines.append(line)  # new section
                    in_hint = 1
                elif in_hint:
                    line = line.strip()
                    section_lines[-1] += ' ' + line # concat to previous
                else:
                    section_lines[-1] += '\n' + line # concat to previous
            return section_lines

        def getOpts():
            class COpts(object): pass
            opts = COpts()
            opts.warn_unknown_jsdoc_keys = context.jobconf.get("lint-check/warn-unknown-jsdoc-keys", [None])
            opts.warn_jsdoc_key_syntax = context.jobconf.get("lint-check/warn-jsdoc-key-syntax", True)
            return opts

        # ----------------------------------------------------------------------

        opts = getOpts()

        # remove '*' etc.
        comment_lines = remove_decoration(self.string)

        # turn into one line for each: description, @hint1, @hint2, ...
        section_lines = lines_to_sections(comment_lines)

        attribs = []
        for line in section_lines:
            mo = hint_sign.search(line)
            # @<hint> entry
            if mo:
                hint_key = mo.group(1)
                # specific parsing
                if hasattr(self, "parse_at_"+hint_key):
                    try:
                        entry = getattr(self, "parse_at_"+hint_key)(line)
                    except py.ParseException, e:
                        if opts.warn_jsdoc_key_syntax:
                            context.console.warn("Unable to parse '@%s' JSDoc entry: %s" % (hint_key,line))
                        continue
                elif hint_key in ( # temporarily, to see what we have in the framework
                        'protected', # ?
                    ):
                    continue
                # known tag with default parsing
                elif hint_key in (
                        'abstract', # @abstract; pend. bug#6738
                        'tag',  # @tag foo; in Demobrowser
                    ):
                    entry = self.parse_at__default_(line)
                # unknown tag
                else:
                    #raise Exception("Unknown '@' hint in JSDoc comment: " + hint_key)
                    if opts.warn_unknown_jsdoc_keys==[] or hint_key in opts.warn_unknown_jsdoc_keys:
                        context.console.warn("Unknown '@' hint in JSDoc comment: " + hint_key)
                    entry = self.parse_at__default_(line)
                attribs.append(entry)
            # description
            else:
                attribs.append({
                   "category" : "description", 
                   "text" : line.strip()
                })

        # format texts
        for entry in attribs:
            if 'text' in entry and len(entry['text'])>0:
                if format_:
                    entry["text"] = self.formatText(entry["text"])
                else:
                    entry["text"] = self.cleanupText(entry["text"])
 
        #from pprint import pprint
        #pprint( attribs)
        return attribs


    gr_at__default_ = ( py.Suppress('@') + py.Word(py.alphas)('category') + py.restOfLine("text") )
    ##
    # "@<hint> text" 
    def parse_at__default_(self, line):
        grammar = self.gr_at__default_
        presult = grammar.parseString(line)
        res = {
            'category' : presult.category,
            'text' : presult.text.strip(),
        }
        return res

    # the next would be close to the spec (but huge!)
    #identi = py.Word(u''.join(lang.IDENTIFIER_CHARS_START), u''.join(lang.IDENTIFIER_CHARS_BODY))
    # but using regex, to be consistent with the parser
    py_js_identifier = py.Regex(lang.IDENTIFIER_REGEXP)

    py_simple_type = py.Suppress('{') + py_js_identifier.copy()('type_name') + py.Suppress('}')

    py_single_type = py_js_identifier.copy().setResultsName('type_name') + \
        py.ZeroOrMore('[]').setResultsName('type_dimensions')

    # mirror: {Foo|Bar? 34}
    py_type_expression = py.Suppress('{') + py.Optional(
            py.delimitedList(py_single_type, delim='|')("texp_types") +  # Foo|Bar
            py.Optional(py.Literal('?')("texp_optional") +               # ?
                py.Optional(py.Regex(r'[^}]+'))("texp_defval"))           # 34
        ) + py.Suppress('}')

    ##
    # "@type {Map}
    gr_at_type = py.Suppress('@') + py.Literal('type') + py_simple_type
    def parse_at_type(self, line):
        grammar = self.gr_at_type
        presult = grammar.parseString(line)
        res = {
            'category' : 'type',
            'type' : presult.type_name,
        }
        return res

    ##
    # "@ignore(foo,bar)"
    gr_at_ignore = ( py.Suppress('@') + py.Literal('ignore') + py.Suppress('(') + 
        py.delimitedList(py_js_identifier)('arguments') + py.Suppress(')') )
    def parse_at_ignore(self, line):
        grammar = self.gr_at_ignore
        presult = grammar.parseString(line)
        res = {
            'category' : 'ignore',
            'arguments': presult.arguments.asList()  # 'arguments'=(['foo','bar'],{})!?
        }
        return res

    ##
    # "@return {Type} msg"
    gr_at_return = ( py.Suppress('@') + py.Literal('return')  + 
        #py.Optional(py_type_expression.copy())("type") +   # TODO: remove leading py.Optional
        py_type_expression.copy()("type") + 
        py.restOfLine("text") )
    def parse_at_return(self, line):
        grammar = self.gr_at_return
        presult = grammar.parseString(line)
        types = self._typedim_list_to_typemaps(presult.texp_types.asList() if presult.texp_types else [])
        res = {
            'category' : 'return',
            'type' : types,  #  [{'dimensions': 0, 'type': u'Boolean'}]
            'text' : presult.text.strip()
        }
        return res
        
    ##
    # "@internal"
    def parse_at_internal(self, line):
        res = {
            'category' : 'internal',
        }
        return res

    ##
    # "@deprecated {2.1} use X instead"
    gr_at_deprecated = ( py.Suppress('@') + py.Literal('deprecated') + 
        py.QuotedString('{', endQuoteChar='}', unquoteResults=True)("since") + py.restOfLine("text") )
    def parse_at_deprecated(self, line):
        grammar = self.gr_at_deprecated
        presult = grammar.parseString(line)
        res = {
            'category' : 'deprecated',
            'since' : presult.since,
            'text' : presult.text.strip()
        }
        return res

    ##
    # "@throws text"
    gr_at_throws = ( py.Suppress('@') + py.Literal('throws') + 
       py.Suppress('{') + py_js_identifier.copy()('exception_type') +
       py.Suppress('}') + py.restOfLine("text") )
    def parse_at_throws(self, line):
        grammar = self.gr_at_throws
        presult = grammar.parseString(line)
        res = {
            'category' : 'throws',
            'type' : presult.exception_type,
            'text' : presult.text.strip()
        }
        return res
        
    def _typedim_list_to_typemaps(self, typedim_list):
        types = []
        for el in typedim_list: # e.g. ['String', '[]', 'Integer', '[]', '[]']
            if el != '[]':  # a type name
                types.append ({'type': el, 'dimensions': 0})
            else:
                types[-1]['dimensions'] += 1
        return types

    gr_at_param = ( py.Suppress('@') + py.Word(py.alphas)('category') + 
            py_js_identifier.copy()("name") + 
            py_type_expression + 
            py.restOfLine("text") )
    ##
    # @param foo {Type} text"
    def parse_at_param(self, line):
        grammar = self.gr_at_param
        presult = grammar.parseString(line)
        types = self._typedim_list_to_typemaps(presult.texp_types.asList() if presult.texp_types else [])
        res = {
            'category' : presult.category,
            'name' : presult.name,
            'type' : types, # [{'dimensions': 0, 'type': u'Boolean'}]
            'text' : presult.text.strip()
        }
        if 'texp_optional' in presult and 'texp_defval' in presult:
            res['defaultValue'] = presult['texp_defval']
        return res
        
    gr_at_childControl = ( py.Suppress('@') + py.Word(py.alphas)('category') + 
        py.Regex(r'\S+')("name") +   # accept "-" for childControl names
        py_type_expression + 
        py.restOfLine("text"))
    ##
    # "@childControl foo-bar {Type} text"
    #
    # (The only difference to parse_at_param is that <name> can be an arbitrary string
    # (e.g. containing "-")).
    def parse_at_childControl(self, line):
        grammar = self.gr_at_childControl
        presult = grammar.parseString(line)
        types = self._typedim_list_to_typemaps(presult.texp_types.asList() if presult.texp_types else [])
        res = {
            'category' : presult.category,
            'name' : presult.name,
            'type' : types, # [{'dimensions': 0, 'type': u'Boolean'}]
            'text' : presult.text.strip()
        }
        return res
        
    gr_at_see = ( py.Suppress('@') + py.Literal('see') + py.Regex(r'\S+')("name") + 
        py.Optional(py.restOfLine("text")) )
    ##
    # "@see qx.core.Object#CONSTANT text"
    def parse_at_see(self, line):
        grammar = self.gr_at_see
        presult = grammar.parseString(line)
        res = {
            'category' : 'see',
            'name' : presult.name,
            'text' : presult.text.strip()
        }
        return res
        
    gr_at_signature = ( py.Suppress('@') + py.Literal('signature') + py.Literal('function') + 
        py.Suppress('(') + py.Optional(py.delimitedList(py_js_identifier))('arguments') + 
        py.Suppress(')') )
    ##
    # "@signature function(parm1, parm2)"
    def parse_at_signature(self, line):
        grammar = self.gr_at_signature
        presult = grammar.parseString(line)
        res = {
            'category' : 'signature',
            #'text' : ('(' + ",".join(presult[2:]) + ')').strip(), # TODO: this should be removed in favor of 'arguments'
            'arguments' : presult.arguments.asList() if presult.arguments else []
        }
        return res
        
    py_comment_term = py_js_identifier.copy().setResultsName('t_functor') + py.Suppress('(') + \
        py.Optional(py.delimitedList(py_js_identifier)).setResultsName('t_arguments') + py.Suppress(')')

    gr_at_lint = py.Suppress('@') + py.Literal('lint') + py_comment_term
    ##
    # "@lint ignoreUndefined(foo)"
    def parse_at_lint(self, line):
        grammar = self.gr_at_lint
        presult = grammar.parseString(line)
        res = {
            'category' : 'lint',
            'functor' : presult.t_functor,
            'arguments' : presult.t_arguments.asList() if presult.t_arguments else []
        }
        return res
        
    gr_at_attach = ( py.Suppress('@') + py.Literal('attach') + py.Suppress('{') + 
        py_js_identifier.copy()('clazz') + 
        py.Optional(py.Suppress(',') + py_js_identifier)('method') + 
        py.Suppress('}') )
    ##
    # "@attach {q, bar}"
    def parse_at_attach(self, line):
        grammar = self.gr_at_attach
        presult = grammar.parseString(line)
        res = {
            'category' : 'attach',
            'targetClass'  : presult.clazz,
            'targetMethod' : presult.method[0] if presult.method else '', # why [0]?!
        }
        return res
        
    gr_at_attachStatic = ( py.Suppress('@') + py.Literal('attachStatic') + py.Suppress('{') + 
        py_js_identifier.copy()('clazz') + 
        py.Optional(py.Suppress(',') + py_js_identifier)('method') + 
        py.Suppress('}') )
    ##
    # "@attachStatic {q, bar}"
    def parse_at_attachStatic(self, line):
        grammar = self.gr_at_attachStatic
        presult = grammar.parseString(line)
        res = {
            'category' : 'attachStatic',
            'targetClass'  : presult.clazz,
            'targetMethod' : presult.method[0] if presult.method else '',
        }
        return res
        
    gr_at_require = py.Suppress('@') + py_comment_term
    ##
    # "@require(foo, bar)"
    def parse_at_require(self, line):
        grammar = self.gr_at_require
        presult = grammar.parseString(line)
        res = {
            'category' : 'require',
            'arguments' : presult.t_arguments.asList(),
        }
        return res
        
    ##
    # "@use(foo,bar)"
    def parse_at_use(self, line):
        grammar = self.gr_at_require
        presult = grammar.parseString(line)
        res = {
            'category' : 'use',
            'arguments' : presult.t_arguments.asList(),
        }
        return res
        

    def cleanupText(self, text):
        #print "============= INTEXT ========================="
        #print text

        text = text.replace("<p>", "\n")
        text = text.replace("<br/>", "\n")
        text = text.replace("<br>", "\n")
        text = text.replace("</p>", " ")

        # on single lines strip the content
        if not "\n" in text:
            text = text.strip()

        else:
            newline = False
            lines = text.split("\n")
            text = u""

            for line in lines:
                if line == "":
                    if not newline:
                        newline = True

                else:
                    if text != "":
                        text += "\n"

                    if newline:
                        text += "\n"
                        newline = False

                    text += line

        #print "============= OUTTEXT ========================="
        #print text

        # Process TODOC the same as no text
        if text == "TODOC":
            return ""

        return text


    ##
    # JSDoc can contain macros, which are expanded here.
    #
    def expandMacros(self, text):
        _mmap = {
            "qxversion" : (context.jobconf.get("let/QOOXDOO_VERSION", "!!TODO!!") if 
                            hasattr(context,'jobconf') else "[undef]" ) # ecmalint.py doesn't know jobs
        }
        templ = string.Template(text)
        text = templ.safe_substitute(_mmap)
        return text


    def formatText(self, text):
        text = self.cleanupText(text)

        #if "\n" in text:
        #  print
        #  print "------------- ORIGINAL ----------------"
        #  print text

        text = text.replace("<pre", "\n\n<pre").replace("</pre>", "</pre>\n\n")

        text = self.expandMacros(text)

        # encode to ascii leads into a translation of umlauts to their XML code.
        text = unicode(textile.textile(text.encode("utf-8"), output="ascii"))

        #if "\n" in text:
        #  print "------------- TEXTILED ----------------"
        #  print text

        return text


    def splitText(self, attrib=True):
        res = ""
        first = True

        for line in self.string.split("\n"):
            if attrib:
                if first:
                    res += " %s\n" % line
                else:
                    res += " *   %s\n" % line

            else:
                res += " * %s\n" % line

            first = False

        if not res.endswith("\n"):
            res += "\n"

        return res


    @staticmethod
    def parseType(vtype):
        typeText = ""

        firstType = True
        for entry in vtype:
            if not firstType:
                typeText += " | "

            typeText += entry["type"]

            if "dimensions" in entry and entry["dimensions"] > 0:
                typeText += "[]" * entry["dimensions"]

            firstType = False

        return typeText


##
# Helper class for text-level operations
#
class Text(object):

    def __init__(self, s):
        self.string = s

    ##
    # Remove a fixed number of spaces from the beginning of each line
    # in text.
    #
    # @param indent {Int} number of spaces to remove
    #
    def outdent(self, indent):
        #return re.compile(r"\n\s{%s}" % indent).sub("\n", self.string)
        return re.compile(r"^\s{%s}" % indent, re.M).sub("", self.string)

    ##
    # Insert <indent> at the beginning of each line in text
    #
    # @param indent {String} string to insert
    #
    def indent(self, indent):
        return re.compile("\n").sub("\n" + indent, self.string)


    def autoOutdent_list(self):
        lines = self.string # needs to be [], actually :)
        result = []
        if len(lines) == 0:
            return lines
        elif len(lines) ==1:
            result.append(lines[0].strip())
            return result
        else:
            for line in lines:
                if len(line) and line[0] != " ":
                    return lines
            for line in lines:
                result.append(line[1:])
            return result

            

    def autoOutdent(self):
        text = self.string
        lines = text.split("\n")

        if len(lines) <= 1:
            return text.strip()

        for line in lines:
            if len(line) > 0 and line[0] != " ":
                return text

        result = ""
        for line in lines:
            if len(line) >= 0:
                result += line[1:]

            result += "\n"

        return result


# -- Helper functions working on tree nodes ------------------------------------

def hasThrows(node):
    if node.type == "throw":
        return True

    if node.hasChildren():
        for child in node.children:
            if hasThrows(child):
                return True

    return False


def getReturns(node, found):
    if node.type == "function":
        pass

    elif node.type == "return":
        if node.getChildrenLength(True) > 0:
            val = "var"
        else:
            val = "void"

        if node.hasChild("expression"):
            expr = node.getChild("expression")
            if expr.hasChild("variable"):
                var = expr.getChild("variable")
                if var.getChildrenLength(True) == 1 and var.hasChild("identifier"):
                    val = nameToType(var.getChild("identifier").get("value"))
                else:
                    val = "var"

            elif expr.hasChild("constant"):
                val = expr.getChild("constant").get("constantType")

                if val == "number":
                    val = expr.getChild("constant").get("detail")

            elif expr.hasChild("array"):
                val = "Array"

            elif expr.hasChild("map"):
                val = "Map"

            elif expr.hasChild("function"):
                val = "Function"

            elif expr.hasChild("call"):
                val = "var"

        if not val in found:
            found.append(val)

    elif node.hasChildren():
        for child in node.children:
            getReturns(child, found)

    return found


def findComment(node):
    
    def findCommentBefore(node):
        while node:
            if node.hasChild("commentsBefore"):
                for comment in node.getChild("commentsBefore").children:
                    if comment.get("detail") in ["javadoc", "qtdoc"]:
                        comments = parseNode(node)
                        return comments
            if node.hasParent():
                node = node.parent
            else:
                return None
            
    def findCommentAfter(node):
        while node:
            if node.hasChild("commentsBefore"):
                for comment in node.getChild("commentsBefore").children:
                    if comment.get("detail") in ["javadoc", "qtdoc"]:
                        comments = parseNode(node)
                        return comments
            if node.hasChildren():
                node = node.children[0]
            else:
                return None   
            
    if node.type == "file":
        return findCommentAfter(node)
    else:
        return findCommentBefore(node)  


##
# Takes the last doc comment from the commentsBefore child, parses it and
# returns a Node representing the doc comment
#
def parseNode(node):

    # the intended meaning of <node> is "the node that has comments preceding
    # it"; in the ast, this might not be <node> itself, but the lexically first
    # token that got the comment attached; look for that
    # in the AST this translates to the left-most child for statements and expressions
    commentsNode = findAssociatedComment(node)
    #print "comments node:", str(commentsNode)
    result = []  # [[{}], ...]

    if commentsNode and commentsNode.comments:
        # check for a suitable comment, from the back so that the closer wins
        for comment in commentsNode.comments:
            #if comment.get("detail") in ["javadoc", "qtdoc"]:
            if comment.get("detail") in ["javadoc"]:
                result.append( Comment(comment.get("value", "")).parse() )
    if not result:
        result = [[]]  # to always have a result[-1] element in caller
    return result


def findAssociatedComment(node):
    # traverse <node> tree left-most, looking for comments
    from ecmascript.frontend import treeutil # ugly here, but due to import cycle

    ##
    # For every <start_node> find the enclosing statement node, and from that
    # the node of the first token (as this will carry a pot. comment) 
    def statement_head_from(start_node):
        # 1. find enclosing "local root" node
        # (e.g. the enclosing statement or file node)
        tnode = start_node
        stmt_node = None
        while True:  # this will always terminate, as every JS node is a child of a statement
            if tnode.isStatement():
                stmt_node = tnode
                break
            elif tnode.type == 'file': 
                # TODO: (bug#6765) why does/n't it crash without this?!
                #       are file-level comments being picked up correctly?!
                stmt_node = tnode
                break
            elif tnode.parent: 
                tnode = tnode.parent
            else: 
                break
        # 2. determine left-most token
        #if stmt_node.isPrefixOp():
        #    head_token_node = stmt_node
        #else:
        #    head_token_node = treeutil.findLeftmostChild(stmt_node)
        head_token_node = stmt_node.toListG().next()
        return head_token_node

    # --------------------------------------------------------------------------

    res = None
    if node.comments:
        res = node
    else:
        # check current expression
        #left_most = treeutil.findLeftmostChild(node) # this might return <node> itself
        left_most = node.toListG().next()
        if left_most.comments:
            res = left_most
        else:
            # check <keyvalue> in maps
            next_root = treeutil.findAncestor(node, ["keyvalue"], radius=5)
            if next_root:
                if next_root.comments:
                    res = next_root
            else:
                # check enclosing statement
                stmt_head = statement_head_from(node)
                if stmt_head and stmt_head.comments:
                    res = stmt_head
    return res


def parseNode_2(node):
    """Takes the last doc comment from the commentsBefore child, parses it and
    returns a Node representing the doc comment"""

    # Find the last doc comment
    commentsBefore = node.getChild("commentsBefore", False)
    if commentsBefore and commentsBefore.hasChildren():
        for child in commentsBefore.children:
            if child.type == "comment" and child.get("detail") in ["javadoc", "qtdoc"]:
                return Comment(child.get("text")).parse()

    return []


##
# fill(node) -- look for function definitions in the tree represented by <node>,
# look for their corresponding comment and amend it, or create it in the first
# place
#
def fill(node):
    if node.type in ["comment", "commentsBefore", "commentsAfter"]:
        return

    if node.hasParent():
        target = node

        if node.type == "function" and node.getChild("identifier",0):
            name = node.getChild("identifier", False).get("value")
        else:
            name = ""

        alternative = False
        assignType = None

        if name != None:
            assignType = "function"

        # move to hook operation
        while target.parent.type == "operation" and target.parent.get("operator") == "HOOK":
            alternative = True
            target = target.parent

        # move comment to assignment
        while target.parent.type == "right" and target.parent.parent.type == "assignment":
            target = target.parent.parent
            if target.hasChild("left"):
                left = target.getChild("left")
                if left and left.hasChild("variable"):
                    var = left.getChild("variable")
                    last = var.getLastChild(False, True)
                    if last and last.type == "identifier":
                        name = last.get("value")
                        assignType = "object"

                    for child in var.children:
                        if child.type == "identifier":
                            if child.get("value") in ["prototype", "Proto"]:
                                assignType = "member"
                            elif child.get("value") in ["class", "base", "Class"]:
                                assignType = "static"

            elif target.parent.type == "definition":
                name = target.parent.get("identifier")
                assignType = "definition"

        # move to definition
        if target.parent.type == "assignment" and target.parent.parent.type == "definition" and target.parent.parent.parent.getChildrenLength(True) == 1:
            target = target.parent.parent.parent
            assignType = "function"


        # move comment to keyvalue
        if target.parent.type == "value" and target.parent.parent.type == "keyvalue":
            target = target.parent.parent
            name = target.get("key")
            assignType = "map"

            if name == "construct":
                assignType = "constructor"

            if target.parent.type == "map" and target.parent.parent.type == "value" and target.parent.parent.parent.type == "keyvalue":
                paname = target.parent.parent.parent.get("key")

                if paname == "members":
                    assignType = "member"

                elif paname == "statics":
                    assignType = "static"

        # filter stuff, only add comments to member and static values and to all functions
        if assignType in ["member", "static"] and node.type == "function":

            if not hasattr(target, "documentationAdded") and target.parent.type != "params":
                old = []

                commentNode = None

                # create commentsBefore
                if target.hasChild("commentsBefore"):
                    commentsBefore = target.getChild("commentsBefore")

                    if commentsBefore.hasChild("comment"):
                        for child in commentsBefore.children:
                            if child.get("detail") in ["javadoc", "qtdoc"]:
                                old = Comment(child.get("text")).parse(False)
                                commentNode = child
                                commentNodeIndex = commentsBefore.children.index(child)
                                break

                else:
                    commentsBefore = tree.Node("commentsBefore")
                    target.addChild(commentsBefore)

                # create comment node
                if commentNode == None:
                  commentNodeIndex = None
                  commentNode = tree.Node("comment")
                  commentNode.set("detail", "javadoc")

                #if node.type == "function":
                #    commentNode.set("text", fromFunction(node, assignType, name, alternative, old))
                #else:
                #    commentNode.set("text", fromNode(node, assignType, name, alternative, old))

                commentNode.set("text", fromFunction(node, assignType, name, alternative, old))

                commentNode.set("multiline", True)

                commentsBefore.addChild(commentNode,commentNodeIndex)

                # in case of alternative methods, use the first one, ignore the others
                target.documentationAdded = True

    if node.hasChildren():
        for child in node.children:
            fill(child)


def fromNode(node, assignType, name, alternative, old=[]):
    #
    # description
    ##############################################################
    oldDesc = getAttrib(old, "description")

    if attribHas(oldDesc, "text"):
        newText = oldDesc["text"]
    else:
        newText = "{var} TODOC"

    if "\n" in newText:
        s = "/**\n%s\n-*/" % Comment(newText).splitText(False)
    else:
        s = "/** %s */" % newText

    s = s.replace("/**  ", "/** ").replace("  */", " */")


    #
    # other @attributes
    ##############################################################

    for attrib in old:
        cat = attrib["category"]

        if cat != "description":
            print "  * Found unallowed attribute %s in comment for %s (node)" % (cat, name)

    return s


def fromFunction(func, assignType, name, alternative, old=[]):
    #
    # open comment
    ##############################################################
    s = "/**\n"


    #
    # description
    ##############################################################
    oldDesc = getAttrib(old, "description")

    if attribHas(oldDesc, "text"):
        newText = oldDesc["text"]
    else:
        newText = "TODOC"

    s += Comment(newText).splitText(False)
    s += " *\n"


    #
    # add @type
    ##############################################################
    # TODO: Remove the @type annotation as it conflicts with JSdoc
    #    if assignType != None:
    #        s += " * @type %s\n" % assignType
    #    else:
    #        s += " * @type unknown TODOC\n"


    #
    # add @abstract
    ##############################################################
    oldAbstract = getAttrib(old, "abstract")

    first = func.getChild("body").getChild("block").getFirstChild(False, True)
    abstract = first and first.type == "throw"

    if abstract:
        if attribHas(oldAbstract, "text"):
            newText = oldDesc["text"]
        else:
            newText = ""

        s += " * @abstract%s" % Comment(newText).splitText()

        if not s.endswith("\n"):
            s += "\n"

    elif oldAbstract:
        print " * Removing old @abstract for %s" % name


    #
    # add @param
    ##############################################################
    params = func.getChild("params")
    if params.hasChildren():
        for child in params.children:
            if child.type == "variable":
                newName = child.getChild("identifier").get("value")
                newType = newTypeText = nameToType(newName)
                newDefault = ""
                newText = nameToDescription(newName)

                oldParam = getParam(old, newName)

                # Get type and text from old content
                if oldParam:
                    if attribHas(oldParam, "type"):
                        newTypeText = Comment.parseType(oldParam["type"])

                    if attribHas(oldParam, "defaultValue"):
                        newDefault = " ? %s" % oldParam["defaultValue"]

                    if attribHas(oldParam, "text"):
                        newText = oldParam["text"].strip()

                s += " * @param %s {%s%s}%s" % (newName, newTypeText, newDefault, Comment(newText).splitText())

                if not s.endswith("\n"):
                    s += "\n"


    #
    # add @return
    ##############################################################
    if name != "construct":
        oldReturn = getAttrib(old, "return")

        newType = "void"
        newText = ""

        # Get type and text from old content
        if oldReturn:
            if attribHas(oldReturn, "type"):
                newType = Comment.parseType(oldReturn["type"])

            if attribHas(oldReturn, "text"):
                newText = oldReturn["text"].strip()

        # Try to autodetect the type
        if newType == "void":
            returns = getReturns(func.getChild("body"), [])

            if len(returns) > 0:
                newType = " | ".join(returns)
            elif name != None and name[:2] == "is" and name[3].isupper():
                newType = "Boolean"

        # Add documentation hint in non void cases
        if newType != "void":
            if newText == "":
                newText = "TODOC"

            s += " * @return {%s}%s" % (newType, Comment(newText).splitText())

            if not s.endswith("\n"):
                s += "\n"


    #
    # add @throws
    ##############################################################
    oldThrows = getAttrib(old, "throws")

    if hasThrows(func):
        if oldThrows and attribHas(oldThrows, "text"):
            newText = oldThrows["text"]
        elif abstract:
            newText = "the abstract function warning."
        else:
            newText = "TODOC"

        s += " * @throws%s" % Comment(newText).splitText()

        if not s.endswith("\n"):
            s += "\n"

    elif oldThrows:
        print "  * Removing old @throw attribute in comment for %s" % name


    #
    # other @attributes
    ##############################################################

    for attrib in old:
        cat = attrib["category"]

        if cat in ["see", "author", "deprecated", "exception", "since", "version", "abstract", "overridden", "lint"]:
            s += " * @%s" % cat

            if cat == "see":
                if attribHas(attrib, "name"):
                    s += Comment(attrib["name"]).splitText()
            elif attribHas(attrib, "text"):
                s += Comment(attrib["text"]).splitText()

            if not s.endswith("\n"):
                s += "\n"

        elif not cat in ["description", "type", "abstract", "param", "return", "throws", "link", "internal", "signature"]:
            print "  * Found unallowed attribute %s in comment for %s (function)" % (cat, name)


    #
    # close comment
    ##############################################################
    s += " */"

    return s


