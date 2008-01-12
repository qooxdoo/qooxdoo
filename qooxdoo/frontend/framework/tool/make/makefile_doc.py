#!/usr/bin/env python
################################################################################
#                                                                               
#  qooxdoo - the new era of web development                                     
#                                                                               
#  http://qooxdoo.org                                                           
#                                                                               
#  Copyright:                                                                   
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de                   
#                                                                               
#  License:                                                                     
#    LGPL: http://www.gnu.org/licenses/lgpl.html                                
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php                      
#    See the LICENSE file in the project's top-level directory for details.     
#                                                                               
#  Authors:                                                                     
#    * Thomas Herchenroeder (thron7)
#                                                                               
################################################################################

##
# NAME
#  makefile_doc.py  -- extract information from qooxdoo Makefiles for
#                      documentation
#
# SYNTAX
#  makefile_doc.py  <name>.mk
#
#
# DESCRIPTION
#  Extracts documentation from qooxdoo Makefiles, to be included in qooxdoo
#  documenation.
#
#  The makefile contents is parsed into a structured representation consisting
#  of parts, sections, variables and includes. A part is signified by a comment
#  block enclosed by hash lines ("#....#"), a section by a comment block without
#  these lines. Sections are nested in parts, variables and includes can appear
#  both on the part level as well as the section level.
#
#  Here is a more formal description of the expected Makefile format (This
#  description uses Perl Regexp to express string literals and multiplicity):
#
#    makefile ::= {part}+
#    part     ::= pdescr {section|var|incl}
#    pdescr   ::= "^#{60,}$" {comment}+ "^#{60,}$"
#    comment  ::= "^#.*"
#    section  ::= sdescr {var|incl}
#    sdescr   ::= {comment}+
#    var      ::= <name> "=" default
#    default  ::= "" | <string>
#    incl     ::= "include" <path>
#
#  The current output is XML. To include the extracted information in the
#  DokuWiki documentation, run the output through an XSLT processor using the
#  'makefile_doc.xsl transformation file (see EXAMPLES).
#
#
# EXAMPLES
#  python makefile_doc.py application.mk | xsltproc makefile_doc.xsl - > mak.out
#
#
# CAVEATES
#  - Currently only tested with 'application.mk'
#  - The standard qooxdoo file header "qooxdoo - the new era of web development
#    ..." is included. If you don't like this, you have to strip this section
#    from the output by hand.
##

import sys
import re
import xml.dom.minidom
import optparse

comment = re.compile(r'^#')
include = re.compile(r'^\s*include')
var     = re.compile(r'^(\s*)([A-Z_]+)\s*:?=\s*(.*)$')
first_part = 1

# - Makefile Parser -------------------------------------------------------

def main():
    (opts, args) = get_options()
    impl = xml.dom.minidom.getDOMImplementation()
    newdoc = impl.createDocument(None,"mak",None)
    topEl = newdoc.documentElement
    curr  = topEl
    file_name = args[0]
    in_comment= 0
    in_ptitle = 0
    f = open(file_name,'r')
    for line in f:
        line1 = line.rstrip()
        if comment.search(line1):
            if (not in_comment):
                in_comment=1
                if re.search(r'^#{60,}$',line1):  # its a part title
                    if (not in_ptitle):
                        in_ptitle = 1
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
                t=newdoc.createTextNode(escape_text(line1))
                de.appendChild(t)
        else:
            in_comment=0
            in_ptitle =0
            if include.search(line1): # handle include's
                e=newdoc.createElement("incl")
                t=newdoc.createTextNode(escape_text(line1.split("include ")[1]))
                e.appendChild(t)
                curr.appendChild(e)
            elif var.search(line1):  # handle var's
                mo = var.search(line1)
                s= mo.group(1)+mo.group(2)+"\t(default:"+mo.group(3)+")"
                v=newdoc.createElement("var")
                curr.appendChild(v)
                n=newdoc.createElement("name")
                v.appendChild(n)
                t=newdoc.createTextNode(escape_text(mo.group(2)))
                n.appendChild(t)
                d=newdoc.createElement("default")
                v.appendChild(d)
                t=newdoc.createTextNode(escape_text(mo.group(3)))
                d.appendChild(t)
    f.close()
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



def escape_text(txt):
    if not options.escape:
        return txt
    txt1 = txt
    #txt1 = re.sub("'",r"\'",txt1)
    txt1 = txt1.replace("'",r"\'")
    return txt1

def get_options():
    global options

    parser = optparse.OptionParser()
    parser.add_option(
        "-e", dest="escape", default=False, action="store_true",
        help="Apply escapes to text nodes"
    )
    (options, args) = parser.parse_args()

    return (options, args)

# - Main -----------------------------------------------------------------

if __name__ == "__main__":
    main()
