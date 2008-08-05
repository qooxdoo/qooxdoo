#!/usr/bin/env python
# -*- coding: utf-8 -*-

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
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# NAME
#  genjson.py -- generate json struct, to prepare for generation of demo apps
#
# SYNTAX
#  genjson.py [<copy_target>]
#
#    <copy_target>  -- directory to copy demo .js files to, e.g. 'source/script'
#
# DESCRIPTION
# This script does actually a couple of things:
#  - scans for html files of demos (in source/demo)
#  - creates a config json file for them (using the tmpl.json template)
#  - copys demos' .js files to <copy_target> dir (usually one of the */script dirs)
#    from under source/class/, for the 'View Source' function in DemoBrowser
#
# TODO
#  - sync with gendata.py
##

import sys, os, re, types, shutil

# go to application dir
os.chdir(os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), os.pardir))

fJSON = "./config.demo.json"


def htmlfiles(rootpath):
    dirwalker = os.walk(rootpath)

    for (path, dirlist, filelist) in dirwalker:
        for filename in filelist:
            if not re.search(r'.*\.html$', filename):
                continue

            yield os.path.join(path,filename)


def main():
    c = {}
    if len(sys.argv)>1:
        c['js_target'] = sys.argv[1]

    source = ""
    build  = ""

    JSON = open(fJSON,"w")
    JSON.write('// This file is dynamically created by the generator!\n')
    JSON.write('{\n  "jobs":\n  {\n')

    jsontmplf = open(os.path.join('tool','tmpl.json'),"rU")
    json_tmpl = jsontmplf.read()

    for html in htmlfiles(os.path.join('source','demo')):
        fileH = open(html,"rU")
        selected = False
        for line in fileH:
            #if re.search(r'demobrowser\.demo',line):
            if re.search(r'src="\.\./helper.js"',line):
                selected = True
                break
        if not selected:
            continue
        fileH.seek(0)  # rewind
        category = html.split(os.sep)[2]
        name     = (html.split(os.sep)[3]).split(".")[0]

        # print ">>> Processing: %s.%s..." % (category, name)

        # build classname
        clazz  = "demobrowser.demo.%s.%s" % (category,name)
        simple = "%s.%s" % (category,name)
        source = source + ' "source-%s",' % simple
        build  = build + ' "build-%s",' % simple

        # copy js source file
        if ('js_target' in c and len(c['js_target']) > 0):
            try:
                os.makedirs(c['js_target'])
            except OSError:
                pass
            shutil.copyfile('source/class/%s.js' % clazz.replace('.','/'), "%s/%s.src.js" % (c['js_target'],clazz))

        # concat all
        currcont = json_tmpl.replace('XXX',"%s.%s"%(category,name)).replace("YYY",clazz)
        JSON.write("%s," % currcont[:-1])
        JSON.write("\n\n\n")

    JSON.write("""  "source" : {
        "run" : [
         %s]
      },\n\n""" % source[:-1] ) 

    JSON.write("""  "build" : {
        "run" : [
         %s]
      }\n  }\n}""" % build[:-1] ) 

    JSON.close()


if __name__ == '__main__':
  try:
    main()
  except KeyboardInterrupt:
    print
    print "  * Keyboard Interrupt"
    sys.exit(1)

