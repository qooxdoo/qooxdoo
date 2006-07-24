#!/usr/bin/env python

import re




#
# FILE EXTENSIONS
#

JSEXT = ".js"
XMLEXT = ".xml"
TOKENEXT = ".txt"
DIRIGNORE = [ ".svn", "CVS" ]
SETTINGSOUTPUT = "__settings__"




#
# QOOXDOO HEADER SUPPORT
#

QXHEAD = {
  "defineClass" : re.compile('qx.OO.defineClass\(["\']([\.a-zA-Z0-9_-]+)["\'](\s*\,\s*([\.a-zA-Z0-9_-]+))?', re.M),
  "uniqueId" : re.compile("#id\(([\.a-zA-Z0-9_-]+)\)", re.M),
  "module" : re.compile("#module\(([\.a-zA-Z0-9_-]+)\)", re.M),
  "require" : re.compile("#require\(([\.a-zA-Z0-9_-]+)\)", re.M),
  "use" : re.compile("#use\(([\.a-zA-Z0-9_-]+)\)", re.M),
  "optional" : re.compile("#optional\(([\.a-zA-Z0-9_-]+)\)", re.M),
  "resource" : re.compile("#resource\(([\.a-zA-Z0-9_-]+)\)", re.M)
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
  "apply" : "APPLY"
}

JSSPACE_BEFORE = [ "INSTANCEOF", "IN" ]
JSSPACE_AFTER = [ "VAR", "NEW", "GOTO", "INSTANCEOF", "TYPEOF", "DELETE", "IN", "THROW", "CASE" ]
JSSPACE_AFTER_USAGE = [ "RETURN", "FUNCTION" ]
JSPARANTHESIS_BEFORE = [ "ELSE", "FINALLY", "CATCH", "WHILE" ]
