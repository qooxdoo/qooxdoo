#!/usr/bin/env python

def search(node, stringMap={}):
  if node.type == "constant" and node.get("constantType") == "string":
    if node.get("detail") == "singlequotes":
      quote = "'"
    elif node.get("detail") == "doublequotes":
      quote = '"'

    value = "%s%s%s" % (quote, node.get("value"), quote)

    if value in stringMap:
      stringMap[value] += 1
    else:
      stringMap[value] = 1

  if node.hasChildren():
    for child in node.children:
      search(child, stringMap)




def sort(stringMap):
  stringList = []

  for value in stringMap:
    stringList.append({ "value" : value, "number" : stringMap[value] })

  stringList.sort(lambda x, y: y["number"]-x["number"])

  return stringList




def replace(node, stringList, var="$"):
  if node.type == "constant" and node.get("constantType") == "string":
    oldvalue = node.get("value")

    pos = 0
    for item in stringList:
      if item["value"] == oldvalue:
        newvalue = "%s[%s]" % (var, pos)
        print "      - Replace: %s => %s" % (oldvalue, newvalue)
        node.set("value", newvalue)
        break

      pos += 1

  if node.hasChildren():
    for child in node.children:
      replace(child, stringList)



def array(stringList, var="$"):
  repl = "%s=[" % var

  for item in stringList:
    repl += "%s," % (item["value"])

  repl = repl[:-1] + "]"

  return repl
