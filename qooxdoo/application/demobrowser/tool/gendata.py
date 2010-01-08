#!/usr/bin/env python
# -*- coding: utf-8 -*-

##
# gendata.py -- go through all the demos (i.e. their HTML files) and generate an 
#               index file, to be used in Demobrowser's tree navigation pane.
#
# usage: gendata.py <dest> <source>
#
#   <dest>    output file
#   <source>  root directory for the scan
##

import sys, os, optparse, codecs, re
import shutil

basic      = u"""[%s]"""
fJSON      = "./config.demo.json"
demoDataFn = "demodata.js"

def fileCheck(fname):
    fileH = open(fname,"rU")
    selected = False
    for line in fileH:
        #if re.search(r'demobrowser\.demo',line):
        if re.search(r'src="\.\./helper.js"',line):
            selected = True
            break
    fileH.close()

    return selected


# get the tags from the javascript source file
def getTagsFromJsFile(fname):
    fileH = open(fname,"rU")

    tags = set([]) 
    for line in fileH:
        # tags
        reg = re.compile('\@tag\s(.*)');
        match = reg.search(line);
        if match:
          if match.group(1):
            tags.add(match.group(1));
        # qx. usage
        reg = re.compile('(qx\.[^(;\s]*)\(');
        match = reg.search(line);
        if match:
          if match.group(1):
            tags.add(match.group(1));
    fileH.close()

    return tags    


def createDemoJson():
    c = {}
    if len(sys.argv)>1:
        c['js_target'] = sys.argv[1]

    source = ""
    build  = ""
    scategories = {}
    bcategories = {}

    JSON = open(fJSON,"w")
    JSON.write('// This file is dynamically created by the generator!\n')
    JSON.write('{\n')
    # check top-level includes
    jsontmplf = os.path.join('tool','tl-tmpl.json')
    if os.path.exists(jsontmplf):
        json_tmpl = open(jsontmplf,"rU").read()
        JSON.write(json_tmpl)
    JSON.write('  "jobs":\n')
    JSON.write('  {\n')
    # the next two are hooks for additional settings for source and build runs of demos
    JSON.write('    "__all-source__" : {},\n')
    JSON.write('    "__all-build__"  : {},\n')

    jsontmplf = open(os.path.join('tool','tmpl.json'),"rU")
    json_tmpl = jsontmplf.read()

    #for html in htmlfiles(os.path.join('source','demo')):
    while True:
        html = (yield)
        #print html
        if html == None:  # terminate the generator part and go to finalizing json file
            break

        category, name = demoCategoryFromFile(html)

        #print ">>> Processing: %s.%s..." % (category, name)

        # build classname
        clazz  = "demobrowser.demo.%s.%s" % (category,name)
        simple = "%s.%s" % (category,name)
        source = source + ' "source-%s",' % simple
        build  = build + ' "build-%s",' % simple
        if not category in scategories:
            scategories[category] = ""
        scategories[category] += ' "source-%s",' % (simple,)
        if not category in bcategories:
            bcategories[category] = ""
        bcategories[category] += ' "build-%s",' % (simple,)

        #TODO: call copyJsFiles() somewhere

        # concat all
        currcont = json_tmpl.replace('XXX',"%s.%s"%(category,name)).replace("YYY",clazz)
        JSON.write("%s," % currcont[:-1])
        JSON.write("\n\n\n")

    for category in scategories:
        JSON.write("""  "source-%s" : {
            "run" : [
            %s]
          },\n\n""" % (category, scategories[category][:-1]))
        JSON.write("""  "build-%s" : {
            "run" : [
            %s]
          },\n\n""" % (category, bcategories[category][:-1]))

    JSON.write("""  "source" : {
        "run" : [
         %s]
      },\n\n""" % source[:-1] ) 

    JSON.write("""  "build" : {
        "run" : [
         %s]
      }\n  }\n}""" % build[:-1] ) 

    JSON.close()

    yield  # final yield to provide for .send(None) of caller


def demoCategoryFromFile(file):
    # return demo category, name from demo's html file path
    # mirror line file "./source/demo/animation/Login.html"
    parts = file.split(os.sep)
    return parts[3], parts[4].split(".")[0]


def copyJsFiles(destdir):
    # copy js source file to script dir
    try:
        os.makedirs(destdir)
    except OSError:
        pass
    while True:
        file = (yield)
        if file == None: break
        clazz = "demobrowser.demo.%s.%s" % demoCategoryFromFile(file)
        shutil.copyfile('source/class/%s.js' % clazz.replace('.','/'), "%s/%s.src.js" % (destdir,clazz))
    yield  # to catch caller's .send(None)



def main(dest, scan):
    dist = os.path.join(dest, demoDataFn)
    res = ""
    structurize = False

    configCreator = createDemoJson() # generator to push file names into, so they get into config.demo.json
    configCreator.send(None)         # init it
    jsFileCopier  = copyJsFiles(dest)
    jsFileCopier.send(None)

    firstCategory = True
    for category in os.listdir(scan):
        if category in [".svn", ".DS_Store"]:
          continue

        ext = os.path.splitext(category)[1]
        if ext == ".html" or ext == ".js":
          continue

        if not firstCategory:
          res += "},"

        res += "{"
        res += "\"classname\":\""+category+"\",\"tests\":[\n"

        firstItem = True
        lastbasename = None

        for item in os.listdir(os.path.join(scan, category)):
            if item == ".svn":
              continue

            if os.path.splitext(item)[1] != ".html":
              continue

            htmlfile = os.path.join(scan, category, item)
            if not fileCheck(htmlfile):
              print "  - Skipping HTML file: %s" % (htmlfile,)
              continue

            configCreator.send(htmlfile) # process this file name for config.demo.json
            jsFileCopier.send(htmlfile)  # copy demo source file to script dir

            # get the tags
            jsitem = item[0:item.find("html")] + "js"
            jsfile = os.path.join(scan, "..", "class", "demobrowser", "demo", category, jsitem)
            tags = getTagsFromJsFile(jsfile);

            title = item[:item.find(".")]

            if "_" in title:
              nr = title[title.find("_")+1:]
              basename = title[:title.find("_")]
            else:
              nr = 0
              basename = title

            title = title.replace("_", " ")

            if structurize:
              if lastbasename != basename:
                firstItem = True

                if lastbasename != None:
                  res += "\n]},\n"

                res += "{"
                res += "\"classname\":\""+basename+"\",\"desc\":\"Folder %s\",\"tests\":[\n" % basename

            if not firstItem:
              res += ",\n"

            res += '{\"nr\":"%s",\"title\":"%s",\"name\":"%s", \"tags\":%s}' % (nr, title, item, repr(list(tags)))
            lastbasename = basename
            firstItem = False

        if structurize:
          if lastbasename != None:
            res += "\n]}\n"

        res += "\n]\n"
        firstCategory = False

    res += "}"

    configCreator.send(None)  # finalize config.demo.json
    configCreator.close()
    jsFileCopier.send(None)   # finalize file copying
    jsFileCopier.close()

    distdir = os.path.dirname(dist)

    if not os.path.exists(distdir):
      os.makedirs(distdir)

    content = basic % res

    outputFile = codecs.open(dist, encoding="utf-8", mode="w", errors="replace")
    outputFile.write(content)
    outputFile.flush()
    outputFile.close()



if __name__ == '__main__':
    try:
      parser = optparse.OptionParser()

      (options, args) = parser.parse_args()

      main(args[0], args[1])

    except KeyboardInterrupt:
      print
      print "  * Keyboard Interrupt"
      sys.exit(1)
