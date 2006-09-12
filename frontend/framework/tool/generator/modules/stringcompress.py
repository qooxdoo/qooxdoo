#!/usr/bin/env python

def search(node, stringMap={}, verbose=False):
  if node.type == "constant" and node.get("constantType") == "string":

    print "    - Found: %s" % node.get("value")

    if node.get("detail") == "singlequotes":
      quote = "'"
    elif node.get("detail") == "doublequotes":
      quote = '"'

    value = "%s%s%s" % (quote, node.get("value"), quote)

    if value in stringMap:
      stringMap[value] += 1
    else:
      stringMap[value] = 1

  if check(node, verbose):
    for child in node.children:
      search(child, stringMap, verbose)



def check(node, verbose=False):
  # Needs children
  if not node.hasChildren():
    return False

  # Try to find all output statements
  if node.type == "call":
    cu = node
    nx = cu.getChild("operand", False)

    if nx != None:
      cu = nx

    all = cu.getAllChildrenOfType("identifier")

    for ch in all:
      if ch.get("name", False) in [ "Error", "debug", "info", "warning", "error", "alert" ]:
        if verbose:
          print "    - Ignore output statement at line: %s" % ch.get("line")
        return False

  # Try to find all constant assignments (ns.UPPER = string)
  elif node.type == "assignment":
    left = node.getChild("left", False)
    if left != None:
      var = left.getChild("variable", False)

      if var != None:
        last = var.getLastChild()

        if last.type == "identifier" and last.get("name").isupper():
          if verbose:
            print "    - Ignore constant assignment at line: %s" % last.get("line")
          return False

  # Try to find all constant assignments from Maps ({ UPPER : string })
  elif node.type == "keyvalue":
    if node.get("key").isupper():
      if verbose:
        print "    - Ignore constant key value at line: %s" % node.get("line")
      return False

  return True



def sort(stringMap):
  stringList = []

  for value in stringMap:
    stringList.append({ "value" : value, "number" : stringMap[value] })

  stringList.sort(lambda x, y: y["number"]-x["number"])

  return stringList




def replace(node, stringList, var="$", verbose=False):
  if node.type == "constant" and node.get("constantType") == "string":
    if node.get("detail") == "singlequotes":
      quote = "'"
    elif node.get("detail") == "doublequotes":
      quote = '"'

    oldvalue = "%s%s%s" % (quote, node.get("value"), quote)

    pos = 0
    for item in stringList:
      if item["value"] == oldvalue:
        newvalue = "%s[%s]" % (var, pos)
        print "    - Replace: %s => %s" % (oldvalue, newvalue)
        node.set("value", newvalue)
        break

      pos += 1

  if check(node, verbose):
    for child in node.children:
      replace(child, stringList, var, verbose)



def array(stringList, var="$"):
  repl = "%s=[" % var

  for item in stringList:
    repl += "%s," % (item["value"])

  repl = repl[:-1] + "];"

  return repl
