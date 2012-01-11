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
# generator.code.Class Mixin: class compile hints (#asset, #require, ...)
##

import re
from ecmascript.frontend import lang
from misc import filetool

class MClassHints(object):

   # --------------------------------------------------------------------------
    #   Compiler Hints Support
    # --------------------------------------------------------------------------

    HEAD = {
        "require"  : re.compile(r"^\s* \#require  \(\s* (%s+)     \s*\)" % (lang.IDENTIFIER_CHARS[:-1]+'#-]',), re.M|re.X),
        "use"      : re.compile(r"^\s* \#use      \(\s* (%s+)     \s*\)" % (lang.IDENTIFIER_CHARS[:-1]+'#-]',), re.M|re.X),
        "optional" : re.compile(r"^\s* \#optional \(\s* (%s+)     \s*\)" % (lang.IDENTIFIER_CHARS[:-1]+'#]',), re.M|re.X),
        "ignore"   : re.compile(r"^\s* \#ignore   \(\s* (%s+)     \s*\)" % (lang.IDENTIFIER_CHARS[:-1]+'#*-]',), re.M|re.X),
        "asset"    : re.compile(r"^\s* \#asset    \(\s* ([^)]+?)  \s*\)"                        , re.M|re.X),
        "cldr"     : re.compile(r"^\s*(\#cldr) (?:\(\s* ([^)]+?)  \s*\))?"                      , re.M|re.X),
        "_unknown_": re.compile(r"^\s* \#(\w+)    \(\s* [^)]+?    \s*\)"                        , re.M|re.X),
    }


    def getHints(self, metatype=""):

        def _extractLoadtimeDeps(data, fileId):
            deps = []

            for item in self.HEAD["require"].findall(data):
                if item == fileId:
                    raise NameError("Self-referring load dependency: %s" % item)
                else:
                    deps.append(item)

            return deps


        def _extractRuntimeDeps(data, fileId):
            deps = []

            for item in self.HEAD["use"].findall(data):
                if item == fileId:
                    console.error("Self-referring runtime dependency: %s" % item)
                else:
                    deps.append(item)

            return deps


        def _extractOptionalDeps(data):
            deps = []

            # Adding explicit requirements
            for item in self.HEAD["optional"].findall(data):
                if not item in deps:
                    deps.append(item)

            return deps


        def _extractIgnoreDeps(data):
            ignores = []

            # Adding explicit requirements
            for item in self.HEAD["ignore"].findall(data):
                if not item in ignores:
                    ignores.append(item)

            return ignores


        def _extractAssetDeps(data):
            deps = []
            #asset_reg = re.compile("^[\$\.\*a-zA-Z0-9/{}_-]+$")
            asset_reg = re.compile(r"^[\$\.\*\w/{}-]+$", re.U)  # have to include "-", which is permissible in paths, e.g. "folder-open.png"
            
            for item in self.HEAD["asset"].findall(data):
                if not asset_reg.match(item):
                    raise ValueError, "Illegal asset declaration: %s" % item
                if not item in deps:
                    deps.append(item)
            
            return deps

        def _extractCLDRDeps(data):
            cldr = []

            # Adding explicit requirements
            if self.HEAD["cldr"].findall(data):
                cldr = [True]

            return cldr

        def _extractUnknownDeps(data):
            unknown_keys = []
            known_keys   = [x for x in self.HEAD if x != "_unknown_"]

            # here, i'm interested in the key rather than the value
            for item in self.HEAD["_unknown_"].findall(data):
                if item in known_keys:
                    continue
                elif item not in unknown_keys:
                    unknown_keys.append(item)

            return unknown_keys

        def get_hint_meta():
            meta = {}

            console.indent()

            content = filetool.read(filePath, fileEntry.encoding)

            meta["loadtimeDeps"] = _extractLoadtimeDeps(content, fileId)
            meta["runtimeDeps"]  = _extractRuntimeDeps(content, fileId)
            meta["optionalDeps"] = _extractOptionalDeps(content)
            meta["ignoreDeps"]   = _extractIgnoreDeps(content)
            try:
                meta["assetDeps"]    = _extractAssetDeps(content)
            except ValueError, e:
                e.args = (e.args[0] + u' in: %r' % filePath,) + e.args[1:]
                raise e
            meta["cldr"]         = _extractCLDRDeps(content)

            # warn unknown compiler hints
            _unknown_  = _extractUnknownDeps(content)
            for item in _unknown_:
                console.warn(u"Unknown compiler hint '#%s' in %s" % (item, self.id))

            console.outdent()

            return meta

        # ----------------------------------------------------------

        fileEntry = self
        filePath = fileEntry.path
        fileId   = self.id
        console = self.context['console']

        classInfo, _ = self._getClassCache()
        if 'hint_meta' in classInfo:
            meta = classInfo['hint_meta']
        else:
            # no cached information? => build hint meta data now
            meta = classInfo['hint_meta'] = get_hint_meta()
            self._writeClassCache(classInfo)

        if metatype:
            return meta[metatype]
        else:
            return meta
