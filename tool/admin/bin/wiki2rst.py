#!/usr/bin/env python
##
# NAME
#  wiki2rst.py  -- convert Dokuwiki page syntax to reStructured Text
#
# REQUIRES
#  pandoc (ext.program)
#
# SYNTAX
#  wiki2rst.py pages pages/tutorials/tutorial-part-4-2.txt (single file)
#  wiki2rst.py pages  (directory tree)
#
# DESCRIPTION
#  wiki2rst.py takes .txt files with Dokuwiki syntax, and converts them to
#  corresponding .rst markup. You either run it on a single file or an entire
#  directory tree. In the single-file invocation output is written to STDOUT,
#  for directory trees, .rst files will be created corresponding to the input
#  file paths. The first argument to the script is always a root directory
#  from which e.g. internal links are calculated.
#  For embedded HTML in Dokuwiki files it relies on the pandoc [1] program to
#  convert it to reST.
#
# CAVEATS
#  After the conversion the resulting .rst markup most likely needs some
#  finishing touches to get the desired rendering.
#  There is probably some legacy junk code in it, stemming from the time when we
#  ported the entire manual from Dokuwiki to reST.
#
#  [1] http://www.johnmacfarlane.net/pandoc/
##


import sys, os, re, codecs

import qxenviron
from pyparse.pyparsing import *

# -- transform stuff ------------------------

def convertToRst(opening,closing):
    def conversionParseAction(s,l,t):
        return opening + wikiMarkup.transformString(t[0]) + closing
    return conversionParseAction

ns12 = ":1.2:"
headLevel = 0

def internalLink(url):
    # wiki links are all-lowercase
    url = url.lower()
    # manual url
    if url.find(ns12)>-1:
        url = url[url.find(ns12)+len(ns12):]
        if currentInput.endswith("index.txt"):
            url = "pages/" + url
    # wiki url
    else:
        if url.startswith(".:"):
            url = url[2:]
        if url.startswith("."):
            url = url[1:]
        if (url.startswith(":") or url.startswith("documentation") or
            url.startswith("about")):
            if url.startswith(":"):
                url = url[1:]
            url = "http*//qooxdoo.org/" + url
            # this covers not everything, e.g. "lowleveloverview" -> documentation/lowleveloverview
    url = url.replace(":", "/")
    url = url.replace("*", ":")
    base, ext = os.path.splitext(url)
    if not ext:
        #url += ".html"
        pass
    return url

fileset = set(())
def absolutizeUrl(url, withext=False):
    # generator_config_articles#packages_key -> pages/tool/generator_config_article#packages_key
    # force all-lowercase
    url = url.lower()
    if url.find('#')>-1:  # strip fragment id
        fragment = url[url.find('#'):]
        base = url[:url.find('#')]
    else:
        fragment = ""
        base     = url
    for knownbase in fileset:
        if knownbase.endswith(base):
            return knownbase + fragment
    for root,dirs,files in os.walk(dirroot):
        for file in files:
            fbase,ext = os.path.splitext(file)
            fullbase = os.path.join(root, fbase)
            if withext:
                fullbase += ext
            fullbase = fullbase.lower()
            fullbase = os.path.normpath(fullbase)  # get rid of leading "./"
            if fullbase.endswith(base):
                fileset.add(fullbase)
                return fullbase + fragment
    eout("  could not absolutize url: %s" % url)
    return url

def convertToRst_A(s,l,t):
    i = t[0].find("|")
    if i>-1:
        url = t[0][:i]
        text= t[0][i+1:]
    else:
        url = t[0]
        text= ""
    text = text.strip()
    url  = url.strip()

    # Handle url
    if url.startswith("http://"):
        return '`%s <%s>`_' % (text,url)
    # handle intrawiki link
    else:
        url = internalLink(url)

    # intrawiki link could be turned into an external link
    if url.startswith("http://"):
        return '`%s <%s>`_' % (text,url)

    # decide about link keyword
    if url.find('#')>-1:  # we have a document fragment identifier
        keyword = "ref"
        if url.startswith('#'): # have to use the full label
            path,ext = os.path.splitext(currentInput)
            url = path + url
        else:
            url = absolutizeUrl(url)
    else:                 # entire document link
        keyword = "doc"
    # put together with text
    if text:
        return ':%s:`%s <%s>`' % (keyword,text,url)
    else:
        return ':%s:`%s`' % (keyword,url)


def convertToRst_I(s,l,t):
    import random
    # split text and url
    i = t[0].find("|")
    if i>-1:
        url = t[0][:i]
        text= t[0][i+1:]
    else:
        url = t[0]
        text= ""
    text = text.strip()

    # remove trailing artifacts
    url = re.sub(r'\?.*$', '', url)
    # Handle url
    if url.startswith("http://"):
        pass
    # handle document:1.2:
    elif url.find(ns12)>-1:
        url = internalLink(url)
        url = absolutizeUrl(url, withext=True)
        if url.startswith("pages/"):
            url = "/" + url   # need to 'absolutize' internal img refs, http://sphinx.pocoo.org/rest.html#images
    else:
        #raise ParseFatalException(s,l,"invalid URL link reference: " + t[0])
        #print >> sys.stderr, ("invalid image reference: " + t[0])
        #return t[0]
        pass  # should do as is

    # TODO: if the image ref is within the text flow, ret will break the text!
    # (which is not often the case)
    if imgEnd.search(url):
        # Handle text
        if not text:
            text = "image" + str(random.choice(range(1000)))
        if text.find(ns12)>-1:
            text = internalLink(text)  # make the alt string look like the img uri
        ret = "|%s|\n\n.. |%s| image:: %s\n\n" % (text,text,url)
    else : # .pdf, .zip, ...
        if text:
            ret = ':doc:`%s <%s>`' % (text,url)
        else:
            ret = ':doc:`%s`' % url

    return ret

wikiNoChars = re.compile(r'["\')(?!]')
def wikianchor(txt):
    txt = txt.lower()
    txt = wikiNoChars.sub('',txt,)
    txt = txt.replace(" ", "_")
    return txt


def convertHeading(linechar):
    mylevel = [x[1] for x,y in linechars.items() if y==linechar][0]
    mylevel = int(mylevel)
    def parseAction(s,l,t):
        global headLevel
        # insert intermediate heading?
        if headLevel > 0 and mylevel - headLevel > 1: # new header skips a level
            # insert intermediate headers to assure consistency
            prehead = ""
            for i in range(1, mylevel - headLevel):
                lchar = linechars["h"+str(headLevel+i)]
                prehead += "\nXXX\n" + 3 * lchar + "\n\n"
        else:
            prehead = ""
        headLevel = mylevel

        txt = t[0].strip()
        # create jump label
        path,ext = os.path.splitext(currentInput)
        anchor   = wikianchor(txt)
        label = "\n.. _" + path + "#" + anchor + ":\n\n"

        # put it together
        txt = prehead + label + txt + "\n" + linechar * len(txt)
        return txt
    return parseAction

def reindentBlock(s,n):
    s1 = s.split('\n')
    s1 = [(n * ' ') + line for line in s1]
    s1 = "\n".join(s1)
    return s1

def convertCodeBlock(s,l,t):
    # t = [ 'code', ['javascript'], False, 'qx.Class.define(....)', '</code>']
    # TODO: the next leaves the :: on a line of its own, where it should be
    # appended to the previous paragraph!
    if len(t) < 5:
        code = t[2]
    else:
        code = t[3]
    res = "\n::\n\n"
    res += reindentBlock(code, 4)
    res += "\n"
    return res


def convertTable(s,l,t):
    def makeline(fields, colwids):
        s = ""
        for field, colwid in zip(fields,colwids):
            s += field + " " * (colwid - len(field))
            s += "  "
        s += '\n'
        return s

    # t = ['header', '\nfirst row\nsecond row\n...', '\n\n']
    #eout(repr(tabcnt)+"\n\n\n")
    # split fields
    header = t[0].split('^')[1:-1]
    colcnt = len(header)
    rows   = []
    for row in t[1].split('\n')[1:]:
        rows.append(row.split('|')[1:-1])
    maxcols = []
    # get longest field for each row
    for colidx in range(colcnt):
        maxcol = 0
        for row in [header] + rows:
            fieldlen = len(row[colidx])
            if fieldlen > maxcol:
                maxcol = fieldlen
        maxcols.append(maxcol)
    # construct separator
    seps = []
    for colwid in maxcols:
        seps.append(colwid * "=")
    sep  = "  ".join(seps)
    # put it together
    ret = sep + '\n'
    ret += makeline(header,maxcols)
    ret += sep + '\n'
    for row in rows:
        ret += makeline(row,maxcols)
    ret += sep + '\n\n\n'
    return ret


def convertNoteBlock(s,l,t):
    # t = [ 'code', ['javascript'], False, 'qx.Class.define(....)', '</code>']
    # TODO: the next leaves the :: on a line of its own, where it should be
    # appended to the previous paragraph!
    if len(t) < 5:
        code = t[2]
    else:
        code = t[3]
    res = "\n.. note::\n\n"
    res += reindentBlock(wikiMarkup.transformString(code), 4)
    res += "\nxxx\n"  # make sure the note is closed
    return res

def eout(s):
    print >> sys.stderr, s

def convertHtml(i):
    def htmlBlock(s,l,t,):
        import subprocess
        eout("  converting HTML with pandoc")
        #eout(t)
        # preprocess
        s = t[i]
        s = "<html>" + s + "</html>"
        s = s.replace("&nbsp;", " ")
        p = subprocess.Popen(['pandoc', '--from=html', '--to=rst'],
                             stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        ret = p.communicate(s)[0]
        # postprocess
        ret = ret.replace(os.linesep, "\n")
        if ret.endswith("\n"):
            ret = ret[:-1]
        #ret = ret.decode('ascii', 'replace')
        #eout("%r" % ret)
        return ret
    return htmlBlock


# these are the sphinx recommended heading ornaments
linechars = {
    "h1" : "#",
    "h2" : "*",
    "h3" : "=",
    "h4" : "-",
    "h5" : "^",
    "h6" : '"'
    }

italicized1= QuotedString("//").setParseAction(convertToRst("*","*"))
italicized2= QuotedString("__").setParseAction(convertToRst("*","*"))
boldItalic = QuotedString("***").setParseAction(convertToRst("**","**")) # have to chose one
boldItalic = QuotedString("**//",endQuoteChar="//**").setParseAction(convertToRst("**","**")) # have to chose one
urlRef     = QuotedString("[[",endQuoteChar="]]").setParseAction(convertToRst_A)
#h1 - haven't really used part headings so far
h2         = QuotedString("======").setParseAction(convertHeading(linechars["h2"]))
h3         = QuotedString("=====").setParseAction(convertHeading(linechars["h3"]))
h4         = QuotedString("====").setParseAction(convertHeading(linechars["h4"]))
h5         = QuotedString("===").setParseAction(convertHeading(linechars["h5"]))
h6         = QuotedString("==").setParseAction(convertHeading(linechars["h6"]))
code       = QuotedString("''").setParseAction(convertToRst("``","``"))
myHtmlBlock = convertHtml(0)
html       = QuotedString("<html>", endQuoteChar="</html>").setParseAction(myHtmlBlock)
imgRef     = QuotedString("{{",endQuoteChar="}}").setParseAction(convertToRst_I)
br         = Literal(r'\\ ').setParseAction(replaceWith(""))

htmlOpen,htmlClose = makeHTMLTags("html")
htmlEmb = htmlOpen + SkipTo(htmlClose) + htmlClose
#myHtmlBlock  = functools.partial(htmlBlock, i=2)
myHtmlBlock = convertHtml(2)
htmlEmb.setParseAction(myHtmlBlock)
#htmlEmb.setParseAction(htmlBlock)

codeOpen, codeClose = makeHTMLTags("code")
codeBlock  = codeOpen + SkipTo(codeClose, ) + codeClose
codeBlock.setParseAction(convertCodeBlock)

noteOpen, noteClose = makeHTMLTags("note")
noteBlock  = noteOpen + SkipTo(noteClose, ) + noteClose
noteBlock.setParseAction(convertNoteBlock)

tableOpen, tableClose = Regex(r'^\^.*\^$', re.M), Literal("\n\n").leaveWhitespace()
tableBlock = tableOpen + SkipTo(tableClose) + tableClose
tableBlock.setParseAction(convertTable)

wikiMarkup = (
    italicized1 |
    italicized2 |
    boldItalic |
    urlRef | imgRef |
    h2 | h3 | h4 | h5 | h6 |
    code | codeBlock |
    noteBlock |
    html | br |
    tableBlock
    )


# -- file handling ---------------------------

txtEnd = re.compile("\.txt$", re.I)
imgEnd = re.compile("\.(png|gif|jpg|jpeg)", re.I)

repeatedNewlines = LineEnd() + OneOrMore(LineEnd())
repeatedNewlines.setParseAction(replaceWith("\n\n"))

def rmEmptyLines(s):
    return repeatedNewlines.transformString(s)

def transform(path):
    global headLevel
    global currentInput
    print "transforming: %s" % path
    headLevel = 0    # reset heading level for new document
    currentInput = path
    wikiInput = codecs.open(path, "rU", "utf-8").read()
    rstString = wikiMarkup.transformString(wikiInput)
    # first pass leaves many blank lines, collapse these down
    rstString = rmEmptyLines(rstString)

    if len(rstString)>0:
        codecs.open(txtEnd.sub(".rst", path), "w", "utf-8").write(rstString)

def main(path):
    assert(os.path.isdir(path))
    global dirroot
    dirroot = path
    for root,dirs,files in os.walk(path):
        for file in (f for f in files if f.endswith(".txt")):
            transform(os.path.join(root,file))


if __name__ == "__main__":
    wikiInput = ""
    if len(sys.argv)>1:
        if len(sys.argv)>2:
            if os.path.isfile(sys.argv[2]):
                currentInput = sys.argv[2]
                dirroot = os.path.dirname(sys.argv[1]) or '.'
                wikiInput = codecs.open(sys.argv[2], "rU", "utf-8").read()
        elif os.path.isdir(sys.argv[1]):
            main(sys.argv[1])
    else:
        wikiInput = """
        Here is a simple Wiki input:
          //This is in italics.//
          __This is also in italics.__
          **This is in bold!**
          ***This is in bold italics!***
          Here's a URL to [[http://qooxdoo.org|qooxdoo's homepage]]
        """

    if wikiInput:
        res = wikiMarkup.transformString(wikiInput)
        res = rmEmptyLines(res)
        print res.encode('ascii', 'xmlcharrefreplace')
