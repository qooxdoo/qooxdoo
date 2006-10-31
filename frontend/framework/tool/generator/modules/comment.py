#!/usr/bin/env python

import sys, string, re
import config, tree, textile



S_INLINE_COMMENT = "//.*"
R_INLINE_COMMENT = re.compile("^" + S_INLINE_COMMENT + "$")

R_INLINE_COMMENT_TIGHT = re.compile("^//\S+")
R_INLINE_COMMENT_PURE = re.compile("^//")



S_BLOCK_COMMENT = "/\*([^*]|[\n]|(\*+([^*/]|[\n])))*\*+/"
R_BLOCK_COMMENT = re.compile("^" + S_BLOCK_COMMENT + "$")

R_BLOCK_COMMENT_JAVADOC = re.compile("^/\*\*")
R_BLOCK_COMMENT_QTDOC = re.compile("^/\*!")
R_BLOCK_COMMENT_DIVIDER = re.compile("^/\*\n\s*----")
R_BLOCK_COMMENT_HEADER = re.compile("^/\* \*\*\*\*")

R_BLOCK_COMMENT_TIGHT_START = re.compile("^/\*\S+")
R_BLOCK_COMMENT_TIGHT_END = re.compile("\S+\*/$")
R_BLOCK_COMMENT_PURE_START = re.compile("^/\*")
R_BLOCK_COMMENT_PURE_END = re.compile("\*/$")

R_ATTRIBUTE = re.compile(r'[^{]@(\w+)\s*')
R_JAVADOC_STARS = re.compile(r'^\s*\*')





# contains 4 groups (1:type, 2:array dimensions, 5:default value)
S_TYPE = r'\{([^@][\w\.]*)((\[\])*)(,\s*([^\},]+)\s*)?\}'

# contains same groups as S_TYPE
R_TYPE_ATTR = re.compile(r'^\s*' + S_TYPE + r'\s*')

# contains 6 groups (1: param name, 3:type, 4:array dimensions, 7:default value)
R_PARAM_ATTR = re.compile(r'^\s*(\w+)\s+(' + S_TYPE + r')?\s*')





VARPREFIXES = {
  "a" : "array",
  "b" : "boolean",
  "d" : "date",
  "f" : "function",
  "i" : "int",
  "h" : "map",
  "m" : "map",
  "n" : "number",
  "o" : "object",
  "s" : "string",
  "v" : "variable",
  "w" : "widget"
}

VARNAMES = {
  "a" : "array",
  "arr" : "array",

  "e" : "event",
  "ev" : "event",
  "evt" : "event",

  "el" : "element",
  "elem" : "element",
  "elm" : "element",

  "ex" : "exception",
  "exc" : "exception",

  "f" : "function",
  "func" : "function",

  "h" : "map",
  "hash" : "map",
  "map" : "map",

  "node" : "node",

  "n" : "number",
  "num" : "number",

  "o" : "object",
  "obj" : "object",

  "s" : "string",
  "str" : "string"
}

VARDESC = {
  "propValue" : "New value of this property",
  "propOldValue" : "Previous value of this property",
  "propData" : "Configuration map of this property"
}




def outdent(source, indent):
  return re.compile("\n\s{%s}" % indent).sub("\n", source)


def indent(source, indent):
  return re.compile("\n").sub("\n" + (" " * indent), source)






def correctInline(source):
  if R_INLINE_COMMENT_TIGHT.match(source):
    return R_INLINE_COMMENT_PURE.sub("// ", source)

  return source


def correctBlock(source):
  if not getFormat(source) in [ "javadoc", "qtdoc" ]:
    if R_BLOCK_COMMENT_TIGHT_START.search(source):
      source = R_BLOCK_COMMENT_PURE_START.sub("/* ", source)

    if R_BLOCK_COMMENT_TIGHT_END.search(source):
      source = R_BLOCK_COMMENT_PURE_END.sub(" */", source)

  return source


def correct(source):
  if source.startswith("//"):
    return correctInline(source)
  else:
    return correctBlock(source)






def isMultiLine(source):
  return source.find("\n") != -1


def getFormat(source):
  if R_BLOCK_COMMENT_JAVADOC.search(source):
    return "javadoc"
  elif R_BLOCK_COMMENT_QTDOC.search(source):
    return "qtdoc"
  elif R_BLOCK_COMMENT_DIVIDER.search(source):
    return "divider"
  elif R_BLOCK_COMMENT_HEADER.search(source):
    return "header"

  return "block"






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
      val = "variable"
    else:
      val = "undefined"

    if node.hasChild("expression"):
      expr = node.getChild("expression")
      if expr.hasChild("variable"):
        var = expr.getChild("variable")
        if var.getChildrenLength(True) == 1 and var.hasChild("identifier"):
          val = nameToType(var.getChild("identifier").get("name"))
        else:
          val = "variable"

      elif expr.hasChild("constant"):
        val = expr.getChild("constant").get("constantType")

        if val == "number":
          val = expr.getChild("constant").get("detail")

      elif expr.hasChild("array"):
        val = "array"

      elif expr.hasChild("map"):
        val = "map"

      elif expr.hasChild("function"):
        val = "function"

      elif expr.hasChild("call"):
        val = "call"

    if not val in found:
      found.append(val)

  elif node.hasChildren():
    for child in node.children:
      getReturns(child, found)

  return found






def nameToType(name):
  typ = "variable"

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



def searchAndParseToTree(item):
  """Takes the last doc comment from the commentsBefore child, parses it and
  returns a Node representing the doc comment"""

  # Find the last doc comment
  commentsBefore = item.getChild("commentsBefore", False)
  if commentsBefore and commentsBefore.hasChildren():
    for child in commentsBefore.children:
      if child.type == "comment" and child.get("detail") in [ "javadoc", "qtdoc" ]:
        return parseToTree(child.get("text"))


def createNode(typ, data):
  node = tree.Node(typ)
  
  for key in data.keys():
    if not data[key] in [ "", None ]:
      node.set(key, data[key])
      
  return node


def parseToTree(intext):
  (desc, attribs) = parse(intext)
  
  descNode = createNode("desc", desc)
  
  for attrib in attribs:
    descNode.addListChild("attributes", createNode("attribute", attrib))
  
  # Debug
  # print "== Comment ====================================================="
  # print tree.nodeToXmlString(descNode)
  # print "================================================================"

  return descNode
  


def classifyItem(itemConf, format=True):
  text = itemConf["text"]
  del itemConf["text"]

  mtch1 = R_PARAM_ATTR.search(text)
  mtch2 = R_TYPE_ATTR.search(text)

  if mtch1 and itemConf.has_key("category") and itemConf["category"] in [ "param", "event" ]:
    itemConf["classified"] = True
    itemConf["name"] = mtch1.group(1)
    itemConf["type"] = mtch1.group(3)
    itemConf["array"] = mtch1.group(4)
    itemConf["default"] = mtch1.group(7)
    text = text[mtch1.end(0):]
      
  elif mtch2:
    itemConf["classified"] = True
    itemConf["type"] = mtch2.group(1)
    itemConf["array"] = mtch2.group(2)
    itemConf["default"] = mtch2.group(5)
    text = text[mtch2.end(0):]
        
  else:
    itemConf["classified"] = False
    
  if format:
    itemConf["description"] = formatDescription(text)
  else:
    itemConf["description"] = cleanupDescription(text)
    


    
def cleanupDescription(text):
  #print "============= INTEXT ========================="
  #print text
  
  text = text.replace("<p>", "\n")
  text = text.replace("<br/>", "\n")
  text = text.replace("<br>", "\n")
  text = text.replace("</p>", " ")
  
  while True:
    temp = text
    text = temp.replace("\n\n\n", "\n\n")
    
    if text == temp:
      break
  
  #print "============= OUTTEXT ========================="
  #print text

  return text
  
    

def formatDescription(text):
  #print "============= FORMAT:1 ========================="
  #print text

  # cleanup HTML
  text = text.replace("<p>", "\n")
  text = text.replace("<br/>", "\n")
  text = text.replace("<br>", "\n")
  text = text.replace("</p>", " ")
  
  # cleanup wraps
  text = text.replace("\n\n", "----BREAK----")
  text = text.replace("\n*", "----UL----")
  text = text.replace("\n#", "----OL----")
  text = text.replace("\n", " ")
  text = text.replace("----BREAK----", "\n\n")
  text = text.replace("----UL----", "\n*")
  text = text.replace("----OL----", "\n#")
    
  #print "============= FORMAT:2 ========================="
  #print text
 
  text = textile.textile(unicode(text).encode('utf-8'))

  #print "============= FORMAT:3 ========================="
  #print text

  return text  



def parse(intext, format=True):
  # Strip "/**", "/*!" and "*/"
  intext = intext[3:-2]

  # Strip leading stars in every line
  text = ""
  for line in intext.split("\n"):
    text += R_JAVADOC_STARS.sub("", line).strip() + "\n"
    
  # Search for attributes
  desc = { "text" : "" }
  attribs = []
  pos = 0

  while True:
    mtch = R_ATTRIBUTE.search(text, pos)

    if mtch == None:
      prevText = text[pos:].strip()
        
      if len(attribs) == 0:
        desc["text"] = prevText
      else:
        attribs[-1]["text"] = prevText
      
      break
    
    prevText = text[pos:mtch.start(0)].strip()
    pos = mtch.end(0)

    if len(attribs) == 0:
      desc["text"] = prevText
    else:
      attribs[-1]["text"] = prevText

    attribs.append({ "category" : mtch.group(1), "text" : "" })
      
  # classify
  classifyItem(desc, format)
  
  for attrib in attribs:
    classifyItem(attrib, format)

  return desc, attribs

    


  

def getAttrib(attribList, category, name=None):
  if attribList == None:
    return None
  
  for attrib in attribList:
    if attrib["category"] == category:
      if name == None or attrib.has_key("name") and attrib["name"] == name:
        return attrib



def fromFunction(func, member, name, alternative, previousDesc=None, previousAttribs=None):
  #
  # open comment
  ##############################################################  
  s = "/**\n"


  #
  # description
  ##############################################################
  cdesc = "TODOC"
  
  if previousDesc != None and previousDesc.has_key("description") and not previousDesc["description"] in [ "", None ]:
    cdesc = previousDesc["description"]

  for line in cdesc.split("\n"):
    s += " * %s\n" % line
          
  s += " *\n"
  
  


  #
  # add @name
  ##############################################################
  if name != None:
    s += " * @name %s\n" % name

    if name.startswith("_"):
      s += " * @mode protected\n"
    else:
      s += " * @mode public\n"
      
      
      
  #
  # add @membership
  ##############################################################
  if member != None:
    s += " * @membership %s\n" % member
  else:
    s += " * @membership unknown TODOC\n"




  #
  # add @alternative
  ##############################################################
  oldAlternative = getAttrib(previousAttribs, "alternative")
  
  if alternative:
    adesc = "TODOC"
    
    if oldAlternative and oldAlternative.has_key("description") and not oldAlternative["description"] in [ "", None ]:
      adesc = oldAlternative["description"]
      
    s += " * @alternative"
    
    first = True
    for line in adesc.split("\n"):
      if first:
        s += " %s\n" % line
      else:
        s += " *   %s\n" % line
        
      first = False

    if not s.endswith("\n"):
      s += "\n"     
      
  elif oldAlternative:
    print " * Removing old @alternative for %s" % name
    
  


  #
  # add @param
  ##############################################################
  params = func.getChild("params")
  if params.hasChildren():
    for child in params.children:
      if child.type == "variable":
        pname = child.getChild("identifier").get("name")
        ptype = nameToType(pname)
        pdesc = nameToDescription(pname)
        
        oldParam = getAttrib(previousAttribs, "param", pname)
        
        # use old values instead
        if oldParam: 
          if oldParam.has_key("type") and not oldParam["type"] in [ "", None ]:
            ptype = oldParam["type"]
            
          if oldParam.has_key("description") and not oldParam["description"] in [ "", None ]:
            pdesc = oldParam["description"]
            
        s += " * @param %s {%s}" % (pname, ptype)
        
        first = True
        for line in pdesc.split("\n"):
          if first:
            s += " %s\n" % line
          else:
            s += " *   %s\n" % line
            
          first = False

        if not s.endswith("\n"):
          s += "\n"       
          


  

  #
  # add @return
  ##############################################################
  rtype = "undefined"
  rdesc = None

  oldReturn = getAttrib(previousAttribs, "return")

  if oldReturn:
    if oldReturn.has_key("type") and not oldReturn["type"] in [ "", None ]:
      rtype = oldReturn["type"]
      
    if oldReturn.has_key("description") and not oldReturn["description"] in [ "", None ]:
      rdesc = oldReturn["description"]

  if rtype == "undefined":
    returns = getReturns(func.getChild("body"), [])
    
    if len(returns) > 0:
      rtype = ",".join(returns)
    elif name != None and name.startswith("is") and name[3].isupper():
      rtype = "boolean"

  if rtype != "undefined" and rdesc == None:
    rdesc = "TODOC"  
    
  s += " * @return {%s}" % rtype
  
  if rdesc == None:
    s += "\n"
    
  else:
    first = True
    for line in rdesc.split("\n"):
      if first:
        s += " %s\n" % line
      else:
        s += " *   %s\n" % line
        
      first = False

    if not s.endswith("\n"):
      s += "\n"        
    
  




  #
  # add @throws
  ##############################################################
  oldThrow = getAttrib(previousAttribs, "throws")
  
  if hasThrows(func):
    tdesc = "TODOC"
    
    if oldThrow:
      if oldThrow.has_key("description") and not oldThrow["description"] in [ "", None ]:
        tdesc = oldThrow["description"]
    
    s += " * @throws"
    
    first = True
    for line in tdesc.split("\n"):
      if first:
        s += " %s\n" % line
      else:
        s += " *   %s\n" % line
        
      first = False

    if not s.endswith("\n"):
      s += "\n"      
    
  elif oldThrow:
    print " * Removing old @throw for %s" % name




  #
  # other @attributes
  ##############################################################
  
  for attrib in previousAttribs:
    cat = attrib["category"]

    if cat in [ "see", "author", "deprecated", "exception", "since", "version" ]:
      s += " * @%s" % cat

      if attrib.has_key("description") and not attrib["description"] in [ "", None ]:
        odesc = attrib["description"]
        
        first = True
        for line in odesc.split("\n"):
          if first:
            s += " %s\n" % line
          else:
            s += " *   %s\n" % line
            
          first = False

      if not s.endswith("\n"):
        s += "\n"  
          
    elif not cat in [ "name", "mode", "membership", "alternative", "param", "return", "throws" ]:
      print
      print " * Found unallowed attribute %s in %s" % (cat, name)
      
      
  


  #
  # close comment
  ##############################################################
  s += " */"

  return s



def enhance(node):
  if node.type in [ "comment", "commentsBefore", "commentsAfter" ]:
    return

  if node.type == "function":
    target = node
    name = node.get("name", False)
    alternative = False
    member = None

    if name != None:
      member = "scope"

    # move to hook operation
    while target.parent.type in [ "first", "second", "third" ] and target.parent.parent.type == "operation" and target.parent.parent.get("operator") == "HOOK":
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
            member = "object"

          for child in var.children:
            if child.type == "identifier":
              if child.get("name") in [ "prototype", "Proto", "this" ]:
                member = "instance"
              elif child.get("name") in [ "class", "base", "Class" ]:
                member = "static"


      elif target.parent.type == "definition":
        name = target.parent.get("identifier")
        member = "definition"


    # move to definition
    if target.parent.type == "assignment" and target.parent.parent.type == "definition" and target.parent.parent.parent.getChildrenLength(True) == 1:
      target = target.parent.parent.parent
      member = "scope"


    # move comment to keyvalue
    if target.parent.type == "value" and target.parent.parent.type == "keyvalue":
      target = target.parent.parent
      name = target.get("key")
      member = "map"

      if name == "init":
        member = "constructor"

      if target.parent.type == "map" and target.parent.parent.type == "value" and target.parent.parent.parent.type == "keyvalue":
        paname = target.parent.parent.parent.get("key")

        if paname == "members":
          member = "instance"

        elif paname == "statics":
          member = "static"



    if not hasattr(target, "documentationAdded") and target.parent.type != "params":
      previousDesc = None
      previousAttribs = []
      
      # create commentsBefore
      if target.hasChild("commentsBefore"):
        commentsBefore = target.getChild("commentsBefore")

        if commentsBefore.hasChild("comment"):
          for child in commentsBefore.children:
            if child.get("detail") in [ "javadoc", "qtdoc" ]:
              (previousDesc, previousAttribs) = parse(child.get("text"), False)
              commentsBefore.removeChild(child)
              break
              
      else:
        commentsBefore = tree.Node("commentsBefore")
        target.addChild(commentsBefore)

      # create comment node
      commentNode = tree.Node("comment")
      commentNode.set("text", fromFunction(node, member, name, alternative, previousDesc, previousAttribs))
      commentNode.set("detail", "javadoc")
      commentNode.set("multiline", True)

      commentsBefore.addChild(commentNode)
      
      # in case of alternative methods, use the first one, ignore the others
      target.documentationAdded = True


  if node.hasChildren():
    for child in node.children:
      enhance(child)

