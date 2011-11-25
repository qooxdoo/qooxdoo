#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
#    * Martin Wittemann (martinwittemann)
#
################################################################################
##
# gendata.py -- go through all the demos (i.e. their HTML files) and do the 
#               following:
#               - generate a Json index file, to be used in Demobrowser's tree 
#                 navigation pane (demodata.js)
#               - generate a generator configuration file for demo building 
#                 (config.demo.json), using tmpl.json
#               - copy the demo's source JS files to output dir (<dest>), for
#                 Demobrowser's "View Source" function
#
# usage: gendata.py <dest> <source>
#
#   <dest>    output directory
#   <source>  root directory for the scan
##

import sys, os, optparse, codecs, re
import shutil

# adding tool chain to sys.path
sys.path.insert(0, os.path.join(
    os.path.dirname(unicode(__file__)),  # tool
    os.pardir,          # demobrowser
    os.pardir,          # application
    os.pardir,          # qooxdoo
    "tool",
    "pylib"
    ))

from misc import json, filetool

fJSON      = "./config.demo.json"
demoDataFn = "demodata.json"
demosSourcePath = "./source/class/demobrowser/demo"

##
# check whether to include this demo

def fileCheck(fname):
    fileH = open(fname,"rU")
    selected = False
    for line in fileH:
        if re.search(r'src="\.\./helper.js"',line):
            selected = True
            break
    fileH.close()

    return selected


##
# get the tags from the javascript source file

tagreg = re.compile('\@tag\s(.*)')
qxreg  = re.compile('(qx\.[^(;\s]*)\(')

def getTagsFromJsFile(fname):
    fileH = open(fname,"rU")

    tags = set([]) 
    for line in fileH:
        # tags
        match = tagreg.search(line)
        if match:
          if match.group(1):
            tags.add(match.group(1))
        # qx. usage
        match = qxreg.search(line)
        if match:
          if match.group(1):
            tags.add(match.group(1))
    fileH.close()

    return tags    


##
# generator to create config.demo.json

def CreateDemoJson():

    source = []
    build  = []
    scategories = {}
    bcategories = {}

    # Pre-processing
    JSON = {}
    # top-level includes
    default_json = 'tool' + '/' + 'default.json'
    assert os.path.isfile(default_json)
    JSON['include'] = [{ "path" : "%s" % default_json }]

    # per-demo template file
    json_tmpl = open(os.path.join('tool','tmpl.json'),"rU").read()

    # jobs section
    JSON['jobs'] = {}

    # allow exported jobs to be shadowed
    JSON['config-warnings'] = {}
    shadowed_jobs = []
    JSON['config-warnings']['job-shadowing'] = shadowed_jobs

    # Process demo html files
    while True:
        html = (yield)
        #print html
        if html == None:  # terminate the generator part and go to finalizing json file
            break

        category, name = demoCategoryFromFile(html)
        #print ">>> Processing: %s.%s..." % (category, name)

        # check for demo-specific config file
        config_file = os.path.splitext(html)[0] + ".json"
        if os.path.exists(config_file):
            JSON['include'].append({"path":"%s" % config_file})
            demo_config = json.loadStripComments(config_file)
            shadowed_jobs.extend(demo_config['export'])

        # build classname
        simple = "%s.%s" % (category,name)
        source.append("source-%s" % simple)
        build.append("build-%s" % simple)
        if not category in scategories:
            scategories[category] = []
        scategories[category].append("source-%s" % (simple,))
        if not category in bcategories:
            bcategories[category] = []
        bcategories[category].append("build-%s" % (simple,))

        # concat all
        currcont = json_tmpl.replace('XXX',"%s.%s"%(category,name)).replace("YYY",name).replace("ZZZ",category)
        templatejobs = json.loads("{" + currcont + "}")
        for job,jobval in templatejobs.iteritems():
            JSON['jobs'][job] = jobval

    # Post-processing
    for category in scategories:
        currentry = JSON['jobs']["source-%s" % category] = {}
        currentry['run'] = sorted(scategories[category])
        currentry = JSON['jobs']["build-%s" % category] = {}
        currentry['run'] = sorted(bcategories[category])

    JSON['jobs']["source"] = { "run" : sorted(source) }
    JSON['jobs']["build"]  = { "run" : sorted(build) }

    cont = '// This file is dynamically created by the generator!\n'
    cont += json.dumps(JSON, sort_keys=True, indent=2)
    filetool.save(fJSON, cont)

    yield  # final yield to provide for .send(None) of caller


##
# extract the category and demo name from file path

def demoCategoryFromFile(file):
    # mirror line file: "./source/demo/animation/Login.html"
    file = os.path.normpath(file)
    parts = file.split(os.sep)
    return parts[2], parts[3].split(".")[0]


##
# generator to copy demo source .js files to script dir

def CopyJsFiles(destdir):
    # copy js source file to script dir
    if not os.path.exists(destdir):
      os.makedirs(destdir)

    while True:
        file = (yield)
        if file == None: break
        clazz = "demobrowser.demo.%s.%s" % demoCategoryFromFile(file)
        shutil.copyfile('source/class/%s.js' % clazz.replace('.','/'), "%s/%s.src.js" % (destdir,clazz))
    yield  # to catch caller's .send(None)


##
# generator to create demodata.js

def CreateDemoData(destdir):
    dist = os.path.join(destdir, demoDataFn)
    res = []
    ocategory = ""

    while True:
        (htmlFilePath, category, demo) = (yield)
        if htmlFilePath == None: break

        # init new category
        if category != ocategory:
            ocategory = category
            resCategory = {}
            res.append(resCategory)
            resCategory["classname"] = category
            resCatDemos = []
            resCategory["tests"]     = resCatDemos

        # init new demo
        resDemo = {}
        resCatDemos.append(resDemo)

        # get the tags
        jsitem = os.path.splitext(demo)[0] + ".js"
        jsfile = os.path.join(demosSourcePath, category, jsitem)
        tags = getTagsFromJsFile(jsfile)

        title = os.path.splitext(demo)[0]

        if "_" in title:
            basename, nr = title.split("_",1)
        else:
            basename, nr = (title, 0)

        title = title.replace("_", " ")

        resDemo["nr"]    = nr
        resDemo["title"] = title
        resDemo["name"]  = demo
        resDemo["tags"]  = list(tags)

    # Write demodata.js file
    if not os.path.exists(destdir):
      os.makedirs(destdir)

    content = json.dumpsCode(res)

    outputFile = codecs.open(dist, encoding="utf-8", mode="w", errors="replace")
    outputFile.write(content)
    outputFile.flush()
    outputFile.close()

    yield  # final yield to catch caller's .send(None)


##
# Main

def main(dest, scan):
    dist = os.path.join(dest, demoDataFn)

    # Init the various consumers that work on every demo
    dataCreator   = CreateDemoData(dest) # generator for the demodata.js file
    dataCreator.send(None)               # init it
    configCreator = CreateDemoJson()     # generator for the config.demo.json file
    configCreator.send(None)
    jsFileCopier  = CopyJsFiles(dest)    # generator to copy demos' source JS to script dir
    jsFileCopier.send(None)

    # File iterator - go through the demos' .html files
    for category in os.listdir(scan):
        if category in [".svn", ".DS_Store"]:
          continue

        ext = os.path.splitext(category)[1]
        if ext == ".html" or ext == ".js":
          continue

        for item in os.listdir(os.path.join(scan, category)):
            if item == ".svn":
              continue

            if not os.path.splitext(item)[1] == ".html":
              continue

            htmlfile = os.path.join(scan, category, item)
            if not fileCheck(htmlfile):
              print "  - Skipping HTML file: %s" % (htmlfile,)
              continue

            dataCreator.send((htmlfile, category, item))   # process this demo for demodata.js
            configCreator.send(htmlfile) # process this file name for config.demo.json
            jsFileCopier.send(htmlfile)  # copy demo source file to script dir


    # Finalize
    dataCreator.send((None, None, None))    # finalize demodata.js
    configCreator.send(None)  # finalize config.demo.json
    jsFileCopier.send(None)   # finalize file copying

    return


if __name__ == '__main__':
    try:
      parser = optparse.OptionParser()

      (options, args) = parser.parse_args()

      main(args[0], args[1])

    except KeyboardInterrupt:
      print
      print "  * Keyboard Interrupt"
      sys.exit(1)
