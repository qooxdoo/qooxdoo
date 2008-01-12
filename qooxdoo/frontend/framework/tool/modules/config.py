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
#
################################################################################

##
#<h2>Module Description</h2>
#<pre>
# NAME
#  module.py -- module short description
#
# SYNTAX
#  module.py --help
#
#  or
#
#  import module
#  result = module.func()
#
# DESCRIPTION
#  The module module does blah.
#
# CAVEATS
#
# KNOWN ISSUES
#  There are no known issues.
#</pre>
##

import re




##
# FILE EXTENSIONS
#

JSEXT = ".js"
PYEXT = ".py"
XMLEXT = ".xml"
TOKENEXT = ".txt"
DIRIGNORE = [".svn", "CVS"]




#
# QOOXDOO HEADER SUPPORT
#

QXHEAD = {
    # 0.6 class style
    "defineClass" : re.compile('qx.OO.defineClass\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\'](\s*\,\s*([\.a-zA-Z0-9_-]+))?', re.M),

    # 0.7 class style
    "classDefine" : re.compile('qx.(Class|locale\.Locale|Mixin|Interface|Theme).define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M),

    # Loader hints
    "module" : re.compile("^#module\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
    "require" : re.compile("^#require\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
    "use" : re.compile("^#use\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
    "optional" : re.compile("^#optional\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
    "ignore" : re.compile("^#ignore\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),

    # Resource hints
    "resource" : re.compile("^#resource\(\s*([a-zA-Z0-9]+?)\.([a-zA-Z0-9]+?):(.*?)\s*\)", re.M),
    "embed" : re.compile("^#embed\(\s*([a-zA-Z0-9]+?)\.([a-zA-Z0-9]+?)/(.+?)\s*\)", re.M)
}





#
# JAVASCRIPT SUPPORT
#

JSBUILTIN = ["Object", "Array", "RegExp", "Math", "String", "Number", "Error"]

JSTOKENS = {
    "." : "DOT",
    "," : "COMMA",
    ":" : "COLON",
    "?" : "HOOK",
    ";" : "SEMICOLON",
    "!" : "NOT",
    "~" : "BITNOT",
    "\\" : "BACKSLASH",

    "+" : "ADD",
    "-" : "SUB",
    "*" : "MUL",
    "/" : "DIV",
    "%" : "MOD",

    "{" : "LC",
    "}" : "RC",
    "(" : "LP",
    ")" : "RP",
    "[" : "LB",
    "]" : "RB",

    "<" : "LT",
    "<=" : "LE",
    ">" : "GT",
    ">=" : "GE",
    "==" : "EQ",
    "!=" : "NE",
    "===" : "SHEQ",
    "!==" : "SHNE",

    "=" : "ASSIGN",

    "+=" : "ASSIGN_ADD",
    "-=" : "ASSIGN_SUB",
    "*=" : "ASSIGN_MUL",
    "/=" : "ASSIGN_DIV",
    "%=" : "ASSIGN_MOD",

    "|=" : "ASSIGN_BITOR",
    "^=" : "ASSIGN_BITXOR",
    "&=" : "ASSIGN_BITAND",
    "<<=" : "ASSIGN_LSH",
    ">>=" : "ASSIGN_RSH",
    ">>>=" : "ASSIGN_URSH",

    "&&" : "AND",
    "||" : "OR",

    "|" : "BITOR",
    "^|" : "BITXOR",
    "&" : "BITAND",

    "^" : "POWEROF",

    "<<" : "LSH",
    ">>" : "RSH",
    ">>>" : "URSH",

    "++" : "INC",
    "--" : "DEC",

    "::" : "COLONCOLON",
    ".." : "DOTDOT",

    "@" : "XMLATTR",

    "//" : "SINGLE_COMMENT",
    "/*" : "COMMENT_START",
    "*/" : "COMMENT_STOP",
    "/*!" : "DOC_START"
}

JSRESERVED = {
    # key words
    "break" : "BREAK",
    "case" : "CASE",
    "catch" : "CATCH",
    "continue" : "CONTINUE",
    "default" : "DEFAULT",
    "delete" : "DELETE",
    "do" : "DO",
    "else" : "ELSE",
    "finally" : "FINALLY",
    "for" : "FOR",
    "function" : "FUNCTION",
    "if" : "IF",
    "in" : "IN",
    "instanceof" : "INSTANCEOF",
    "new" : "NEW",
    "return" : "RETURN",
    "switch" : "SWITCH",
    "this" : "THIS",
    "throw" : "THROW",
    "try" : "TRY",
    "typeof" : "TYPEOF",
    "var" : "VAR",
    "void" : "VOID",
    "while" : "WHILE",
    "with" : "WITH",

    # null literal
    "null" : "NULL",

    # boolean literal
    "true" : "TRUE",
    "false" : "FALSE",

    # Future reserved
    "abstract": "FUTURE_RESERVED_WORD",
    "enum": "FUTURE_RESERVED_WORD",
    "int": "FUTURE_RESERVED_WORD",
    "short": "FUTURE_RESERVED_WORD",
    "boolean": "FUTURE_RESERVED_WORD",
    "export": "FUTURE_RESERVED_WORD",
    "interface": "FUTURE_RESERVED_WORD",
    "static": "FUTURE_RESERVED_WORD",
    "byte": "FUTURE_RESERVED_WORD",
    "extends": "FUTURE_RESERVED_WORD",
    "long": "FUTURE_RESERVED_WORD",
    "super": "FUTURE_RESERVED_WORD",
    "char": "FUTURE_RESERVED_WORD",
    "final": "FUTURE_RESERVED_WORD",
    "native": "FUTURE_RESERVED_WORD",
    "synchronized": "FUTURE_RESERVED_WORD",
    "class": "FUTURE_RESERVED_WORD",
    "float": "FUTURE_RESERVED_WORD",
    "package": "FUTURE_RESERVED_WORD",
    "throws": "FUTURE_RESERVED_WORD",
    "const": "FUTURE_RESERVED_WORD",
    "goto": "FUTURE_RESERVED_WORD",
    "private": "FUTURE_RESERVED_WORD",
    "transient": "FUTURE_RESERVED_WORD",
      # not yet supoprted, should issue a warning
      #"debugger": "DEBUGGER",
    "implements": "FUTURE_RESERVED_WORD",
    "protected": "FUTURE_RESERVED_WORD",
    "volatile": "FUTURE_RESERVED_WORD",
    "double": "FUTURE_RESERVED_WORD",
    "import": "FUTURE_RESERVED_WORD",
    "public": "FUTURE_RESERVED_WORD"
}

JSSPACE_BEFORE = ["INSTANCEOF", "IN"]
JSSPACE_AFTER = ["VAR", "NEW", "GOTO", "INSTANCEOF", "TYPEOF", "DELETE", "IN", "THROW", "CASE"]
JSSPACE_AFTER_USAGE = ["RETURN", "FUNCTION"]
JSPARANTHESIS_BEFORE = ["ELSE", "FINALLY", "CATCH", "WHILE"]
