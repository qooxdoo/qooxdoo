BUILTIN = ["Object", "Array", "RegExp", "Math", "String", "Number", "Error", "Date"]

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
SPACE_AFTER = ["VAR", "NEW", "GOTO", "INSTANCEOF", "TYPEOF", "DELETE", "IN", "THROW", "CASE"]
SPACE_AFTER_USAGE = ["RETURN", "FUNCTION"]
PARANTHESIS_BEFORE = ["ELSE", "FINALLY", "CATCH", "WHILE"]
