################################################################
# JavaScript & CSS Compiler and Documentation Extractor (JCCDE)
################################################################

import sys, string, re, os, random, settings

data = {}



# Thanks to Mark Pilgrim, http://diveintomark.org/
# for this single function
def preg_replace(pattern, replacement, text):
  # this acts like re.sub, except it replaces empty groups with ''
  #  instead of raising an exception
  def replacement_func(matchobj):
    counter = 1
    rc = replacement
    for matchitem in matchobj.groups():
      if not matchitem:
        matchitem = ''
      rc = rc.replace(r'\%s' % counter, matchitem)
      counter += 1
    return rc
  p = re.compile(pattern)
  return p.sub(replacement_func, text)


def jsFileCleanup(data):
  return data.split("\n")


def cssFileCleanup(data):
  # cleanup multiple object rules
  m = re.compile(",\s*\n", re.DOTALL)
  data = m.sub(", ", data)

  # force line breaks around "{"
  m = re.compile("\{", re.DOTALL)
  data = m.sub("\n{\n", data)

  # force line breaks around "}"
  m = re.compile("\}", re.DOTALL)
  data = m.sub("\n}\n", data)

  # force line breaks after ";"
  m = re.compile(";", re.DOTALL)
  data = m.sub(";\n", data)

  return data.split("\n")


def parseDocument(infile, cachefile, outfile, filename, mode):
  if filename[0] == "/": filename = filename[1:]

  indata = open(infile).read()

  if settings.job == "compress":
    try:
      cachedata = open(cachefile).read()
      if indata == cachedata:
        #print "    -> No Change"
        return

    except IOError:
      #print "    -> Creating Cache File"
      pass



  #print "    -> Processing"
  cachefileo = open(cachefile, "w")
  cachefileo.write(indata)
  cachefileo.close()

  cachedata = indata


  #common
  c_doc = []
  s_out = ""

  s_out += "/* Copyright (c): " + settings.copyright + " */\n"

  s_out_flag = 0
  s_out_open = 0
  s_docstart = 0
  s_commentstart = 0
  s_docused = 1
  s_pos = 0
  s_opendef = 0
  s_objectline = []
  s_groupobj = ""


  s_klammerzu = False



  lastengprotoobject = ""

  # if there are already rules, continue to add them
  if data.has_key("css") and data["css"].has_key("rules"):
    s_pos = len(data["css"]["rules"])

  # js
  s_currentproperty = ""

  # css
  s_opendef = 0


  if mode == "js":
    if not data.has_key("js"):
      data["js"] = {}
      data["js"]["objects"] = {}
      data["js"]["files"] = {}

    # Add filename
    data["js"]["files"][filename] = { "sourcesize" : len(indata) };

    indata = jsFileCleanup(indata)


  elif mode == "css":
    if not data.has_key("css"):
      data["css"] = {}

      # all rules
      data["css"]["rules"] = []
      data["css"]["files"] = {}
      data["css"]["groups"] = {}
      data["css"]["colors"] = {}

      #LATER
      # properties
      # data["css"]["target_properties"]["vertical-align"] = [ 57, 105, 203 ]
      #data["css"]["target_properties"] = {}

      # ALL

      # tags
      # data["css"]["all_tags]["h2"] = [ 23, 24, 58 ]
      data["css"]["all_tags"] = {}

      # ids
      # data["css"]["all_ids]["content"] = [ 34, 96, 233 ]
      data["css"]["all_ids"] = {}

      # classes
      # data["css"]["all_classes]["selected"] = [ 69, 192, 293 ]
      data["css"]["all_classes"] = {}


      # TARGET

      # tags
      # data["css"]["target_tags]["h2"] = [ 23, 24, 58 ]
      data["css"]["target_tags"] = {}

      # ids
      # data["css"]["target_ids]["content"] = [ 34, 96, 233 ]
      data["css"]["target_ids"] = {}

      # classes
      # data["css"]["target_classes]["selected"] = [ 69, 192, 293 ]
      data["css"]["target_classes"] = {}


      # PARENT

      # tags
      # data["css"]["parent_tags]["h2"] = [ 23, 24, 58 ]
      data["css"]["parent_tags"] = {}

      # ids
      # data["css"]["parent_ids]["content"] = [ 34, 96, 233 ]
      data["css"]["parent_ids"] = {}

      # classes
      # data["css"]["parent_classes]["selected"] = [ 69, 192, 293 ]
      data["css"]["parent_classes"] = {}


    # Add filename
    data["css"]["files"][filename] = { "sourcesize" : len(indata) };

    indata = cssFileCleanup(indata)




  for line in indata:
    line = basicLineCleanup(line)

    #print line

    line = re.compile("\/\/.*$").sub("", line)

#   if settings.common_singlecomment.match(line, 0):
#     pass

    if settings.common_doccommentstart.match(line, 0):
      c_doc = []
      s_docstart = 1
      s_docused = 1
      #print "DOCSTART"

    elif s_docstart and settings.common_doccommentstop.match(line, 0):
      s_docstart = 0
      s_docused = 0
      #print "DOCSTOP"

    elif settings.common_multicommentsingle.match(line, 0):
      #print "MULTISINGLECOMMENT"
      pass

    elif settings.common_multicommentstart.match(line, 0):
      s_commentstart = 1
      #print "COMMENTSTART"

    elif s_commentstart and settings.common_multicommentstop.match(line, 0):
      s_commentstart = 0
      #print "COMMENTSTOP"

    elif s_docstart:
      c_doc.append(line)
      #print "DOCAPPEND"

    elif line == "":
      pass

    elif not s_commentstart and not s_docstart:

      # Ignore Lines which should be removed from code
      ignoreline = 0
      for m in settings.outremove:
        if m.match(line, 0):
          ignoreline = 1
          break

      if ignoreline: continue

      # Cleanup JavaScript/CSS
      if mode == "js":
        if not settings.js_ecma_regexp.match(line, 0):
          line = jsLineCleanup(line)

      elif mode == "css":
        line = cssLineCleanup(line)
      # ...add more if needed


      if mode == "js":
        # Version 4
        cline = line
        
        if settings.newlines:
          s_out += line + "\n"
        else:
          for keyelem in settings.outreplace.keys():
            cline = string.replace(cline, keyelem, settings.outreplace[keyelem])
  
          if s_klammerzu:
            #if line[0:4] != "else" and line[0:5] != "while" and line[0:5] != "catch":
              # print "    * Warning: Probably missing semicolon after fragment: %s" % s_out[-30:]
              # s_out += ";"
  
            s_klammerzu = False
  
  
          s_out += cline
  
          if line[-1:] == ";" or line[-1:] == "{" or line[-1:] == ":" or line[-1:] == ")" or line[-1:] == "(" or line[-3:] == "try" or line[-1:] == "," or line[-1:] == "+" or line[-1:] == "-" or line[-1:] == "/" or line[-1:] == "*":
            pass
  
          elif line[-4:] == "else":
            s_out += " "
  
          elif line[-1:] == "}":
            s_klammerzu = True
  
          else:
            s_out += "\n"

        # Analyse Code
        if settings.js_qooxdoo_newinherit.match(line, 0):
          fname = line[:line.find(".")]
          oname = line[line.find(".extend(")+8:line.find(",")].replace(";", "").replace(".", "").replace("(", "").replace(")", "")

          lastengprotoobject = fname

          modifyObject(mode, fname, "type", "class")
          modifyObject(mode, oname, "type", "class")

          addData(mode, fname, "inherit", oname)


        elif settings.js_qooxdoo_addproperty.match(line, 0):
          #print "    - addproperty: %s" % line
          #sys.stdout.write(".")

          pstr = line[line.find("(")+1:line.find(")")]

          pdict = {};

          pdict["constructor"] = line[:line.find(".")]
          pdict["default"] = "";
          pdict["name"] = "";
          pdict["type"] = "Any"
          pdict["value"] = "";
          pdict["allowedValues"] = "";
          pdict["defaultValue"] = "";

          pcache = { "key" : "", "value" : "" };
          pstatus = "key"

          for pchar in pstr:
            if pchar == ":":
              pstatus = "value"

            elif pchar == "{" or pchar == "}":
              pass

            elif pstatus == "key" and pchar == "\"":
              pass

            elif pstatus == "key":
              pcache["key"] += pchar

            elif pstatus == "value" and pchar == ",":
              pdict[pcache["key"]] = pcache["value"]
              pcache["key"] = ""
              pcache["value"] = ""
              pstatus = "key"

            elif pstatus == "value" and pchar == "[":
              pcache["value"] += pchar
              pstatus = "complexvalue"

            elif pstatus == "value" and pchar == "]":
              pcache["value"] += pchar
              pstatus == "value"

            elif pstatus == "value" and pchar == "\"":
              pass

            elif pstatus == "value" or pstatus == "complexvalue":
              pcache["value"] += pchar



          pdict[pcache["key"]] = pcache["value"]

          # Post Processing
          pdict["constructor"] = pdict["constructor"].replace(".prototype", "");

          # Update Object Data
          modifyObject(mode, pdict["constructor"], "type", "class")
          addTree(mode, pdict["constructor"], "properties")

          #print
          #print "DICT: %s" % pdict
          #print

          # Add Property Data
          data[mode]["objects"][pdict["constructor"]]["properties"][pdict["name"]] = { "usagetype" : "public", "type" : pdict["type"], "filename" : filename, "default" : pdict["default"], "allowedValues" : pdict["allowedValues"], "defaultValue" : pdict["defaultValue"] }

          # Add Property Doc
          if s_docused != 1:
            doc = parseDocumentation(c_doc)
            s_docused = 1

            if doc["usagetype"] == "":
              doc["usagetype"] = "public"

            data[mode]["objects"][pdict["constructor"]]["properties"][pdict["name"]]["short"] = doc["short"]
            data[mode]["objects"][pdict["constructor"]]["properties"][pdict["name"]]["description"] = doc["description"]
            data[mode]["objects"][pdict["constructor"]]["properties"][pdict["name"]]["info"] = doc["info"]
            data[mode]["objects"][pdict["constructor"]]["properties"][pdict["name"]]["usagetype"] = doc["usagetype"]

            doc = ""

        elif settings.js_ecma_globalfunction.match(line, 0):
          #print "    - globalfunction: %s" % line
          #sys.stdout.write(".")

          fname = line[line.find(" ")+1:line.find("(")]
          fpara = line[line.find("(")+1:line.find(")")]

          if fpara == "": fpara = []
          else: fpara = fpara.split(",")

          addObject(mode, fname, filename, "globalfunction")

          if s_docused != 1:
            doc = parseDocumentation(c_doc)
          else:
            doc = {}

          if len(fpara) > 0:
            addTree(mode, fname, "parameters")

            i=0
            for param in fpara:
              data[mode]["objects"][fname]["parameters"][param] = { "position" : i }

              if len(doc) > 0:
                if doc["parameters"].has_key(param):
                  data[mode]["objects"][fname]["parameters"][param]["type"] = doc["parameters"][param]["type"]
                  data[mode]["objects"][fname]["parameters"][param]["info"] = doc["parameters"][param]["info"]
                  data[mode]["objects"][fname]["parameters"][param]["mandatory"] = doc["parameters"][param]["mandatory"]

              i+=1


          if s_docused != 1:
            s_docused = 1

            data[mode]["objects"][fname]["short"] = doc["short"]
            data[mode]["objects"][fname]["description"] = doc["description"]
            data[mode]["objects"][fname]["info"] = doc["info"]
            data[mode]["objects"][fname]["return"] = doc["return"]
            data[mode]["objects"][fname]["usagetype"] = doc["usagetype"]

            doc = {}


        elif settings.js_qooxdoo_prototypefunction.match(line, 0):
          #print "    - prototypefunction: %s" % line
          #sys.stdout.write(".")

          oname = lastengprotoobject
          fname = line[line.find("proto.")+6:line.find("=")]
          fpara = line[line.find("(")+1:line.find(")")]

          #print "Add function: " + fname + " to " + oname

          if s_docused != 1:
            doc = parseDocumentation(c_doc)
            s_docused = 1
          else:
            doc = {}

          addFunctions(mode, oname, fname, fpara, filename, doc)
          doc = {}

        elif settings.js_ecma_extendobject.match(line, 0):
          # print "     - extendobject: %s" % line

          oname = line[0:line.find(".")]
          fname = line[line.find(".")+1:line.find("=")]
          fpara = line[line.find("(")+1:line.find(")")]

          if s_docused != 1:
            doc = parseDocumentation(c_doc)
            s_docused = 1
          else:
            doc = {}

          addFunctions(mode, oname, fname, fpara, filename, doc)
          doc = {}


        elif settings.js_ecma_extendfunction.match(line, 0):
          # print "    - extendfunction: %s" % line

          oname = line[0:line.find(".")]
          fname = line[line.find(".")+1:line.find("=")]
          fpara = line[line.find("(")+1:line.find(")")]

          if s_docused != 1:
            doc = parseDocumentation(c_doc)
            s_docused = 1
          else:
            doc = {}

          addFunctions(mode, oname, fname, fpara, filename, doc)
          doc = {}

      elif mode == "css":
        #print "CSS: %s" % line

        # add line to compressed string
        s_out += line

        if s_opendef == 0 and line == "{":
          s_opendef = 1
          s_cache = []
          #print "  - open"

        elif s_opendef == 1 and line == "}":
          s_opendef = 0

          # add a space after each rule
          s_out += " "

          #print "  - close: %s\n" % s_pos
          s_pos += 1

          data["css"]["rules"].append({ "properties" : s_cache, "file" : filename })

          if s_docused != 1:
            doc = parseDocumentation(c_doc)
            s_docused = 1

            data["css"]["rules"][len(data["css"]["rules"])-1]["short"] = doc["short"]
            data["css"]["rules"][len(data["css"]["rules"])-1]["description"] = doc["description"]
            data["css"]["rules"][len(data["css"]["rules"])-1]["info"] = doc["info"]

            # Add group name
            if doc["info"].has_key("groupname"):
              if not data["css"]["groups"].has_key(doc["info"]["groupname"]):
                data["css"]["groups"][doc["info"]["groupname"]] = s_groupobj

            doc = ""


          data["css"]["rules"][len(data["css"]["rules"])-1]["objects"] = s_objectline

          s_cache = []


        elif s_opendef == 0 and settings.css_import.match(line, 0):
          # split import lines with a new line
          s_out += ";\n"


        elif s_opendef == 1 and settings.css_property.match(line, 0):
          #print "    - property"

          prop_key = line[0:line.find(":")]
          prop_value = line[line.find(":")+1:]

          prop_value_list = prop_value.split(" ")

          # split properties with a semikolon
          s_out += ";"


          for prop_value_part in prop_value_list:
            if settings.css_hexcolor.match(prop_value_part, 0):
              #print "HEXCOLOR: %s" % prop_value_part

              color_name = string.lower(prop_value_part.replace("#", ""))

              # fix short color names
              if len(color_name) == 3:
                color_name = color_name[0] * 2 + color_name[1] * 2 + color_name[2] * 2

              if not data["css"]["colors"].has_key(color_name):
                data["css"]["colors"][color_name] = {}
                data["css"]["colors"][color_name]["rules"] = []
                data["css"]["colors"][color_name]["group"] = "gray"

                r_color = settings.css_hexmap[color_name[0]] * 16 + settings.css_hexmap[color_name[1]]
                g_color = settings.css_hexmap[color_name[2]] * 16 + settings.css_hexmap[color_name[3]]
                b_color = settings.css_hexmap[color_name[4]] * 16 + settings.css_hexmap[color_name[5]]

                # brightness
                data["css"]["colors"][color_name]["brightness"] = (100 * (r_color + g_color + b_color) / 768)

                # rbg values
                data["css"]["colors"][color_name]["rgb"] = { "red" : r_color, "green" : g_color, "blue" : b_color }

                # try to detect color group
                if r_color == g_color == b_color:
                  data["css"]["colors"][color_name]["group"] = "solid"

                elif r_color > (g_color + 5) and r_color > (b_color + 5):
                  if r_color * 0.9 <= g_color:
                    data["css"]["colors"][color_name]["group"] = "brown"
                  else:
                    data["css"]["colors"][color_name]["group"] = "red"

                elif g_color > (r_color * 1.05) and g_color > (b_color * 1.05):
                  data["css"]["colors"][color_name]["group"] = "green"

                elif b_color > (r_color * 1.05) and b_color > (g_color * 1.05):
                  data["css"]["colors"][color_name]["group"] = "blue"

                elif r_color > (b_color + 15) and g_color > (b_color + 15):
                  data["css"]["colors"][color_name]["group"] = "yellow"


              if not s_pos in data["css"]["colors"][color_name]:
                data["css"]["colors"][color_name]["rules"].append(s_pos+1)


            elif settings.css_rgbcolor.match(prop_value_part, 0):
              print "RGBCOLOR: %s" % prop_value_part



          s_cache.append({ "key" : prop_key, "value" : prop_value })


        else:
          s_objectline = line.split(",")
          #s_groupobj = line[0]
          #s_groupobj = s_groupobj[0:s_groupobj.find(" ")]
          s_groupobj = line

          #print s_objectline

          for obj in s_objectline:
            # collect data
            all = []
            for subobj in obj.split(" "):
              all.append(getInfoCssObject(subobj))

            # add data to all cache
            for elem in all:
              addCssObjData(elem, "all", s_pos+1)

            # add target
            if len(all) > 1:
              addCssObjData(all[len(all)-1], "target", s_pos+1)
              addCssObjData(all[0], "parent", s_pos+1)






  # CLEAR UNUSED DOCUMENTATION

  if s_docused != 1 and len(c_doc) > 0:
    doc = parseDocumentation(c_doc)
    s_docused = 1

    print "----- Unused Documentation: -----------------------------"
    print "      ? Short:", doc["short"]
    print "      ? Description:", doc["description"]
    print "      ? Info:", doc["info"]

    if mode == "js":
      print "      ? Parameters:", doc["parameters"]
      print "      ? Return:", doc["return"]

    print "---------------------------------------------------------"

    doc = {}


  # WRITE COMPRESSED FILE

  data[mode]["files"][filename]["publicsize"] = len(s_out)

  compfile_f = open(outfile, "w")
  compfile_f.write(s_out)
  compfile_f.close()



def addCssObjData(obj, group, pos):
  if obj["tag"] != "":
    if not data["css"][group + "_tags"].has_key(obj["tag"]):
      data["css"][group + "_tags"][obj["tag"]] = []

    if not pos in data["css"][group + "_tags"][obj["tag"]]:
      data["css"][group + "_tags"][obj["tag"]].append(pos)


  if obj["id"] != "":
    if not data["css"][group + "_ids"].has_key(obj["id"]):
      data["css"][group + "_ids"][obj["id"]] = []

    if not pos in data["css"][group + "_ids"][obj["id"]]:
      data["css"][group + "_ids"][obj["id"]].append(pos)


  if obj["class"] != "":
    if not data["css"][group + "_classes"].has_key(obj["class"]):
      data["css"][group + "_classes"][obj["class"]] = []

    if not pos in data["css"][group + "_classes"][obj["class"]]:
      data["css"][group + "_classes"][obj["class"]].append(pos)



def getInfoCssObject(obj):
  i_type = "unknown"
  i_tag = ""
  i_id = ""
  i_class = ""
  i_attribute = {}

  # filter pseudo classes
  if obj.find(":") != -1:
    i_obj = obj[0:obj.find(":")]
  else:
    i_obj = obj


  # filter attributes
  if i_obj.find("[") != -1 and i_obj.find("]") != -1:
    i_attribute_full = i_obj[i_obj.find("[")+1:i_obj.find("]")]

    if i_attribute_full.find("=") == -1:
      i_attribute[i_attribute_full] = ""
    else:
      i_attribute[i_attribute_full[0:i_attribute_full.find("=")]] = i_attribute_full[i_attribute_full.find("=")+1:]

    i_obj = i_obj[0:i_obj.find("[")]


  if settings.css_tagidclass.match(i_obj, 0):
    #print "  - tagidclass %s" % i_obj
    i_type = "tagidclass"
    i_tag = i_obj[0:i_obj.find("#")]

    # temp
    i_id = i_obj[i_obj.find("#")+1:]

    i_class = i_id[i_id.find(".")+1:]
    i_id = i_id[0:i_id.find(".")]

  elif settings.css_tagid.match(i_obj, 0):
    #print "  - tagid %s" % i_obj
    i_type = "tagid"
    i_tag = i_obj[0:i_obj.find("#")]
    i_id = i_obj[i_obj.find("#")+1:]

  elif settings.css_tagclass.match(i_obj, 0):
    #print "  - tagclass %s" % i_obj
    i_type = "tagclass"
    i_tag = i_obj[0:i_obj.find(".")]
    i_class = i_obj[i_obj.find(".")+1:]

  elif settings.css_idclass.match(i_obj, 0):
    #print "  - idclass %s" % i_obj
    i_type = "idclass"
    i_id = i_obj[0:i_obj.find("#")]
    i_class = i_obj[i_obj.find("#")+1:]

  elif settings.css_id.match(i_obj, 0):
    #print "  - id %s" % obj
    i_type = "id"
    i_id = i_obj[1:]

  elif settings.css_class.match(i_obj, 0):
    #print "  - class %s" % obj
    i_type = "class"
    i_class = i_obj[1:]

  elif settings.css_tag.match(i_obj, 0):
    #print "  - tag %s" % obj
    i_type = "tag"
    i_tag = i_obj

  # pseudo class
  if obj.find(":") != -1:
    i_type += "_pseudo"

  return { "type" : i_type, "tag" : i_tag, "id" : i_id, "class" : i_class, "attribute" : i_attribute }



def parseDocumentation(cache):
  p_count = 0
  p_break = 1
  p_cache = ""

  info_r = re.compile("@[a-zA-Z]*: ")
  usage_r = re.compile("\#.*: ")

  c_short = ""
  c_description = []
  c_info = {}

  #c_usage = []


  c_parameters = {}
  c_return = ""
  c_usagetype = ""


  for line in cache:
    if info_r.match(line, 0):
      iname = line[1:line.find(":")]
      ivalue = line[line.find(":")+1:].lstrip()

      c_info[iname] = ivalue

    elif usage_r.match(line, 0):
      uname = line[1:line.find(":")]
      uprop = ""
      utype = ""
      umandatory = "true"

      if uname.find(" ") != -1:
        ubase = uname[:uname.find(" ")]
        uprop = uname[uname.find(" ")+1:]

        if uprop[-1] == "?":
          uprop = uprop[:-1]
          umandatory = "false"

        if uprop.find("[") != -1 and uprop.find("]") != -1:
          utype = uprop[uprop.find("[")+1:uprop.find("]")]
          uprop = uprop[:uprop.find("[")]

      else:
        ubase = uname

      uvalue = line[line.find(":")+1:].lstrip()

      if ubase == "return":
        c_return = uvalue

      elif ubase == "type":
        c_usagetype = uvalue

      elif ubase == "param":
        #c_parameters.append({ "name" : uprop, "type" : utype, "info" : uvalue })
        c_parameters[uprop] = { "type" : utype, "info" : uvalue, "mandatory" : umandatory }


    elif line == "" and p_count == 0:
      pass

    elif p_count == 0:
      c_short = line
      p_count = 1

    elif line == "" and p_count > 0:
      if p_break != 1:
        p_break = 1

        c_description.append(p_cache)
        p_cache = ""

    else:
      p_cache += " " + line

      p_break = 0
      p_count += 1


  # add missing text
  if p_cache != "":
    c_description.append(p_cache)


  return { "short": c_short, "description": c_description, "info": c_info, "usagetype": c_usagetype, "return": c_return, "parameters" : c_parameters }


def addRule(mode, rule):
  if not data[mode]["objects"].has_key("rules"):
    data[mode]["objects"]["rules"] = []

  data[mode]["objects"]["rules"].append(rule)

  return len(data[mode]["objects"]["rules"])



def addFunctions(mode, oname, fname, fpara, filename, doc = {}):
  if fpara == "": fpara = []
  else: fpara = fpara.split(",")

  addTree(mode, oname, "functions")

  data[mode]["objects"][oname]["functions"][fname] = { "filename" : filename }

  if len(fpara) > 0:
    data[mode]["objects"][oname]["functions"][fname]["parameters"] = {}

  i=0
  for param in fpara:
    data[mode]["objects"][oname]["functions"][fname]["parameters"][param] = { "position" : i }

    if len(doc) > 0:
      if doc["parameters"].has_key(param):
        data[mode]["objects"][oname]["functions"][fname]["parameters"][param]["type"] = doc["parameters"][param]["type"]
        data[mode]["objects"][oname]["functions"][fname]["parameters"][param]["info"] = doc["parameters"][param]["info"]
        data[mode]["objects"][oname]["functions"][fname]["parameters"][param]["mandatory"] = doc["parameters"][param]["mandatory"]

    i+=1


  if len(doc) > 0:
    data[mode]["objects"][oname]["functions"][fname]["short"] = doc["short"]
    data[mode]["objects"][oname]["functions"][fname]["description"] = doc["description"]
    data[mode]["objects"][oname]["functions"][fname]["info"] = doc["info"]
    data[mode]["objects"][oname]["functions"][fname]["return"] = doc["return"]

    if doc["usagetype"] != "":
      data[mode]["objects"][oname]["functions"][fname]["usagetype"] = doc["usagetype"]
    elif fname[:1] == "_":
      data[mode]["objects"][oname]["functions"][fname]["usagetype"] = "private"
    else:
      data[mode]["objects"][oname]["functions"][fname]["usagetype"] = "public"

  else:
    data[mode]["objects"][oname]["functions"][fname]["short"] = ""
    data[mode]["objects"][oname]["functions"][fname]["description"] = ""
    data[mode]["objects"][oname]["functions"][fname]["info"] = ""
    data[mode]["objects"][oname]["functions"][fname]["return"] = ""

    if fname[:1] == "_":
      data[mode]["objects"][oname]["functions"][fname]["usagetype"] = "private"
    else:
      data[mode]["objects"][oname]["functions"][fname]["usagetype"] = "public"


def addObject(mode, name, file="unknown", type="unknown"):
  if not data[mode]["objects"].has_key(name):
    data[mode]["objects"][name] = {}

  # Special Handling for internal builtin JavaScript-Objects
  if name == "Array" or name == "String" or name == "Object" or name == "Function" or name == "Math" or name == "Number" or name == "Boolean" or name == "Date" or name == "RegExp" or name == "document" or name == "window":
    data[mode]["objects"][name]["filename"] = "[system]"
    data[mode]["objects"][name]["type"] = "systemobject"

  else:
    if not data[mode]["objects"][name].has_key("filename") or data[mode]["objects"][name]["filename"] == "unknown":
      data[mode]["objects"][name]["filename"] = file

    if not data[mode]["objects"][name].has_key("type") or data[mode]["objects"][name]["type"] == "unknown":
      data[mode]["objects"][name]["type"] = type


def modifyObject(mode, name, key, value):
  if not data[mode]["objects"].has_key(name):
    addObject(mode, name)

  data[mode]["objects"][name][key] = value


def addTree(mode, name, tree):
  if not data[mode]["objects"].has_key(name):
    addObject(mode, name)

  if not data[mode]["objects"][name].has_key(tree):
    data[mode]["objects"][name][tree] = {}


def addData(mode, name, key, value):
  if not data[mode]["objects"].has_key(name):
    addObject(mode, name)

  data[mode]["objects"][name][key] = value


def addList(mode, name, tree):
  if not data[mode]["objects"].has_key(name):
    addObject(mode, name)

  if not data[mode]["objects"][name].has_key(tree):
    data[mode]["objects"][name][tree] = []


def basicLineCleanup(line):
  return line.replace("\t", "").replace("\n", "").replace("\r", "").lstrip().rstrip();


def cssLineCleanup(line):
  # cleanup '{', '}', '(', ')' ';'
  line = preg_replace("(\s+\{)", "{", line)
  line = preg_replace("(\s+\})", "}", line)
  line = preg_replace("(\s+\()", "(", line)
  line = preg_replace("(\s+\))", ")", line)
  line = preg_replace("(\{\s+)", "{", line)
  line = preg_replace("(\}\s+)", "}", line)
  line = preg_replace("(\;\s+)", ";", line)

  # shrink around ':'
  line = preg_replace("\s+:", ":", line)
  line = preg_replace(":\s+", ":", line)

  # shrink around ','
  line = preg_replace("\s+,", ",", line)
  line = preg_replace(",\s+", ",", line)

  # remove last ";"
  line = string.replace(line, ";", "")

  return line


def jsLineCleanup(line):
  # cleanup '{', '}', '(', ')' ';'
  line = preg_replace("(\s+\{)", "{", line)
  line = preg_replace("(\s+\})", "}", line)
  line = preg_replace("(\s+\()", "(", line)
  line = preg_replace("(\s+\))", ")", line)
  line = preg_replace("(\{\s+)", "{", line)
  line = preg_replace("(\}\s+)", "}", line)
  line = preg_replace("(\(\s+)", "(", line)
  line = preg_replace("(\)\s+)", ")", line)
  line = preg_replace("(\;\s+)", ";", line)
  line = preg_replace("(\;\s+[^a-zA-Z])", ";", line)

  # shrink around '=='
  line = preg_replace("\s+==", "==", line)
  line = preg_replace("==\s+", "==", line)

  # shrink around '!='
  line = preg_replace("\s+\!=", "!=", line)
  line = preg_replace("\!=\s+", "!=", line)

  # shrink around '='
  line = preg_replace("\s+=", "=", line)
  line = preg_replace("=\s+", "=", line)

  # shrink around ','
  line = preg_replace("\s+,", ",", line)
  line = preg_replace(",\s+", ",", line)

  # shrink around ':'
  line = preg_replace("\s+:", ":", line)
  line = preg_replace(":\s+", ":", line)

  # shrink around '?'
  line = preg_replace("\s+\?", "?", line)
  line = preg_replace("\?\s+", "?", line)

  # shrink around '+'
  line = preg_replace("\s+\+", "+", line)
  line = preg_replace("\+\s+", "+", line)

  # shrink around '-'
  line = preg_replace("\s+\-", "-", line)
  line = preg_replace("\-\s+", "-", line)

  # shrink around '*'
  line = preg_replace("\s+\*", "*", line)
  line = preg_replace("\*\s+", "*", line)

  # shrink around '/'
  line = preg_replace("\s+\/", "/", line)
  line = preg_replace("\/\s+", "/", line)

  # shrink around '<'
  line = preg_replace("\s+\<", "<", line)
  line = preg_replace("\<\s+", "<", line)

  # shrink around '>'
  line = preg_replace("\s+\>", ">", line)
  line = preg_replace("\>\s+", ">", line)

  # shrink around ']'
  line = preg_replace("\s+\]", "]", line)
  line = preg_replace("\]\s+", "]", line)

  # shrink around '['
  line = preg_replace("\s+\[", "[", line)
  line = preg_replace("\[\s+", "[", line)

  # shrink around '||'
  line = preg_replace("\s+\|\|", "||", line)
  line = preg_replace("\|\|\s+", "||", line)

  # shrink around '&&'
  line = preg_replace("\s+\&\&", "&&", line)
  line = preg_replace("\&\&\s+", "&&", line)

  # strip extra white space
  line = preg_replace("\s+", " ", line)



  line = preg_replace(";path=", "; path=", line);

  return line



def startXML(level, name, close = False, line = True, attr = {}):
  str = "  " * level
  str += "<%s" % name

  if len(attr) != 0:
    for elem in attr.keys():
      str += " %s=\"%s\"" % (elem, attr[elem])

  if close:
    str += "/"

  str += ">"

  if line:
    str += "\n"

  return str


def stopXML(level, name, dbreak = True):
  str = "  " * level
  str += "</%s>\n" % name

  if dbreak:
    str += "\n"

  return str



def cssGenerateXML(data):
  #sys.stdout.write(".")

  str = "<?xml version=\"1.0\" encoding=\"iso-8859-1\"?>\n"
  level = 0

  str += startXML(level, "data")

  level += 1

  if data.has_key("colors"):
    level += 1
    str += startXML(level, "colors")

    for color in data["colors"].keys():
      level += 1
      str += startXML(level, "color", False, False, { "value" : color, "group" : data["colors"][color]["group"], "brightness" : data["colors"][color]["brightness"] })

      level += 1

      # add rgb
      str += startXML(level, "rgb", True, True, { "red" : data["colors"][color]["rgb"]["red"], "green" : data["colors"][color]["rgb"]["green"], "blue" : data["colors"][color]["rgb"]["blue"] })

      # add rules list
      str += startXML(level, "rules")

      for rule in data["colors"][color]["rules"]:
        str += startXML(level+1, "rule", True, True, { "id" : rule })

      str += stopXML(level, "rules")

      level -= 1

      str += stopXML(level, "color")
      level -= 1

    str += stopXML(level, "colors")
    level -= 1




  if data.has_key("files"):
    level += 1
    str += startXML(level, "files")

    for file in data["files"]:
      level += 1
      str += startXML(level, "file", True, True, { "name" : file })
      level -= 1

    str += stopXML(level, "files")
    level -= 1

  #sys.stdout.write(".")

  if data.has_key("groups"):
    level += 1
    str += startXML(level, "groups")

    for group in data["groups"].keys():
      level += 1
      str += startXML(level, "group", True, True, { "name" : group, "match" : data["groups"][group] })
      level -= 1

    str += stopXML(level, "groups")
    level -= 1

  #sys.stdout.write(".")

  if data.has_key("rules"):
    level += 1
    str += startXML(level, "rules")

    for rule in data["rules"]:
      level += 1
      str += startXML(level, "rule", False, False, { "id" : rule["id"], "wellid" : rule["wellid"], "wellprevid" : rule["wellprevid"], "wellnextid" : rule["wellnextid"] })

      #sys.stdout.write(".")

      if rule.has_key("objects"):
        level += 1
        str += startXML(level, "objects")

        for obj in rule["objects"]:
          level += 1
          str += startXML(level, "object", False, False)
          str += "%s" % obj
          str += stopXML(0, "object")
          level -= 1

        str += stopXML(level, "objects")
        level -= 1


      if rule.has_key("properties"):
        level += 1
        str += startXML(level, "properties")

        for prop in rule["properties"]:
          level += 1
          str += startXML(level, "property", False, False, { "name" : prop["key"] })
          str += "%s" % prop["value"]
          str += stopXML(0, "property")
          level -= 1

        str += stopXML(level, "properties")
        level -= 1


        # File Name
        if rule.has_key("file") and rule["file"] != "":
          level += 1
          str += startXML(level, "file", False, False)
          str += "%s" % rule["file"]
          str += stopXML(0, "file")
          level -= 1


        # Short Info
        if rule.has_key("short") and rule["short"] != "":
          level += 1
          str += startXML(level, "short", False, False)
          str += "%s" % rule["short"]
          str += stopXML(0, "short")
          level -= 1


        # Description
        if rule.has_key("description") and len(rule["description"]) > 0:
          level += 1
          str += startXML(level, "description")

          level += 1

          for part in rule["description"]:
            str += startXML(level, "p", False, False)
            str += "%s" % part
            str += stopXML(0, "p", False)

          level -= 1

          str += stopXML(level, "description")
          level -= 1

        # Info (Author, Version, Date, ...)
        if rule.has_key("info") and len(rule["info"]) > 0:
          level += 1
          str += startXML(level, "info")

          level += 1

          for part in rule["info"].keys():
            str += startXML(level, part, False, False)
            str += "%s" % rule["info"][part]
            str += stopXML(0, part, False)

          level -= 1

          str += stopXML(level, "info")
          level -= 1



      str += stopXML(level, "rule")
      level -= 1

    str += stopXML(level, "rules")
    level -= 1



  ## ALL

  for holder in [ "all" , "target", "parent" ]:
    #sys.stdout.write(".")

    level += 1
    str += startXML(level, holder)

    all_groups = { "tags" : "tag", "classes" : "class", "ids" : "id" }
    for group in all_groups.keys():
      level += 1
      str += startXML(level, group)

      #print "CURRENT: " + holder + "_" + group
      #print data[holder + "_" + group]

      for elem in data[holder + "_" + group].keys():
        level += 1
        str += startXML(level, all_groups[group], False, False, { "name" : elem })

        for ref in data[holder + "_" + group][elem]:
          str += startXML(level, "rule", False, False)
          str += "%s" % ref
          str += stopXML(0, "rule", False)

        str += stopXML(level, all_groups[group])
        level -= 1

      str += stopXML(level, group)
      level -= 1

    str += stopXML(level, holder)
    level -= 1


  #print data["all_tags"]




  level -= 1

  str += stopXML(level, "data")

  return str



def jsGenerateXML(data):
  str = "<?xml version=\"1.0\" encoding=\"iso-8859-1\"?>\n"
  level = 0

  str += startXML(level, "data")

  level += 1

  if data.has_key("files"):
    level += 1
    str += startXML(level, "files")

    for file in data["files"].keys():
      level += 1
      str += startXML(level, "file", True, True, { "name" : file, "sourcesize" : data["files"][file]["sourcesize"], "publicsize" : data["files"][file]["publicsize"]})
      level -= 1

    str += stopXML(level, "files")
    level -= 1


  for oname in data["objects"].keys():
    str += startXML(level, data["objects"][oname]["type"], False, True, { "name" : oname })

    # Add Filename
    if data["objects"][oname].has_key("filename"):
      level += 1
      str += startXML(level, "filename", False, False)
      str += "%s" % data["objects"][oname]["filename"]
      str += stopXML(0, "filename")
      level -= 1

    # Add Inherit
    if data["objects"][oname].has_key("inherit"):
      level += 1
      str += startXML(level, "inherit", False, False)
      str += "%s" % data["objects"][oname]["inherit"]
      str += stopXML(0, "inherit")
      level -= 1


    # Add Properties
    if data["objects"][oname].has_key("properties"):
      level += 1
      str += startXML(level, "properties")

      for name in data["objects"][oname]["properties"].keys():
        str += startXML(level+1, "property", False, True, { "name" : name, "type" : data["objects"][oname]["properties"][name]["type"], "default" : data["objects"][oname]["properties"][name]["default"], "filename" : data["objects"][oname]["properties"][name]["filename"] })




        # Property -> Short Info
        if data["objects"][oname]["properties"][name].has_key("short") and data["objects"][oname]["properties"][name]["short"] != "":
          level += 1
          str += startXML(level, "short", False, False)
          str += "%s" % data["objects"][oname]["properties"][name]["short"]
          str += stopXML(0, "short")
          level -= 1

        # Property -> Description
        if data["objects"][oname]["properties"][name].has_key("description") and len(data["objects"][oname]["properties"][name]["description"]) > 0:
          level += 1
          str += startXML(level, "description")

          level += 1

          for part in data["objects"][oname]["properties"][name]["description"]:
            str += startXML(level, "p", False, False)
            str += "%s" % part
            str += stopXML(0, "p", False)

          level -= 1

          str += stopXML(level, "description")
          level -= 1

        # Property -> Info (Author, Version, Date, ...)
        if data["objects"][oname]["properties"][name].has_key("info") and len(data["objects"][oname]["properties"][name]["info"]) > 0:
          level += 1
          str += startXML(level, "info")

          level += 1

          for part in data["objects"][oname]["properties"][name]["info"].keys():
            str += startXML(level, part, False, False)
            str += "%s" % data["objects"][oname]["properties"][name]["info"][part]
            str += stopXML(0, part, False)

          level -= 1

          str += stopXML(level, "info")
          level -= 1

        str += stopXML(level, "property")
        level -= 1

      str += stopXML(level, "properties")
      level -= 1


    # Add Parameters
    if data["objects"][oname].has_key("parameters"):
      level += 1
      str += startXML(level, "parameters")

      for name in data["objects"][oname]["parameters"].keys():
        tmpdict = { "name" : name, "position" : data["objects"][oname]["parameters"][name]["position"] }

        if data["objects"][oname]["parameters"][name].has_key("type"):
          tmpdict["type"] = data["objects"][oname]["parameters"][name]["type"]

        if data["objects"][oname]["parameters"][name].has_key("info"):
          tmpdict["info"] = data["objects"][oname]["parameters"][name]["info"]

        if data["objects"][oname]["parameters"][name].has_key("mandatory"):
          tmpdict["mandatory"] = data["objects"][oname]["parameters"][name]["mandatory"]

        str += startXML(level+1, "parameter", True, True, tmpdict)


      str += stopXML(level, "parameters")
      level -= 1


    # Add Return Value
    if data["objects"][oname].has_key("return") and data["objects"][oname]["return"] != "":
      level += 1
      str += startXML(level, "return", False, False)
      str += "%s" % data["objects"][oname]["return"]
      str += stopXML(0, "return")
      level -= 1


    # Add Usage-Type
    if data["objects"][oname].has_key("usagetype") and data["objects"][oname]["usagetype"] != "":
      level += 1
      str += startXML(level, "usagetype", False, False)
      str += "%s" % data["objects"][oname]["usagetype"]
      str += stopXML(0, "usagetype")
      level -= 1


    # Add Functions
    if data["objects"][oname].has_key("functions"):
      level += 1
      str += startXML(level, "functions")

      for fname in data["objects"][oname]["functions"].keys():
        level += 1
        str += startXML(level, "function", False, True, { "name" : fname, "filename" : data["objects"][oname]["functions"][fname]["filename"] })

        # Function -> Short Info
        if data["objects"][oname]["functions"][fname].has_key("short") and data["objects"][oname]["functions"][fname]["short"] != "":
          level += 1
          str += startXML(level, "short", False, False)
          str += "%s" % data["objects"][oname]["functions"][fname]["short"]
          str += stopXML(0, "short")
          level -= 1

        # Function -> Return Value
        if data["objects"][oname]["functions"][fname].has_key("return") and data["objects"][oname]["functions"][fname]["return"] != "":
          level += 1
          str += startXML(level, "return", False, False)
          str += "%s" % data["objects"][oname]["functions"][fname]["return"]
          str += stopXML(0, "return")
          level -= 1

        # Function -> UsageType
        if data["objects"][oname]["functions"][fname].has_key("usagetype") and data["objects"][oname]["functions"][fname]["usagetype"] != "":
          level += 1
          str += startXML(level, "usagetype", False, False)
          str += "%s" % data["objects"][oname]["functions"][fname]["usagetype"]
          str += stopXML(0, "usagetype")
          level -= 1

        # Function -> Description
        if data["objects"][oname]["functions"][fname].has_key("description") and len(data["objects"][oname]["functions"][fname]["description"]) > 0:
          level += 1
          str += startXML(level, "description")

          level += 1

          for part in data["objects"][oname]["functions"][fname]["description"]:
            str += startXML(level, "p", False, False)
            str += "%s" % part
            str += stopXML(0, "p", False)

          level -= 1

          str += stopXML(level, "description")
          level -= 1

        # Function -> Info (Author, Version, Date, ...)
        if data["objects"][oname]["functions"][fname].has_key("info") and len(data["objects"][oname]["functions"][fname]["info"]) > 0:
          level += 1
          str += startXML(level, "info")

          level += 1

          for part in data["objects"][oname]["functions"][fname]["info"].keys():
            str += startXML(level, part, False, False)
            str += "%s" % data["objects"][oname]["functions"][fname]["info"][part]
            str += stopXML(0, part, False)

          level -= 1

          str += stopXML(level, "info")
          level -= 1


        # Function -> Parameters
        if data["objects"][oname]["functions"][fname].has_key("parameters"):
          level += 1
          str += startXML(level, "parameters")

          for pname in data["objects"][oname]["functions"][fname]["parameters"].keys():
            tmpdict = { "name" : pname, "position" : data["objects"][oname]["functions"][fname]["parameters"][pname]["position"] }

            if data["objects"][oname]["functions"][fname]["parameters"][pname].has_key("type"):
              tmpdict["type"] = data["objects"][oname]["functions"][fname]["parameters"][pname]["type"]

            if data["objects"][oname]["functions"][fname]["parameters"][pname].has_key("info"):
              tmpdict["info"] = data["objects"][oname]["functions"][fname]["parameters"][pname]["info"]

            if data["objects"][oname]["functions"][fname]["parameters"][pname].has_key("mandatory"):
              tmpdict["mandatory"] = data["objects"][oname]["functions"][fname]["parameters"][pname]["mandatory"]

            str += startXML(level+1, "parameter", True, True, tmpdict)

          str += stopXML(level, "parameters")
          level -= 1

        str += stopXML(level, "function")
        level -= 1

      str += stopXML(level, "functions")
      level -= 1


    # Add Intro
    if data["objects"][oname].has_key("short"):
      level += 1
      str += startXML(level, "short")
      str += "%s" % data["objects"][oname]["short"]
      str += stopXML(0, "short")
      level -= 1


    # Add Description
    if data["objects"][oname].has_key("description") and len(data["objects"][oname]["description"]) > 0:
      level += 1
      str += startXML(level, "description")

      level += 1

      for part in data["objects"][oname]["description"]:
        str += startXML(level, "p", False, False)
        str += "%s" % part
        str += stopXML(0, "p", False)

      level -= 1

      str += stopXML(level, "description")
      level -= 1


    # Add Info
    if data["objects"][oname].has_key("info") and len(data["objects"][oname]["info"]) > 0:
      level += 1
      str += startXML(level, "info")

      level += 1

      for part in data["objects"][oname]["info"].keys():
        str += startXML(level, part, False, False)
        str += "%s" % data["objects"][oname]["info"][part]
        str += stopXML(0, part, False)

      level -= 1

      str += stopXML(level, "info")
      level -= 1




    str += stopXML(level, data["objects"][oname]["type"])

  level -= 1

  str += stopXML(level, "data")

  return str


def createHTML(mode, params, output, title, targetxml):
  if params.has_key("subid") and params.has_key("id"):
    sys.stdout.write(">>> Creating %s #%s.%s [%s]..." % (params["job"], params["id"], params["subid"], mode))
  elif params.has_key("id"):
    sys.stdout.write(">>> Creating %s #%s [%s]..." % (params["job"], params["id"], mode))
  else:
    sys.stdout.write(">>> Creating %s [%s]..." % (params["job"], mode))

  # I think to much structure
  # os.sep + mode
  outfile = os.getcwd() + os.sep + settings.docpath + os.sep + output + ".html"
  outdir = outfile[0:outfile.rfind("/")]

  #print ">> Output to: %s" % outfile

  mkdir(outdir)

  pathrel = "./"
  while output.find("/") != -1:
    output = output[output.find("/")+1:]
    pathrel += "../"

  # xsl processor
  c = settings.xsl + " "

  # output
  c += "-o " + outfile + " "

  # mode
  c += "--stringparam mode %s " % mode

  # prefix
  c += "--stringparam prefix %s " % settings.outputprefix

  # title
  c += "--stringparam title \"%s\" " % title

  # deepness
  c += "--stringparam pathrel %s " % pathrel

  # params
  for p in params.keys():
    if params[p] == "" or params[p] == " ":
      c += "--stringparam %s %s " % (p, "''")
    else:
      c += "--stringparam %s %s " % (p, params[p])


  # stylesheet
  #c += settings.outdoc + os.sep + settings.source + os.sep + "xsl" + os.sep + "metatags.xsl "
  c += settings.relpath + "/compile.xsl "

  # xml
  c += targetxml + " "

  # Execute Transformation
  r = os.system(c)

  if r == 0:
    sys.stdout.write(" -> ok\n")
  else:
    print "command: " + c
    print "title: " + title
    print "outfile: " + outfile
    print "targetxml: " + targetxml
    sys.stdout.write(" -> error\n")

  return r
  # return 0


def getWellId(i):
  s = i

  if i < 10:
    s = "00%s" % i
  elif i < 100:
    s = "0%s" % i

  return s


def main():
  print ">>> Analysing Parameters..."

  cmd = ""
  oldroot = ""

  settings.relpath = sys.argv[0][0:sys.argv[0].rfind("/")]

  for arg in sys.argv[1:]:
    if arg[0:2] == "--":
      if arg[2:] == "sourcepath":
        cmd = "sourcepath"
      elif arg[2:] == "buildpath":
        cmd = "buildpath"
      elif arg[2:] == "cachepath":
        cmd = "cachepath"
      elif arg[2:] == "prefix":
        cmd = "prefix"
      elif arg[2:] == "docpath":
        cmd = "docpath"
      elif arg[2:] == "job":
        cmd = "job"

    else:
      if cmd == "sourcepath":
        settings.searchpath = arg
      elif cmd == "buildpath":
        settings.buildpath = arg
      elif cmd == "cachepath":
        settings.cachepath = arg
      elif cmd == "prefix":
        settings.outputprefix = arg
      elif cmd == "docpath":
        settings.docpath = arg
      elif cmd == "job":
        settings.job = arg



  print "-----------------------------------------"
  print "  - Job: %s" % settings.job
  print "  - Source Path: %s" % settings.searchpath
  print "  - Build Path: %s" % settings.buildpath
  print "  - Output Prefix: %s" % settings.outputprefix
  print "  - Documentation Path: %s" % settings.docpath
  print "-----------------------------------------"

  rkey = random.random()

  for root, dirs, files in os.walk(settings.searchpath):
    if root.split("/")[-1] == "CVS": continue

    for file in files:
      mode = "none"

      # add more if needed
      if file[-3:] == ".js":
        mode = "js"

      if file[-4:] == ".css":
        mode = "css"

      if mode == "none":
        continue

      if oldroot != root:
        print ">>> Current Source: %s" % root
        oldroot = root

      print "  - File: %s [%s]" % (file, mode)

      infile = root + os.sep + file
      #cachefile = root + os.sep + ".cache_" + file.replace("." + mode + ".in", "")
      #outfile = root + os.sep + file.replace(mode + ".in", mode)


      dirout = string.join(root.split("/")[2:], "/")

      if dirout != "":
        dirout = dirout + "/"

      mkdir(os.getcwd() + os.sep + settings.cachepath + os.sep + dirout)
      mkdir(os.getcwd() + os.sep + settings.buildpath + os.sep + dirout)

      cachefile = settings.cachepath + os.sep + dirout + file
      outfile = settings.buildpath + os.sep + dirout + file

      # print "Dirout: " + dirout

      #filename = infile.replace(settings.searchpath, "")
      filename = infile[len(settings.searchpath):].replace("." + mode + ".in", "")

      parseDocument(infile, cachefile, outfile, filename, mode)


  if settings.job == "all" or settings.job == "doc":
    for mode in data.keys():
      print ">>> Writing XML-Data [%s->%s]..." % (settings.outputprefix, mode)

      #targetdir = "/tmp/doc_%s/xml" % (rkey*100)
      targetdir = os.getcwd() + "/" + settings.docpath
      targetxml = "%s/%s-%s.xml" % (targetdir, settings.outputprefix, mode)

      # Create target directory
      mkdir(targetdir)

      # Write XML-Data
      xmlout_f = open(targetxml, "w")

      if mode == "js":
        xmlout_f.write(jsGenerateXML(data[mode]))
      elif mode == "css":
        # fix rule ids
        i=0
        for rule in data[mode]["rules"]:
          i += 1

          rule["id"] = i
          rule["wellid"] = getWellId(i)
          rule["wellnextid"] = getWellId(i+1)
          rule["wellprevid"] = getWellId(i-1)

        xmlout_f.write(cssGenerateXML(data[mode]))

      xmlout_f.close()


      # Execute Transformation

      if mode == "css":
        css_createPages(mode, targetxml)
      elif mode == "js":
        js_createPages(mode, targetxml)




  print "-----------------------------------------"
  print "  - Done"
  print "-----------------------------------------"

def mkdir(dir):
  sdir = dir.split("/")
  i = 0
  tdir = ""

  while i < len(sdir):
    tdir += os.sep + sdir[i]
    tdir = tdir.replace(os.sep + os.sep, os.sep)

    try:
      os.listdir(tdir)
    except:
      os.mkdir(tdir)

    i += 1


def js_createPages(mode, targetxml):

  # create page overview
  r = createHTML(mode, { "job" : "overview" }, "index", "Overview", targetxml)
  if r != 0: return False

  # create file overview
  r = createHTML(mode, { "job" : "filelist" }, "filelist", "File-List", targetxml)
  if r != 0: return False

  # create object overview
  r = createHTML(mode, { "job" : "objectoverview" }, "objectoverview", "Object-Overview", targetxml)
  if r != 0: return False

  # create class overview
  r = createHTML(mode, { "job" : "classoverview" }, "classoverview", "Class-Overview", targetxml)
  if r != 0: return False

  # create class tree
  r = createHTML(mode, { "job" : "classtree" }, "classtree", "Class-Tree", targetxml)
  if r != 0: return False

  # create system-object overview
  r = createHTML(mode, { "job" : "systemobjectoverview" }, "systemobjectoverview", "System-Object-Overview", targetxml)
  if r != 0: return False

  # create globalfunction overview
  r = createHTML(mode, { "job" : "globalfunctionoverview" }, "globalfunctionoverview", "Global-Function-Overview", targetxml)
  if r != 0: return False


  # create file pages
  i=0
  for file in data[mode]["files"]:
    i += 1
    r = createHTML(mode, { "job" : "filedescription", "id" : i, "name" : file }, "files" + os.sep + "file_%s" % file.replace("/", "-") , "File-Description", targetxml)
    if r != 0: return False


  # create propertylist pages
  i=0
  for name in data[mode]["objects"].keys():
    if data[mode]["objects"][name]["type"] == "propertylist":
      i += 1
      r = createHTML(mode, { "job" : "objectdescription", "id" : i }, "objects" + os.sep + "object_%s" % name , "Object-Description", targetxml)
      if r != 0: return False

      if data[mode]["objects"][name].has_key("functions"):
        j=0;
        for subname in data[mode]["objects"][name]["functions"]:
          rs = createHTML(mode, { "job" : "objectfunction", "id" : i, "subid" : j, "subname" : subname }, "objects" + os.sep + "object_%s" % name + os.sep + "functions" + os.sep + "function_%s" % subname, "Function of an Object", targetxml)
          if rs != 0: return False
          j += 1




  # create class pages
  i=0
  for name in data[mode]["objects"].keys():
    if data[mode]["objects"][name]["type"] == "class":
      i += 1
      r = createHTML(mode, { "job" : "classdescription", "id" : i }, "classes" + os.sep + "class_%s" % name , "Class-Description", targetxml)
      if r != 0: return False

      if data[mode]["objects"][name].has_key("functions"):
        j=0;
        if data[mode]["objects"][name].has_key("functions"):
          for subname in data[mode]["objects"][name]["functions"]:
            rs = createHTML(mode, { "job" : "classfunction", "id" : i, "subid" : j, "subname" : subname }, "classes" + os.sep + "class_%s" % name + os.sep + "functions" + os.sep + "function_%s" % subname, "Function of a Class", targetxml)
            if rs != 0: return False
            j += 1

        j=0;
        if data[mode]["objects"][name].has_key("properties"):
          for subname in data[mode]["objects"][name]["properties"]:
            rs = createHTML(mode, { "job" : "classproperty", "id" : i, "subid" : j, "subname" : subname }, "classes" + os.sep + "class_%s" % name + os.sep + "properties" + os.sep + "property_%s" % subname, "Property of a Class", targetxml)
            if rs != 0: return False
            j += 1



  # create function pages
  i=0
  for name in data[mode]["objects"].keys():
    if data[mode]["objects"][name]["type"] == "globalfunction":
      i += 1
      r = createHTML(mode, { "job" : "globalfunctiondescription", "id" : i }, "globalfunctions" + os.sep + "globalfunction_%s" % name , "Global-Function-Description", targetxml)
      if r != 0: return False


  # create systemobject pages
  i=0
  for name in data[mode]["objects"].keys():
    if data[mode]["objects"][name]["type"] == "systemobject":
      i += 1
      r = createHTML(mode, { "job" : "systemobjectdescription", "id" : i }, "systemobjects" + os.sep + "systemobject_%s" % name , "System-Object", targetxml)
      if r != 0: return False

      j=0;
      for subname in data[mode]["objects"][name]["functions"]:
        rs = createHTML(mode, { "job" : "systemobjectfunction", "id" : i, "subid" : j, "subname" : subname }, "systemobjects" + os.sep + "systemobject_%s" % name + os.sep + "functions" + os.sep + "function_%s" % subname, "Function of a System-Object", targetxml)
        if rs != 0: return False
        j += 1


def css_createPages(mode, targetxml):
  # create page overview
  r = createHTML(mode, { "job" : "overview" }, "overview", "Overview", targetxml)
  if r != 0: return False

  # create rule overview
  r = createHTML(mode, { "job" : "rulelist" }, "rulelist", "Rule-List", targetxml)
  if r != 0: return False

  # create file overview
  r = createHTML(mode, { "job" : "filelist" }, "filelist", "File-List", targetxml)
  if r != 0: return False

  # create preview overview
  r = createHTML(mode, { "job" : "preview" }, "preview", "Preview", targetxml)
  if r != 0: return False

  # create color overview
  r = createHTML(mode, { "job" : "colorlist" }, "colorlist", "Color-List", targetxml)
  if r != 0: return False

  # create property overview
  r = createHTML(mode, { "job" : "propertylist" }, "propertylist", "Property-List", targetxml)
  if r != 0: return False

  # create property overview
  r = createHTML(mode, { "job" : "grouplist" }, "grouplist", "Group-List", targetxml)
  if r != 0: return False

  # create lists
  for holder in [ "all", "target", "parent" ]:
    for group in [ "tag", "id", "class" ]:
      r = createHTML(mode, { "job" : "usagelist", "holder" : holder, "group" : group }, holder + "_" + group + "list", "List", targetxml)
      if r != 0: return False

  # create file pages
  i=0
  for file in data[mode]["files"]:
    i += 1
    r = createHTML(mode, { "job" : "filedescription", "id" : i }, "files" + os.sep + "file_%s" % file.replace("/", "-") , "File-Description", targetxml)
    if r != 0: return False

  # create group pages
  i=0
  for group in data[mode]["groups"].keys():
    i += 1
    r = createHTML(mode, { "job" : "groupdescription", "id" : i, "name" : group, "match" : data[mode]["groups"][group] }, "groups" + os.sep + "group_%s" % group , "Group-Description", targetxml)
    if r != 0: return False


  # create rule pages
  i=0
  for rule in data[mode]["rules"]:
    i += 1
    r = createHTML(mode, { "job" : "ruledescription", "id" : i }, "rules" + os.sep + "rule_%s" % getWellId(i) , "Rule-Description", targetxml)
    if r != 0: return False




main()
