import re

# General configuration
xmlext = ".xml"
xsl = "/usr/bin/xsltproc"
copyright = "2002-2005 Schlund+Partner AG, Germany"
job = "all"
buildpath = "build"
sourcepath = "."
prefix = "docs"
cachepath = ".cache"
#djl newlines = False
#djl...
newlines = True
#...djl

# lines to be removed from optimized code
outremove = []

# lines to be replaced
outreplace = {}

# Comments
common_singlecomment = re.compile("[a-zA-Z0-9 -_]*//.*")
common_multicommentstart = re.compile("/\*")
common_multicommentstop = re.compile(".*\*/.*")
common_doccommentstart = re.compile("/\*\!")
common_doccommentstop = re.compile(".*\*/.*")
common_multicommentsingle = re.compile("/\*.*\*/.*")

# JavaScript
js_ecma_globalfunction = re.compile("function .*(.*)")
js_ecma_extendfunction = re.compile("(window|document|frames|forms|elements|images|navigator)*\.[a-zA-Z]*=function(.*).*")
js_ecma_regexp = re.compile(".*\/.+\/.*")
js_ecma_extendobject = re.compile("(Object|String|Array|RegExp|Number|Function)*\.prototype\..*=\s*function(.*)")
js_qooxdoo_newinherit = re.compile("[a-zA-Z]+\.extend\(.+\)")
js_qooxdoo_addproperty = re.compile("[a-zA-Z]+\.addProperty(.*).*")
js_qooxdoo_prototypefunction = re.compile("proto\..*=\s*function(.*)")

# CSS
css_tag = re.compile("[0-9a-zA-Z]+")
css_class = re.compile("\.[0-9a-zA-Z]+")
css_id = re.compile("\#[0-9a-zA-Z]+")
css_idclass = re.compile("\#[0-9a-zA-Z]+\.[0-9a-zA-Z]+")
css_tagclass = re.compile("[0-9a-zA-Z]+\.[0-9a-zA-Z]+")
css_tagid = re.compile("[0-9a-zA-Z]+\#[a-zA-Z]+")
css_tagidclass = re.compile("[0-9a-zA-Z]+\#[0-9a-zA-Z]+\.[0-9a-zA-Z]+")
css_property = re.compile("[-a-zA-Z]+:.+")
css_import = re.compile("\@import .+")
css_hexcolor = re.compile("\#[a-fA-F0-9]{3}[a-fA-F0-9]*")
css_rgbcolor = re.compile("rgb\([0-9]+,[0-9]+,[0-9]+\)")
css_hexmap = { "0":0, "1":1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9, "a":10, "b":11, "c":12, "d":13, "e":14, "f":15 }
