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

from ecmascript.frontend import tree
from generator import Context as context
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

R_ATTRIBUTE = re.compile('[^{]@(\w+)\s*')
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
            if R_BLOCK_COMMENT_TIGHT_START.search(self.string):
                source = R_BLOCK_COMMENT_PURE_START.sub("/* ", self.string)

            if R_BLOCK_COMMENT_TIGHT_END.search(source):
                source = R_BLOCK_COMMENT_PURE_END.sub(" */", self.string)

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


    def parse(self, format=True):
        # print "Parse: " + intext

        # Strip "/**", "/*!" and "*/"
        intext = self.string[3:-2]

        # Strip leading stars in every line
        text = ""
        for line in intext.split("\n"):
            text += R_JAVADOC_STARS.sub("", line) + "\n"

        # Autodent
        text = Text(text).autoOutdent()

        # Search for attributes
        desc = { "category" : "description", "text" : "" }
        attribs = [desc]
        pos = 0

        while True:
            # this is necessary to match ^ at the beginning of a line
            if pos > 0 and  text[pos-1] == "\n": pos -= 1
            match = R_ATTRIBUTE.search(text, pos)

            if match == None:
                prevText = text[pos:].rstrip()

                if len(attribs) == 0:
                    desc["text"] = prevText
                else:
                    attribs[-1]["text"] = prevText

                break

            prevText = text[pos:match.start(0)].rstrip()
            pos = match.end(0)

            if len(attribs) == 0:
                desc["text"] = prevText
            else:
                attribs[-1]["text"] = prevText

            attribs.append({ "category" : match.group(1), "text" : "" })

        # parse details
        for attrib in attribs:
            self.parseDetail(attrib, format)

        return attribs


    def parseDetail(self, attrib, format=True):
        text = attrib["text"]

        if attrib["category"] in ["param", "event", "see", "state", "appearance", "childControl"]:
            match = R_NAMED_TYPE.search(text)
        else:
            match = R_SIMPLE_TYPE.search(text)

        if match:
            text = text[match.end(0):]

            if attrib["category"] in ["param", "event", "see", "state", "appearance", "childControl"]:
                attrib["name"] = match.group(1)
                #print ">>> NAME: %s" % match.group(1)
                remain = match.group(3)
            else:
                remain = match.group(2)

            if remain != None:
                defIndex = remain.rfind("?")
                if defIndex != -1:
                    attrib["defaultValue"] = remain[defIndex+1:].strip()
                    remain = remain[0:defIndex].strip()
                    #print ">>> DEFAULT: %s" % attrib["defaultValue"]

                typValues = []
                for typ in remain.split("|"):
                    typValue = typ.strip()
                    arrayIndex = typValue.find("[")

                    if arrayIndex != -1:
                        arrayValue = (len(typValue) - arrayIndex) / 2
                        typValue = typValue[0:arrayIndex]
                    else:
                        arrayValue = 0

                    typValues.append({ "type" : typValue, "dimensions" : arrayValue })

                if len(typValues) > 0:
                    attrib["type"] = typValues
                    #print ">>> TYPE: %s" % attrib["type"]

        if format:
            attrib["text"] = self.formatText(text)
        else:
            attrib["text"] = self.cleanupText(text)

        if attrib["text"] == "":
            del attrib["text"]


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
        return re.compile("\n\s{%s}" % indent).sub("\n", self.string)

    #def indent(self, source, indent):
    #  return re.compile("\n").sub("\n" + (" " * indent), source)

    ##
    # Insert <indent> at the beginning of each line in text
    #
    # @param indent {String} string to insert
    #
    def indent(self, indent):
        return re.compile("\n").sub("\n" + indent, self.string)


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
                    val = nameToType(var.getChild("identifier").get("name"))
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


def parseNode(node):
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

        if node.type == "function":
            name = node.get("name", False)
        else:
            name = ""

        alternative = False
        assignType = None

        if name != None:
            assignType = "function"

        # move to hook operation
        while target.parent.type in ["first", "second", "third"] and target.parent.parent.type == "operation" and target.parent.parent.get("operator") == "HOOK":
            alternative = True
            target = target.parent.parent

        # move comment to assignment
        while target.parent.type == "right" and target.parent.parent.type == "assignment":
            target = target.parent.parent
            if target.hasChild("left"):
                left = target.getChild("left")
                if left and left.hasChild("variable"):
                    var = left.getChild("variable")
                    last = var.getLastChild(False, True)
                    if last and last.type == "identifier":
                        name = last.get("name")
                        assignType = "object"

                    for child in var.children:
                        if child.type == "identifier":
                            if child.get("name") in ["prototype", "Proto"]:
                                assignType = "member"
                            elif child.get("name") in ["class", "base", "Class"]:
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
                newName = child.getChild("identifier").get("name")
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


