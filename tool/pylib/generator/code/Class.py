#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2010-2010 1&1 Internet AG, Germany, http://www.1und1.de
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
# Class -- Internal representation of a qooxdoo class; derives from Resource
##

import os, sys, re, types, copy
import time, math
from pprint import pprint

from misc                           import textutil, util
from ecmascript.frontend            import treeutil
from generator.resource.Resource    import Resource
from generator                      import Context
from generator.code.clazz.MClassHints        import MClassHints
from generator.code.clazz.MClassI18N         import MClassI18N
from generator.code.clazz.MClassDependencies import MClassDependencies
from generator.code.clazz.MClassCode         import MClassCode
from generator.code.clazz.MClassResources    import MClassResources


class Class(Resource, MClassHints, MClassI18N, MClassDependencies, MClassCode, MClassResources):

    def __init__(self, name, path, library, context):
        #__slots__       = ('id', 'path', 'size', 'encoding', 'library', 'context', 'source', 'scopes', 'translations')
        global console, cache
        super(Class, self).__init__(path)
        self.set_id(name)  # qooxdoo name of class, classId
        self.library    = library     # Library()
        # TODO: we now have both a 'context' param, but also use generator.Context (needed in __setstate__)
        self.context    = context
        self.size       = -1
        self.encoding   = 'utf-8'
        self.source     = u''  # source text of this class
        #self.ast        = None # ecmascript.frontend.tree instance
        #self.type      = "" # PROPERTY
        self.scopes     = None # an ecmascript.frontend.Script instance
        self.translations = {} # map of translatable strings in this class
        self.resources  = set() # set of resource objects needed by the class
        self._assetRegex= {}  # [AssetHint], to hold regex's from #asset hints, for resource matching
        self.cacheId    = "class-%s" % self.path  # cache object for class-specific infos (outside tree, compile)
        self.treeId     = None # cache id for the source tree; filled in tree()
        self._tmp_tree  = None # for out-of-band optimization
        
        console = context["console"]
        cache   = context["cache"]
        
        self.defaultIgnoredNamesDynamic = [lib.namespace for lib in self.context['jobconf'].get("library", [])]


    def __getstate__(self):
        d = self.__dict__.copy()
        del d['context'] # don't keep any of the runtime infos (jobconf, cache, console)
        d['_tmp_tree'] = None # remove memoized run time tree
        return d

    def __setstate__(self, d):
        # restore runtime infos (jobconf, cache, console, ...)
        if not hasattr(d, 'context'):
            d['context'] = {}
        if hasattr(Context, "cache"):
            d['context']['cache'] = Context.cache
        if hasattr(Context, 'console'):
            d['context']['console'] = Context.console
        if hasattr(Context, 'jobconf'):
            d['context']['jobconf'] = Context.jobconf

        #d['defaultIgnoredNamesDynamic'] = [lib.namespace for lib in d['context']['jobconf'].get("library", [])]
        d['defaultIgnoredNamesDynamic'] = [lib.namespace for lib in Context.jobconf.get("library", [])]
        self.__dict__ = d


    def _getType(self):
        if hasattr(self, "_type"):
            return self._type
        ast = self.tree()
        qxDefine = treeutil.findQxDefine(ast)
        classMap = treeutil.getClassMap(qxDefine)
        if 'type' in classMap:
            self._type = classMap['type'].get('value')
        elif 'extend' not in classMap:
            self._type = "static"  # this is qx.Class.define semantics!
        else:
            self._type = "normal"
        return self._type
        

    type = property(_getType)


    ##
    # classInfo = {
    #   'svariants' : ['qx.debug']    # supported variants
    #   'deps-<path>-<variants>' : ([<Dep>qx.Class#define], <timestamp>)  # class dependencies
    #   'messages-<variants>' : ["Hello %1"]  # message strings
    #   'hint-meta' : parsed compiler hints (see MClassHints.py)
    # }
    def _getClassCache(self):
        cache = self.context['cache']
        classInfo, modTime = cache.read(self.cacheId, self.path, memory=True)
        if classInfo:
            if self.writeCond():
                print "\nReading %s (keys: %s)" % (self.cacheId, 
                    ["%s:%s" % (i,self.foo(classInfo[i][1]) if len(classInfo[i])>1 else "-") for i in classInfo])
                for k in classInfo.keys():
                    if k.startswith("deps-"):
                        data = classInfo[k][0]['load']
                        print (sorted(data, key=str))
                        print "len:", len(data)
            return classInfo, modTime
        else:
            return {}, None
 
    def _writeClassCache(self, classInfo):
        cache = self.context['cache']
        if self.writeCond():
            import time
            print "\nWriting %s (keys: %s)" % (self.cacheId, 
                ["%s:%s" % (i,self.foo(classInfo[i][1]) if len(classInfo[i])>1 else "-") for i in classInfo])
            for k in classInfo.keys():
                if k.startswith("deps-"):
                    data = classInfo[k][0]['load']
                    print (sorted(data, key=str))
                    print "len:", len(data)
        cache.write(self.cacheId, classInfo, memory=True)


    def foo(s,t):
        d = time.strftime("%Y:%m:%d-%H:%M:%S::%%2.d", time.localtime(t))
        d = d % ((t-math.trunc(t))*100,)
        return d


    def writeCond(self):
        return False #self.id == "qx.core.Environment"



##
# Throw this in cases of dependency problems
class DependencyError(ValueError): pass

 
##
# Auxiliary class for ClassDependencies() (although of more general appeal)
class ClassMap(object):
    def __init__(self):
        # after http://manual.qooxdoo.org/current/pages/core/class_quickref.html
        self.data = {
            'type'      : None,
            'extend'    : [],
            'implement' : [],
            'include'   : [],
            'construct' : [],
            'statics'   : {},  # { foo1 : [<dep1>,...], foo2 : [<dep2>,...] }
            'properties': {},
            'members'   : {},  # { foo1 : [<dep1>,...], foo2 : [<dep2>,...] }
            'settings'  : [],
            'variants'  : [],
            'events'    : [],
            'defer'     : [],
            'destruct'  : [],
        }
        return


##
# Captures the dependencies of a class (-file)
# - the main purpose of this is to have an accessible, shallow representation of
#   a class' dependencies, for caching and traversing
class ClassDependencies(object):
    def __init__(self):
        self.data = {
            'require' : [], # [qx.Class#define, #require(...), ... <other top-level code symbols>]
            'use'     : [], # [#use(...)]
            'optional': [], # [#optional(...)]
            'ignore'  : [], # [#ignore(...)]
            'classes' : {}, # {"classId" : ClassMap(), where the map values are lists of depsItems}
            }
        return

    ##
    # only iterates over the 'classes'
    def dependencyIterator(self):
        for classid, classMapObj in self.data['classes'].items():
            classMap = classMapObj.data
            for attrib in classMap:
                if isinstance(classMap[attrib], types.ListType):    # .defer
                    for dep in classMap[attrib]:
                        yield dep
                elif isinstance(classMap[attrib], types.DictType):  # .statics, .members, ...
                    for subattrib in classMap[attrib]:
                        for dep in classMap[attrib][subattrib]:     # e.g. methods
                            yield dep

    def getAttributeDeps(self, attrib):  # attrib="ignore", "qx.Class#define"
        res  = []
        data = self.data
        # top level
        if attrib.find('#')== -1:
            res = data[attrib]
        # class map
        else:
            classId, attribId = attrib.split('#', 1)
            data = data['classes'][classId].data
            if attribId in data:
                res = data[attribId]
            else:
                for submap in ('statics', 'members', 'properties'):
                    if attribId in data[submap]:
                        res = data[submap][attribId]
                        break
        return res
        

##
# Class to represent ["qx.util.*", "qx.core.Object"] et al.
# (like used in "include" and "exclude" config keys), to provide an
# encapsulated "match" method
class ClassMatchList(object):
    def __init__(self, matchlist):
        assert isinstance(matchlist, types.ListType)
        self.matchlist = matchlist   # ["a.b.c.*", "d.e.Foo"]
        elems = []
        for elem in matchlist:
            assert isinstance(elem, types.StringTypes)
            if elem != "":
                regexp = textutil.toRegExpS(elem)
                elems.append(regexp)
        if elems:
            self.__regexp = re.compile("|".join(elems))
        else:
            self.__regexp = re.compile(r".\A")  # match none

    def isEmpty(self):
        return len(self.matchlist) == 0

    def match(self, classId):
        return self.__regexp.search(classId)


##
# Class to collect various options which influence the compilation process
# (optimizations, format, variants, ...)
class CompileOptions(object):
    def __init__(self, optimize=[], variants={}, _format=False, source_with_comments=False):
        self.optimize   = optimize
        self.variantset = variants
        self.format     = _format
        self.source_with_comments = source_with_comments
        self.privateMap = {} # {"<classId>:<private>":"<repl>"}

