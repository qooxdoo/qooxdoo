#!/usr/bin/env python

import sys, os, re, codecs
from pyparsing import *

# -- transform stuff ------------------------

def convertToRst(opening,closing):
    def conversionParseAction(s,l,t):
        return opening + t[0] + closing
    return conversionParseAction

ns12 = ":1.2:"

def internalLink(url):
    url = url[url.find(ns12)+len(ns12):]
    url = "pages/" + url
    url = url.replace(":", "/")
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

    # Handle url
    if url.startswith("http://"):
        return '`%s <%s>`_' % (text,url)
    # handle document:1.2:
    elif url.find(ns12)>-1:
        url = internalLink(url)
    # handle generator_config_articles#log_key
    else:
        #raise ParseFatalException(s,l,"invalid URL link reference: " + t[0])
        #print >> sys.stderr, ("invalid URL link reference: " + t[0])
        #return '<%s>' %t[0]
        pass  # use as is
    if text:
        return ':doc:`%s <%s>`' % (text,url)
    else:
        return ':doc:`%s`' % url

def convertToRst_I(s,l,t):
    import random
    i = t[0].find("|")
    if i>-1:
        url = t[0][:i]
        text= t[0][i+1:]
    else:
        url = t[0]
        text= ""
    text = text.strip()

    # Handle url
    if url.startswith("http://"):
        pass
    # handle document:1.2:
    elif url.find(ns12)>-1:
        url = internalLink(url)
        url = "/" + url   # need to 'absolutize' internal img refs, http://sphinx.pocoo.org/rest.html#images
    else:
        #raise ParseFatalException(s,l,"invalid URL link reference: " + t[0])
        #print >> sys.stderr, ("invalid image reference: " + t[0])
        #return t[0]
        pass  # should do as is
    # remove trailing artifacts
    url = re.sub(r'\?.*$', '', url)

    # Handle text
    if not text:
        text = "image" + str(random.choice(range(1000)))
    if text.find(ns12)>-1:
        text = internalLink(text)  # make the alt string look like the img uri
    # TODO: if the image ref is within the text flow, ret will break the text!
    # (which is not often the case)
    ret = "|%s|\n\n.. |%s| image:: %s\n\n" % (text,text,url)

    return ret

def convertHeading(linechar):
    def parseAction(s,l,t):
        txt = t[0].strip()
        return txt + "\n" + linechar * len(txt)
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
    res = "::\n\n"
    res += reindentBlock(t[3], 4)
    res += "\n"
    return res

def eout(s):
    print >> sys.stderr, s

def htmlBlock(s,l,t):
    import subprocess
    eout("  converting HTML with pandoc")
    # preprocess
    s = t[0]
    s = s.replace("&nbsp;", " ")
    p = subprocess.Popen(['pandoc', '--from=html', '--to=rst'],
                         stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    ret = p.communicate(s)[0]
    # postprocess
    if ret.endswith('\n'):
        ret = ret[:-1]
    #ret = ret.decode('ascii', 'replace')
    #eout("%r" % ret)
    return ret
    

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
urlRef     = QuotedString("[[",endQuoteChar="]]").setParseAction(convertToRst_A)
#h1 - haven't really used part headings so far
h2         = QuotedString("======").setParseAction(convertHeading(linechars["h2"]))
h3         = QuotedString("=====").setParseAction(convertHeading(linechars["h3"]))
h4         = QuotedString("====").setParseAction(convertHeading(linechars["h4"]))
h5         = QuotedString("===").setParseAction(convertHeading(linechars["h5"]))
h6         = QuotedString("==").setParseAction(convertHeading(linechars["h6"]))
code       = QuotedString("''").setParseAction(convertToRst("``","``"))
html       = QuotedString("<html>", endQuoteChar="</html>").setParseAction(htmlBlock)
imgRef     = QuotedString("{{",endQuoteChar="}}").setParseAction(convertToRst_I)
br         = Literal(r'\\ ').setParseAction(replaceWith(""))

codeOpen, codeClose = makeHTMLTags("code")
codeBlock  = codeOpen + SkipTo(codeClose, ) + codeClose
codeBlock.setParseAction(convertCodeBlock)

wikiMarkup = ( 
    italicized1 | 
    italicized2 | 
    boldItalic | 
    urlRef | imgRef |
    h2 | h3 | h4 | h5 | h6 |
    code | codeBlock |
    html |
    br
    )


# -- file handling ---------------------------

txtEnd = re.compile("\.txt$", re.I)

repeatedNewlines = LineEnd() + OneOrMore(LineEnd())
repeatedNewlines.setParseAction(replaceWith("\n\n"))

def rmEmptyLines(s):
    return repeatedNewlines.transformString(s)

def transform(path):
    wikiInput = codecs.open(path, "rU", "utf-8").read()
    rstString = wikiMarkup.transformString(wikiInput)
    # first pass leaves many blank lines, collapse these down
    rstString = rmEmptyLines(rstString)

    if len(rstString)>0:
        codecs.open(txtEnd.sub(".rst", path), "w", "utf-8").write(rstString)

def main(path):
    assert(os.path.isdir(path))
    for root,dirs,files in os.walk(path):
        for file in (f for f in files if f.endswith(".txt")):
            transform(os.path.join(root,file))


if __name__ == "__main__":
    wikiInput = ""
    if len(sys.argv)>1:
        if os.path.isfile(sys.argv[1]):
            wikiInput = codecs.open(sys.argv[1], "rU", "utf-8").read()
        elif os.path.isdir(sys.argv[1]):
            main(sys.argv[1])
    else:
        wikiInput = """
        Here is a simple Wiki input:
          //This is in italics.//
          __This is also in italics.__
          **This is in bold!**
          ***This is in bold italics!***
          Here's a URL to [[http://pyparsing.wikispaces.com|Pyparsing's Wiki Page]]
        """

    if wikiInput:
        res = wikiMarkup.transformString(wikiInput)
        res = rmEmptyLines(res)
        print res
