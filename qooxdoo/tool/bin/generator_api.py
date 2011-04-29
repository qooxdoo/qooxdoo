#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2011 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# NAME
#  generator_api.py  -- create API data for generator modules, like apidata.json
#
# SYNTAX
#  $0 <scan_root> <output_path>
##

import os, sys, re, string, types, subprocess as sp
import qxenviron
from misc import filetool, Path, json

PYTHON_CMD = sys.executable
XSLTPROC = 'xsltproc'

def file2package(fname, rootname):
    fileid = Path.getCommonPrefix(rootname, fname)[2]
    fileid = os.path.splitext(fileid)[0] # strip .py
    return fileid.replace(os.sep, '.')

def pyapi2json(pyfile):
    #print cmd1 % pyfile
    p1 = sp.check_call(cmd1 % pyfile, shell=True)
    p2 = sp.check_call(cmd2, shell=True)
    p3 = sp.Popen(cmd3, shell=True, stdout=sp.PIPE)
    apijson = p3.communicate()[0]
    return apijson


class MyJsonSerializer(json.json.JSONEncoder):
    def default(self, s):
        if isinstance(s, types.StringTypes):
            return JSONEncoder.default(self, s.replace('"',r'\"'))
        else:
            return JSONEncoder.default(self, s)


def main():
    apidata = {}
    apidata['type'] = 'doctree'
    apidata['children'] = []
    apidata['attributes'] = {}
    apidata['children'].append({
      "type":"packages","attributes":{},"children":[]  
    })
    filetool.directory(store_path)

    dirwalker = filetool.find(module_root, r'\.py$')

    for pyfile in dirwalker:
        #if os.stat(pyfile).st_size == 0:
        #    continue
        # get the file's api doc as json
        filejson = pyapi2json(pyfile)
        apipackage = file2package(pyfile, module_root)
        # and store it
        filetool.save(store_path+'/'+apipackage+'.json', filejson)
        # make an entry in apidata struct
        levels = apipackage.split('.')
        curr = apidata['children'][0]['children']
        for pos,level in enumerate(levels):
            if level not in (x['attributes']['name'] for x in curr if 'name' in x['attributes']):
                newentry = {
                    "children" : [],
                    "type" : "packages" if pos % 2 else "package",
                    "attributes" : {
                        "packageName" : ".".join(levels[:pos]),
                        "name" : level,
                        "fullName" : ".".join(levels[:pos+1])
                    }
                }
                if pos==len(levels)-1:
                    newentry["externalRef"] = True
                    #del newentry['children']
                    #newentry["type"] = "classes"
                    pass
                curr.append(newentry)
                curr = newentry['children']
            else:
                curr = [x['children'] for x in curr if x['attributes']['name']==level][0]
        

    # store apidata
    filetool.save(store_path+'/'+"apidata.json", json.dumps(apidata))

if __name__ == "__main__":
    module_root = sys.argv[1]
    store_path  = sys.argv[2]

    cmd1 = "%s admin/bin/pythondoc.py -f -x %%s > %s/pydoc.xml" % (PYTHON_CMD, store_path)
    cmd2 = "%s data/apidoc/pydoc2qx-xml.xsl %s/pydoc.xml > %s/qx.xml" % (XSLTPROC, store_path, store_path)
    cmd3 = "%s data/apidoc/qx-xml2qx-json.xsl %s/qx.xml" % (XSLTPROC, store_path, )
    main()
