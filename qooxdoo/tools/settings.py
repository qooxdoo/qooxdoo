import re

# Grundlegende Einstellungen
xmlext = ".xml"
xsl = "/usr/bin/xsltproc"
copyright = "2002-2005 (Germany): United Internet, 1&1, GMX, Schlund+Partner, Alturo"
job = "all"
publicpath = "public"
sourcepath = "."
prefix = "docs"
cachepath = ".cache"

# Zeilen die entfernt werden sollen aus optimiertem Code
outremove = []

# Zeilen die ersetzt werden sollen
outreplace = {}
outreplace["addProperty"] = "_a1"
outreplace["_children"] = "_a2"

outreplace["propValue"] = "_b1"
outreplace["propOldValue"] = "_b2"
outreplace["propName"] = "_b3"
outreplace["uniqModIds"] = "_b4"

outreplace["_modify"] = "_e1"
outreplace["_eval"] = "_e2"

outreplace["_pureCreateFill"] = "_e3"
outreplace["vModifiedWidget"] = "_e4"
outreplace["vHint"] = "_e5"

outreplace["_iconObject"] = "_f1"
outreplace["_textObject"] = "_f2"
outreplace["_shortcutObject"] = "_f3"
outreplace["_arrowObject"] = "_f4"

outreplace["_onmousedown"] = "_g1"
outreplace["_onmouseup"] = "_g2"
outreplace["_onclick"] = "_g3"
outreplace["_onkeydown"] = "_g4"
outreplace["_onkeyup"] = "_g5"
outreplace["_onkeypress"] = "_g6"

outreplace["_displayIcon"] = "_c1"
outreplace["_displayText"] = "_c2"
outreplace["_displayShortcut"] = "_c3"
outreplace["_displayArrow"] = "_c4"
outreplace["_showIcon"] = "_c5"
outreplace["_showText"] = "_c6"
outreplace["_showShortcut"] = "_c7"
outreplace["_showArrow"] = "_c8"

outreplace["_layoutInternalWidgetsHorizontal"] = "_d1"
outreplace["_layoutInternalWidgetsVertical"] = "_d2"
outreplace["_applyPosition"] = "_d3"
outreplace["_invalidateInner"] = "_d4"
outreplace["_calculateChildrenDepend"] = "_d5"

# Border
outreplace["_props"] = "_h1"
outreplace["_defs"] = "_h2"
outreplace["_syncGeckoBorder"] = "_h3"

# ClientWindow
outreplace["_element"] = "_h3"
outreplace["_clientDocument"] = "_h4"
outreplace["_eventManager"] = "_h5"
outreplace["_focusManager"] = "_h6"

# Data
outreplace["_requestQueue"] = "_h7"

# Extend
outreplace["_properties"] = "_h8"
outreplace["_propertygroups"] = "_h9"
outreplace["_properties"] = "_i1"

# Object
outreplace["_counter"] = "_i2"
outreplace["_db"] = "_i3"

# SelectionStorage
outreplace["_storage"] = "_i4"

# Target
outreplace["_listeners"] = "_i5"
outreplace["_dispatchEvent"] = "_i6"

# Timer
outreplace["_oninterval"] = "_i7"
outreplace["_intervalHandle"] = "_i8"

# SelectionManager
outreplace["_dispatchChange"] = "_j1"
outreplace["_selectItemRange"] = "_j2"
outreplace["_updateState"] = "_j3"
outreplace["_activeDragSession"] = "_j4"
outreplace["_selectedItems"] = "_j5"
outreplace["_deselectItemRange"] = "_j6"
outreplace["_deselectAll"] = "_j7"
outreplace["_hasChanged"] = "_j8"
outreplace["renderItemSelectionState"] = "_j9"
outreplace["renderItemLeadState"] = "_j10"

# Drag&Drop Manager
outreplace["_data"] = "_k1"
outreplace["_actions"] = "_k2"
outreplace["_cursors"] = "_k3"
outreplace["_supportAction"] = "_k4"
outreplace["_lastDestinationEvent"] = "_k5"
outreplace["_dragCache"] = "_k6"





# Kommentare
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
