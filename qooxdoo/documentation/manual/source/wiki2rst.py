import sys, os, re, codecs
from pyparsing import *

# -- transform stuff ------------------------

def convertToRst(opening,closing):
    def conversionParseAction(s,l,t):
        return opening + t[0] + closing
    return conversionParseAction

def convertToRst_A(s,l,t):
    try:
        url,text=t[0].split("|")
    except ValueError:
        #raise ParseFatalException(s,l,"invalid URL link reference: " + t[0])
        print >> sys.stderr, ("invalid URL link reference: " + t[0])
        return '<%s>' %t[0]
    return '`%s <%s>`_' % (text,url)
    
italicized1= QuotedString("//").setParseAction(convertToRst("*","*"))
italicized2= QuotedString("__").setParseAction(convertToRst("*","*"))
#bolded     = QuotedString("**").setParseAction(convertToRst("**","**"))
urlRef     = QuotedString("[[",endQuoteChar="]]").setParseAction(convertToRst_A)

wikiMarkup = urlRef | italicized1 | italicized2


# -- file handling ---------------------------

txtEnd = re.compile("\.txt$", re.I)

def transform(path):
    wikiInput = codecs.open(path, "r", "utf-8").read()
    rstString = wikiMarkup.transformString(wikiInput)
    if len(rstString)>0:
        codecs.open(txtEnd.sub(".rst", path), "w", "utf-8").write(rstString)

def main(path):
    assert(os.isdir(path))
    for root,dirs,files in os.walk(path):
        for file in (f for f in files if f.endswith(".txt")):
            transform(os.path.join(root,file))


if __name__ == "__main__":
    if len(sys.argv)>1:
        if os.path.isfile(sys.argv[1]):
            wikiInput = codecs.open(sys.argv[1],"r", "utf-8").read()
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
        print wikiMarkup.transformString(wikiInput)
