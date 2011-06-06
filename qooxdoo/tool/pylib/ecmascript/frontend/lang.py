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
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# JavaScript Language Details
##


# built-in classes
BUILTIN = [
          "ActiveXObject",
          "Array",
          "Boolean",
          "Date",
          "document",
          "DOMParser",
          "Element",
          "Error",
          "EvalError",
          "Event",
          "Function",
          "Image",
          "Math",
          "navigator",
          "Node",
          "Number",
          "Object",
          "Option",
          "Range",
          "RangeError",
          "ReferenceError",
          "RegExp",
          "String",
          "SyntaxError",
          "TypeError",
          "URIError",
          "window",
          "XMLHttpRequest",
          "XMLSerializer",
          "XPathEvaluator",
          "XPathResult",
          "XSLTProcessor",
          ]

GLOBALS = BUILTIN + [
          # Java
          "java", "sun", "Packages",
  
          # Firefox extension: Firebug
          "console",
  
          # IE
          "event", "offscreenBuffering", "clipboardData", "clientInformation",
          "external", "screenTop", "screenLeft",
          
          # Webkit
          "WebkitCSSMatrix",
  
          # window
          'addEventListener', '__firebug__', 'location', 'netscape',
          'XPCNativeWrapper', 'Components', 'parent', 'top', 'scrollbars',
          'name', 'scrollX', 'scrollY', 'scrollTo', 'scrollBy', 'getSelection',
          'JSON', 'scrollByLines', 'scrollByPages', 'sizeToContent', 'dump',
          'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
          'setResizable', 'captureEvents', 'releaseEvents', 'routeEvent',
          'enableExternalCapture', 'disableExternalCapture', 'prompt', 'open',
          'openDialog', 'frames', 'find', 'self', 'screen', 'history',
          'content', 'menubar', 'toolbar', 'locationbar', 'personalbar',
          'statusbar', 'directories', 'closed', 'crypto', 'pkcs11',
          'controllers', 'opener', 'status', 'defaultStatus', 'innerWidth',
          'innerHeight', 'outerWidth', 'outerHeight', 'screenX', 'screenY',
          'pageXOffset', 'pageYOffset', 'scrollMaxX', 'scrollMaxY', 'length',
          'fullScreen', 'alert', 'confirm', 'focus', 'blur', 'back', 'forward',
          'home', 'stop', 'print', 'moveTo', 'moveBy', 'resizeTo', 'resizeBy',
          'scroll', 'close', 'updateCommands',

          'atob', 'btoa', 'frameElement', 'removeEventListener', 'dispatchEvent',
          'getComputedStyle', 'sessionStorage', 'globalStorage', 'localStorage',
  
          # Language
          "eval", "decodeURI", "encodeURI", "decodeURIComponent", "encodeURIComponent",
          "escape", "unescape", "parseInt", "parseFloat", "isNaN", "isFinite",
  
          "this", "arguments", "undefined", "NaN", "Infinity"
          ]

TOKENS = {
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

RESERVED = {
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

SPACE_BEFORE = ["INSTANCEOF", "IN"]
SPACE_AFTER = ["VAR", "NEW", "GOTO", "INSTANCEOF", "TYPEOF", "DELETE", "IN", "THROW", "CASE", "VOID"]
SPACE_AFTER_USAGE = ["RETURN", "FUNCTION"]
PARANTHESIS_BEFORE = ["ELSE", "FINALLY", "CATCH", "WHILE"]

IDENTIFIER_CHARS          = r'(?u)[\.\w$]'
IDENTIFIER_ILLEGAL_CHARS  = r'(?u)[^\.\w$]'
#IDENTIFIER_REGEXP         = r'%s+' % IDENTIFIER_CHARS
IDENTIFIER_REGEXP         = r'(?u)^(?:[^\W\d]|\$)[\.\w$]*'

##
# Re-creating some Unicode information here, as it is not provided by Python


# source: http://www.fileformat.info/info/unicode/category/Zs/list.htm
#UNICODE_CATEGORY_Zs = ur'''(?ux)
#    [
#        \u0020  # SPACE
#        \u00A0  # NO-BREAK SPACE
#        \u1680  # OGHAM SPACE MARK
#        #\u180E # MONGOLIAN VOWEL SEPARATOR  -- not included, as it is not matched by '(?u)\s'
#        \u2000  # EN QUAD
#        \u2001  # EM QUAD
#        \u2002  # EN SPACE
#        \u2003  # EM SPACE
#        \u2004  # THREE PER EM SPACE
#        \u2005  # FOUR PER EM SPACE
#        \u2006  # SIX PER EM SPACE
#        \u2007  # FIGURE SPACE
#        \u2008  # PUNCTUATION SPACE
#        \u2009  # THIN SPACE
#        \u200A  # HAIR SPACE
#        \u202F  # NARROW NO BREAK SPACE
#        \u205F  # MEDIUM MATHEMATICAL SPACE
#        \u3000  # IDEOGRAPHIC SPACE
#    ]'''
UNICODE_CATEGORY_Zs = ur'''(?u)[\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000]'''
