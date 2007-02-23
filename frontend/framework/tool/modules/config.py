#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1and1.org
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

import re




#
# FILE EXTENSIONS
#

JSEXT = ".js"
PYEXT = ".py"
XMLEXT = ".xml"
TOKENEXT = ".txt"
DIRIGNORE = [ ".svn", "CVS" ]




#
# QOOXDOO HEADER SUPPORT
#

QXHEAD = {
  # 0.6 class style
  "defineClass" : re.compile('qx.OO.defineClass\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\'](\s*\,\s*([\.a-zA-Z0-9_-]+))?', re.M),

  # 0.7 class style
  "classDefine" : re.compile('qx.(Clazz|Locale|Mixin|Interface|Theme).define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M),

  # Loader hints
  "module" : re.compile("#module\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
  "require" : re.compile("#require\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
  "use" : re.compile("#use\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
  "optional" : re.compile("#optional\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
  "ignore" : re.compile("#ignore\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),

  # Resource hints
  "resource" : re.compile("#resource\(\s*(.*?):(.*?)\s*\)", re.M),
  "embed" : re.compile("#embed\(\s*([a-zA-Z0-9]+?)\.([a-zA-Z0-9]+?)/(.+?)\s*\)", re.M)
}





#
# JAVASCRIPT SUPPORT
#

JSBUILTIN = [ "Object", "Array", "RegExp", "Math", "String", "Number", "Error" ]

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

JSPROTECTED = {
  "null" : "NULL",
  "Infinity" : "INFINITY",
  "true" : "TRUE",
  "false" : "FALSE",

  "this" : "THIS",
  "var" : "VAR",
  "new" : "NEW",
  "prototype" : "PROTOTYPE",
  "return" : "RETURN",
  "function" : "FUNCTION",

  "while" : "WHILE",
  "if" : "IF",
  "else" : "ELSE",
  "switch" : "SWITCH",
  "case" : "CASE",
  "default" : "DEFAULT",
  "break" : "BREAK",
  "continue" : "CONTINUE",
  "goto" : "GOTO",
  "do" : "DO",
  "delete" : "DELETE",
  "for" : "FOR",
  "in" : "IN",
  "with" : "WITH",
  "try" : "TRY",
  "catch" : "CATCH",
  "finally" : "FINALLY",
  "throw" : "THROW",
  "instanceof" : "INSTANCEOF",
  "typeof" : "TYPEOF",
  "void" : "VOID",
  "call" : "CALL",
  "apply" : "APPLY",

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

JSSPACE_BEFORE = [ "INSTANCEOF", "IN" ]
JSSPACE_AFTER = [ "VAR", "NEW", "GOTO", "INSTANCEOF", "TYPEOF", "DELETE", "IN", "THROW", "CASE" ]
JSSPACE_AFTER_USAGE = [ "RETURN", "FUNCTION" ]
JSPARANTHESIS_BEFORE = [ "ELSE", "FINALLY", "CATCH", "WHILE" ]
