#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, re, types, shutil

c = {}
if len(sys.argv)>1:
	c['js_target'] = sys.argv[1]

fJSON = "demo.json"

source = ""
build  = ""

JSON = open(fJSON,"w")
JSON.write('{\n')

jsontmplf = open(os.path.join('tool','json.tmpl'),"rU")
json_tmpl = jsontmplf.read()

def htmlfiles(rootpath):
	dirwalker = os.walk(rootpath)

	for (path, dirlist, filelist) in dirwalker:
		for filename in filelist:
			if not re.search(r'.*\.html$', filename):
				continue

			yield os.path.join(path,filename)


for html in htmlfiles(os.path.join('source','demo')):
	fileH = open(html,"rU")
	selected = False
	for line in fileH:
		if re.search(r'demobrowser\.demo',line):
			selected = True
			break
	if not selected:
		continue
	fileH.seek(0)  # rewind
	category = html.split(os.sep)[2]
	name     = (html.split(os.sep)[3]).split(".")[0]

	print ">>> Processing: %s.%s..." % (category, name)

	# build classname
	clazz  = "demobrowser.demo.%s.%s" % (category,name)
	source = source + '"source-%s",' % clazz
	build  = build + '"build-%s",' % clazz

	# copy js source file
	if ('js_target' in c and len(c['js_target']) > 0):
		try:
			os.makedirs(c['js_target'])
		except OSError:
			pass
		shutil.copyfile('source/class/%s.js' % clazz.replace('.','/'), "%s/%s.src.js" % (c['js_target'],clazz))

	# concat all
	currcont = json_tmpl.replace('XXX',clazz)
	JSON.write("%s," % currcont[:-1])
	JSON.write("\n\n\n")

JSON.write("""  "source" : {
    "run" : [
     %s]
  },\n\n""" % source[:-1] ) 

JSON.write("""  "build" : {
    "run" : [
     %s]
  }\n}""" % build[:-1] ) 

JSON.close()
