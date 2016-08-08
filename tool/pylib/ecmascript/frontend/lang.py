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
#    MIT: https://opensource.org/licenses/MIT
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
          "DOMException",
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
          'CanvasRenderingContext2D', 'DocumentFragment', 'history', 'Selection',
          'Storage', 'StyleSheet', 'File',

          # Language
          "eval", "decodeURI", "encodeURI", "decodeURIComponent", "encodeURIComponent",
          "escape", "unescape", "parseInt", "parseFloat", "isNaN", "isFinite",

          "this", "arguments", "undefined", "NaN", "Infinity"
          ]

# Web API
GLOBALS = GLOBALS + [
          "ArrayBuffer",
          "Blob",
          "CanvasGradient",
          "CanvasPattern",
          "CanvasRenderingContext2D",
          "CharacterData",
          "CloseEvent",
          "Comment",
          "CompositionEvent",
          "CSS",
          "CSSMediaRule",
          "CSSPageRule",
          "CSSRule",
          "CSSRuleList",
          "CSSStyleDeclaration",
          "CSSStyleRule",
          "CSSStyleSheet",
          "CustomEvent",
          "Document",
          "DocumentFragment",
          "DocumentType",
          "DOMImplementation",
          "DOMStringList",
          "DOMStringMap",
          "DOMTokenList",
          "EventSource",
          "EventTarget",
          "File",
          "FileList",
          "FileReader",
          "FormData",
          "History",
          "HTMLAnchorElement",
          "HTMLAreaElement",
          "HTMLAudioElement",
          "HTMLBaseElement",
          "HTMLBodyElement",
          "HTMLBRElement",
          "HTMLButtonElement",
          "HTMLCanvasElement",
          "HTMLCollection",
          "HTMLDataListElement",
          "HTMLDivElement",
          "HTMLDListElement",
          "HTMLDocument",
          "HTMLElement",
          "HTMLEmbedElement",
          "HTMLFieldSetElement",
          "HTMLFormControlsCollection",
          "HTMLFormElement",
          "HTMLHeadElement",
          "HTMLHeadingElement",
          "HTMLHRElement",
          "HTMLHtmlElement",
          "HTMLIFrameElement",
          "HTMLImageElement",
          "HTMLInputElement",
          "HTMLKeygenElement",
          "HTMLLabelElement",
          "HTMLLegendElement",
          "HTMLLIElement",
          "HTMLLinkElement",
          "HTMLMapElement",
          "HTMLMediaElement",
          "HTMLMetaElement",
          "HTMLMeterElement",
          "HTMLModElement",
          "HTMLObjectElement",
          "HTMLOListElement",
          "HTMLOptGroupElement",
          "HTMLOptionElement",
          "HTMLOptionsCollection",
          "HTMLOutputElement",
          "HTMLParagraphElement",
          "HTMLParamElement",
          "HTMLPreElement",
          "HTMLProgressElement",
          "HTMLQuoteElement",
          "HTMLScriptElement",
          "HTMLSelectElement",
          "HTMLSourceElement",
          "HTMLSpanElement",
          "HTMLStyleElement",
          "HTMLTableCaptionElement",
          "HTMLTableCellElement",
          "HTMLTableColElement",
          "HTMLTableDataCellElement",
          "HTMLTableElement",
          "HTMLTableHeaderCellElement",
          "HTMLTableRowElement",
          "HTMLTableSectionElement",
          "HTMLTextAreaElement",
          "HTMLTitleElement",
          "HTMLTrackElement",
          "HTMLUListElement",
          "HTMLUnknownElement",
          "HTMLVideoElement",
          "NodeList",
          "UIEvent",
          "WheelEvent",
          "Window",
          "Worker"
          ]

DEPRECATED = [
          "alert",
          "confirm",
          "debugger",
          "eval",
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
    "^" : "BITXOR",
    "&" : "BITAND",

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

FUTURE_RESERVED = {
    # Future reserved  (ECMAScript 3)
    # still supporting older browsers
    # commented out words are included in ECMAScript 5
    "abstract": "FUTURE_RESERVED_WORD",
    # "enum": "FUTURE_RESERVED_WORD",
    "int": "FUTURE_RESERVED_WORD",
    "short": "FUTURE_RESERVED_WORD",
    "boolean": "FUTURE_RESERVED_WORD",
    # "export": "FUTURE_RESERVED_WORD",
    "interface": "FUTURE_RESERVED_WORD",
    # "static": "FUTURE_RESERVED_WORD",
    "byte": "FUTURE_RESERVED_WORD",
    # "extends": "FUTURE_RESERVED_WORD",
    "long": "FUTURE_RESERVED_WORD",
    # "super": "FUTURE_RESERVED_WORD",
    "char": "FUTURE_RESERVED_WORD",
    "final": "FUTURE_RESERVED_WORD",
    "native": "FUTURE_RESERVED_WORD",
    "synchronized": "FUTURE_RESERVED_WORD",
    # "class": "FUTURE_RESERVED_WORD",
    "float": "FUTURE_RESERVED_WORD",
    # "package": "FUTURE_RESERVED_WORD",
    "throws": "FUTURE_RESERVED_WORD",
    # "const": "FUTURE_RESERVED_WORD",
    "goto": "FUTURE_RESERVED_WORD",
    # "private": "FUTURE_RESERVED_WORD",
    "transient": "FUTURE_RESERVED_WORD",
    # "implements": "FUTURE_RESERVED_WORD",
    # "protected": "FUTURE_RESERVED_WORD",
    "volatile": "FUTURE_RESERVED_WORD",
    "double": "FUTURE_RESERVED_WORD",
    # "import": "FUTURE_RESERVED_WORD",
    # "public": "FUTURE_RESERVED_WORD",

    # # Future reserved ECMAScript 5
    "class": "FUTURE_RESERVED_WORD",
    "const": "FUTURE_RESERVED_WORD",
    "enum": "FUTURE_RESERVED_WORD",
    "export": "FUTURE_RESERVED_WORD",
    "extends": "FUTURE_RESERVED_WORD",
    "import": "FUTURE_RESERVED_WORD",
    "super": "FUTURE_RESERVED_WORD",

    # Future reserved ECMAScript 5 (Strict)
    "implements": "FUTURE_RESERVED_WORD",
    "interface": "FUTURE_RESERVED_WORD",
    "let": "FUTURE_RESERVED_WORD",
    "package": "FUTURE_RESERVED_WORD",
    "private": "FUTURE_RESERVED_WORD",
    "protected": "FUTURE_RESERVED_WORD",
    "public": "FUTURE_RESERVED_WORD",
    "static": "FUTURE_RESERVED_WORD",
    "yield": "FUTURE_RESERVED_WORD"
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
    "false" : "FALSE"

    # not yet supported, should issue a warning
    #"debugger": "DEBUGGER",
}
RESERVED.update(FUTURE_RESERVED)


##
# Global qx symbols, but also start strings of such (qx.$$...)
QXGLOBALS = [
    #"clazz",
    "qxvariants",
    "qxsettings",
    "qx.$$",    # qx.$$domReady, qx.$$libraries, ...
    ]

##
# qx.*.define methods
QX_CLASS_FACTORIES = [
    "qx.Bootstrap.define",
    "qx.Class.define",
    "qx.Mixin.define",
    "qx.Interface.define",
    "qx.Theme.define",
    "q.define",
    "qxWeb.define",
    ]

SPACE_BEFORE = ["INSTANCEOF", "IN"]
SPACE_AFTER = ["VAR", "NEW", "GOTO", "INSTANCEOF", "TYPEOF", "DELETE", "IN", "THROW", "CASE", "VOID"]
SPACE_AFTER_USAGE = ["RETURN", "FUNCTION"]
PARANTHESIS_BEFORE = ["ELSE", "FINALLY", "CATCH", "WHILE"]

# These are not really chars, but char regexp's
IDENTIFIER_CHARS          = r'(?u)[\.\w$]'
IDENTIFIER_ILLEGAL_CHARS  = r'(?u)[^\.\w$]'
IDENTIFIER_REGEXP         = r'(?u)(?:[^\W\d]|\$)[\.\w$]*'

# These are really chars (sets)
# Inspired by http://boshi.inimino.org/3box/PanPG/grammars/ECMAScript_5.peg
# missing: escape sequences (s. ecma section 7.6)

import unicodedata as unidata
#UNICODE_MAX_CHAR_POINT = 0x10FFFF # entire code range, 0000-10FFFF, makes len(IDENTIFIER_CHARS_BODY)=93.671
UNICODE_MAX_CHAR_POINT = 65536  # Basic Plane, 0000-FFFF, makes len(IDENTIFIER_CHARS_BODY)=49.029

def unicat(c):
    try: cat = unidata.category(c)
    except: cat = ""
    return cat
#def twounicats():
#    start_chars = set()
#    body_chars = set()
#    for c in xrange(UNICODE_MAX_CHAR_POINT):
#        uchar = unichr(c)
#        try: cat = unidata.category(uchar)
#        except: cat = ""
#        if cat in IDENTIFIER_START_CATEGORIES: start_chars.add(uchar)
#        elif cat in IDENTIFIER_BODY_CATEGORIES: body_chars.add(uchar)
#    return start_chars, body_chars

IDENTIFIER_START_CATEGORIES = "Lu Ll Lt Lm Lo Nl".split()
IDENTIFIER_BODY_CATEGORIES = "Mn Mc Nd Pc".split()

IDENTIFIER_CHARS_START = set(['$', '_'] + [
    unichr(c) for c in xrange(UNICODE_MAX_CHAR_POINT) if unicat(unichr(c)) in IDENTIFIER_START_CATEGORIES])
IDENTIFIER_CHARS_BODY  = IDENTIFIER_CHARS_START.union([
    unichr(c) for c in xrange(UNICODE_MAX_CHAR_POINT) if unicat(unichr(c)) in IDENTIFIER_BODY_CATEGORIES])
#(
#IDENTIFIER_CHARS_START,
#IDENTIFIER_CHARS_BODY  ) = twounicats()

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
