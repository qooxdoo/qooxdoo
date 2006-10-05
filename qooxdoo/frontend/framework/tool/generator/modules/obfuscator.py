#!/usr/bin/env python

import tree, mapper

ignoreStart = [ "_modify", "_check", "set", "get", "force" ]

ignoreKeywords = [
  # Global
  "window", "frames", "document", "all", "navigator", "screen", "node", "style", "anchors", "applets", "forms", "elements", "options", "images", "embeds", "layers", "links", "event", "history", "location",

  # Arguments
  "arguments", "arity", "caller", "callee",

  # Navigator
  "plugins", "mimeTypes", "javaEnabled", "userAgent", "platform", "language", "cookieEnabled", "appVersion", "appName", "appCodeName",

  # Math
  "E", "LN2", "LN10", "LOG2E", "LOG10E", "PI", "SQRT1_2", "SQRT_2",

  # Number
  "MAX_VALUE", "MIN_VALUE", "NaN", "NEGATIVE_INFINITY", "POSITIVE_INFINITY",

  # Location
  "hash", "host", "hostname", "href", "pathname", "port", "protocol", "search",

  # CSS (http://www.blooberry.com/indexdot/css/propindex/all.htm)
  "accelerator","azimuth","background","backgroundAttachment","backgroundColor","backgroundImage",
  "backgroundPosition","backgroundPositionX","backgroundPositionY","backgroundRepeat","behavior",
  "border","borderBottom","borderBottomColor","borderBottomStyle","borderBottomWidth","borderCollapse",
  "borderColor","borderLeft","borderLeftColor","borderLeftStyle","borderLeftWidth","borderRight",
  "borderRightColor","borderRightStyle","borderRightWidth","borderSpacing","borderStyle","borderTop",
  "borderTopColor","borderTopStyle","borderTopWidth","borderWidth","bottom","captionSide",
  "clear","clip","color","content","counterIncrement","counterReset","cue","cueAfter","cueBefore","cursor",
  "direction","display","elevation","emptyCells","filter","cssFloat","float","font","fontFamily","fontSize",
  "fontSizeAdjust","fontStretch","fontStyle","fontVariant","fontWeight","height","imeMode","includeSource",
  "layerBackgroundColor","layerBackgroundImage","layoutFlow","layoutGrid","layoutGridChar",
  "layoutGridCharSpacing","layoutGridLine","layoutGridMode","layoutGridType","left","letterSpacing",
  "lineBreak","lineHeight","listStyle","listStyleImage","listStylePosition","listStyleType","margin",
  "marginBottom","marginLeft","marginRight","marginTop","markerOffset","marks","maxHeight","maxWidth",
  "minHeight","minWidth","MozBinding","MozBorderRadius","MozBorderRadiusTopleft","MozBorderRadiusTopright",
  "MozBorderRadiusBottomright","MozBorderRadiusBottomleft","MozBorderTopColors","MozBorderRightColors",
  "MozBorderBottomColors","MozBorderLeftColors","MozOpacity","MozOutline","MozOutlineColor",
  "MozOutlineStyle","MozOutlineWidth","MozUserFocus","MozUserInput","MozUserModify","MozUserSelect",
  "orphans","outline","outlineColor","outlineStyle","outlineWidth","overflow","overflowX","overflowY","padding",
  "paddingBottom","paddingLeft","paddingRight","paddingTop","page","pageBreakAfter","pageBreakBefore",
  "pageBreakInside","pause","pauseAfter","pauseBefore","pitch","pitchRange","playDuring","position","quotes",
  "Replace","richness","right","rubyAlign","rubyOverhang","rubyPosition","SetLinkSource","size","speak",
  "speakHeader","speakNumeral","speakPunctuation","speechRate","stress","scrollbarArrowColor",
  "scrollbarBaseColor","scrollbarDarkShadowColor","scrollbarFaceColor","scrollbarHighlightColor",
  "scrollbarShadowColor","scrollbar3dLightColor","scrollbarTrackColor","tableLayout","textAlign",
  "textAlignLast","textDecoration","textIndent","textJustify","textOverflow","textShadow","textTransform",
  "textAutospace","textKashidaSpace","textUnderlinePosition","top","unicodeBidi","UseLinkSource",
  "verticalAlign","visibility","voiceFamily","volume","whiteSpace","widows","width","wordBreak", "wordSpacing",
  "wordWrap", "writingMode", "zIndex", "zoom",

  # Events
  "addEventListener", "removeEventListener", "dispatchEvent", "preventDefault", "stopPropagation",
  "attachEvent", "detachEvent",

  # Other
  "id", "target", "value", "action", "reset", "update", "name", "type", "defaultValue", "focus", "blur", "init",
  "get", "set",

  # qooxdoo
  "ROOT_LOGGER"
]

# By selfhtml
ignoreReserved = [
  "abstract", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "default",
  "delete", "do", "double", "else", "export", "extends", "false", "final", "finally", "float", "for", "function"
  "goto", "if", "implements", "in", "instanceof", "int", "long", "native", "new", "null", "package", "private",
  "protected", "prototype", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw",
  "throws", "transient", "true", "try", "typeof", "undefined", "var", "void", "while", "with"
]

ignoreMethods = [
  # Object
  "toString",

  # Array
  "concat", "join", "pop", "push", "reverse", "shift", "slice", "splice", "sort", "unshift",

  # String
  "anchor", "big", "blink", "bold", "charAt", "charCodeAt", "concat", "fixed", "fontcolor", "fontsize", "fromCharCode", "indexOf", "italics", "lastIndexOf", "link", "match", "replace", "search", "slice", "small", "split", "strike", "sub", "substr", "substring", "sup", "toLowerCase", "toUpperCase",

  # RegExp
  "match", "replace", "search",

  # Number
  "toExponential", "toFixed", "toPrecision", "toString",

  # Math
  "abs", "acos", "asin", "atan", "ceil", "cos", "exp", "floor", "log", "max", "min", "pow", "random", "round", "sin", "sqrt", "tan",

  # Date
  "getDate", "getDay", "getFullYear", "getHours", "getMilliseconds", "getMinutes", "getMonth", "getSeconds", "getTime",
  "getTimezoneOffset", "getUTCDate", "getUTCFullYear", "getUTCHours", "getUTCMilliseconds", "getUTCMinutes", "getUTCMonth",
  "getUTCSeconds", "getYear", "parse", "setDate", "setFullYear", "setHours", "setMilliseconds", "setMinutes", "setMonth",
  "setSeconds", "setTime", "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes",
  "setUTCMonth", "setUTCSeconds", "setYear", "toGMTString", "toLocaleString", "UTC",

  # Location
  "reload", "replace"
]


def search(node, names):

  if node.type == "assignment":
    left = node.getChild("left", False)

    if left:
      variable = left.getChild("variable", False)

      if variable:
        last = variable.getLastChild()
        first = variable.getFirstChild()

        if last == first:
          if last.type == "identifier":
            pass

        elif last.type == "identifier":
          name = last.get("name")

          respect = False

          if name.isupper():
            respect = True

          elif name.startswith("_"):
            respect = True

          ignore = False
          for item in ignoreStart:
            if name.startswith(item):
              ignore = True

          if name in ignoreKeywords or name in ignoreMethods or name in ignoreReserved:
            ignore = True

          if respect and not ignore:
            if not names.has_key(name):
              print "Add %s" % name

              names[name] = 1
            else:
              names[name] += 1

  if node.hasChildren():
    for child in node.children:
      search(child, names)

  return names




def update(node, list, prefix):

  if node.type == "identifier":
    idenName = node.get("name", False)

    if idenName != None and idenName in list:
      replName = "%s%s" % (prefix, mapper.convert(list.index(idenName)))
      node.set("name", replName)

      # print "  - Replaced '%s' with '%s'" % (idenName, replName)

  if node.hasChildren():
    for child in node.children:
      update(child, list, prefix)




def sort(names):
  temp = []

  for name in names:
    temp.append({ "name" : name, "number" : names[name] })

  temp.sort(lambda x, y: y["number"]-x["number"])

  list = []

  for item in temp:
    list.append(item["name"])

  return list
