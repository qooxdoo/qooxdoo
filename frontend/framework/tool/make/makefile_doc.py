#!/usr/bin/python

# usage: makefile_doc.py  <file>
#  -- as data structure

import sys
import re
import xml.dom.minidom

#(set 'pattern "^#")
comment = re.compile(r'^#')
include = re.compile(r'^\s*include')
var     = re.compile(r'^(\s*)([A-Z_]+)\s*:?=\s*(.*)$')
first_part = 1

# - Makefile Parser -------------------------------------------------------

def main():
  #(dolist (file-name (2 (main-args)))
  impl = xml.dom.minidom.getDOMImplementation()
  newdoc = impl.createDocument(None,"mak",None)
  topEl = newdoc.documentElement
  curr  = topEl
  file_name = sys.argv[1]
  in_comment= 0
  in_ptitle = 0
  f = open(file_name,'r')
  #(println "file ---> " file-name)
  for line in f:
    #line.rstrip('#\r\n')
    line1 = line.rstrip()
    if comment.search(line1):
      if (not in_comment):
        #print "\n"
        in_comment=1
        if re.search(r'^#{60,}$',line1):  # its a part title
          if (not in_ptitle):
            in_ptitle = 1
            #curr = topEl
            e=newdoc.createElement("part")
            topEl.appendChild(e)
            de=newdoc.createElement("title")
            e.appendChild(de)
            curr = e
            first_sect = 1
          else: # exit part title
            in_ptitle = 0
        else: # its a section descr
          if first_sect:
            first_sect = 0
          else:
            curr = curr.parentNode  # leave previous section
          e=newdoc.createElement("section")
          curr.appendChild(e)
          de=newdoc.createElement("descr")
          e.appendChild(de)
          curr=e
      line1 = line1.replace('#','')
      if len(line1) > 0:
        t=newdoc.createTextNode(line1)
        de.appendChild(t)
    else:
      in_comment=0
      in_ptitle =0
      #curr=topEl
      if include.search(line1): # handle include's
        #print line1
        e=newdoc.createElement("incl")
        t=newdoc.createTextNode(line1.partition("include ")[2])
        e.appendChild(t)
        curr.appendChild(e)
      elif var.search(line1):  # handle var's
        mo = var.search(line1)
        #print mo.group(1),mo.group(2),"\t(default:",mo.group(3),")"
        s= mo.group(1)+mo.group(2)+"\t(default:"+mo.group(3)+")"
        v=newdoc.createElement("var")
        curr.appendChild(v)
        #t=newdoc.createTextNode(s)
        n=newdoc.createElement("name")
        v.appendChild(n)
        t=newdoc.createTextNode(mo.group(2))
        n.appendChild(t)
        d=newdoc.createElement("default")
        v.appendChild(d)
        t=newdoc.createTextNode(mo.group(3))
        d.appendChild(t)
  f.close()
  #push cont{"includes"}, include
  topEl.writexml(sys.stdout)
  #print topEl.toprettyxml("  ")
  #output(topEl)

# - Output Control -------------------------------------------------------

def output(topEl):
  if (topEl.hasChildNodes()):
    for child in topEl.childNodes:
      curr = child.tagName
      if (curr == "section"):
        output_sec()
        output(curr)
      elif (curr == "part"):
        output_part(child)
      elif (curr == "var"):
        output_var(curr)
      elif (curr == "descr"):
        output_desc()

def output_part(part):
  global first_part
  if first_part:
    first_part = 0
    return
  partname = part.firstChild.firstChild.nodeValue
  print "===== ", partname, " ====="
  print
  #output(part.rest_of_part_without_title)

def output_sec(sec):
  secname = sec.descr
  print "===== ", secname, " ====="
  print

def output_var(var):
  varname = var.name # geht nicht! <var><name>
  print "==== ", varname, " ===="
  print
  default = var.default
  print "[default: \"",default,"\""

def output_desc(desc):
  text = desc.innerHtml  # stimmt bestimmt nicht!
  print text
  print

# - Main -----------------------------------------------------------------

if __name__ == "__main__":
  main()
