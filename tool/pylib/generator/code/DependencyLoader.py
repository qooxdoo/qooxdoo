#!/usr/bin/env python
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
#
################################################################################

##
# NAME
#  DependencyLoader
#
# SYNTAX
#  from DependencyLoader import DependencyLoader
#  mydl = DependencyLoader(...)
#
# DESCRIPTION
#
# ENTRY POINTS (for generator)
#  - DependencyLoader.__init__()
#  - DependencyLoader.getClassList()
#  - DependencyLoader.getMeta()
#  - DependencyLoader.getDeps()
#
##

import sys, re, os, types

from ecmascript.frontend import treeutil, lang
from ecmascript.frontend.Script import Script
from misc import filetool, util
from misc.ExtMap import ExtMap
import graph



class DependencyLoader:

    def __init__(self, classes, cache, console, treeLoader, require, use, context):
        self._classes = classes
        self._cache = cache
        self._console = console
        self._context = context
        self._jobconf = context.get('jobconf', ExtMap())
        self._treeLoader = treeLoader
        self._require = require
        self._use = use


    def getClassList(self, include, block, explicitInclude, explicitExclude, variants, verifyDeps=False):

        def resolveDepsSmartCludes():
            # Resolve intelli include/exclude depdendencies
            if len(include) == 0 and len(explicitInclude) > 0:
                if len(block) > 0:
                    self._console.error("Blocking is not supported when only explicit includes are defined!");
                    sys.exit(1)

                result = []
            else:
                result = self.classlistFromInclude(include, block, variants, verifyDeps)

            return result


        def processExplicitCludes(result):
            # Explicit include/exclude
            if len(explicitInclude) > 0 or len(explicitExclude) > 0:
                self._console.info("Processing explicitely configured includes/excludes...")
                for entry in explicitInclude:
                    if not entry in result:
                        result.append(entry)

                for entry in explicitExclude:
                    if entry in result:
                        result.remove(entry)
            return result

        # ---------------------------------------------------

        result = resolveDepsSmartCludes()
        result = processExplicitCludes(result)
        # Sort classes
        self._console.info("Sorting %s classes..." % len(result))
        if  self._jobconf.get("dependencies/sort-topological", False):
            result = self.sortClassesTopological(result, variants)
        else:
            result = self.sortClasses(result, variants)

        if self._console.getLevel() == "debug":# or True:
            self._console.indent()
            self._console.info("Sorted class list:")
            self._console.indent()
            for classId in result:
                self._console.info(classId)
            self._console.outdent()
            self._console.outdent()

        # Return list
        return result



    def classlistFromInclude(self, include, block, variants, verifyDeps=False):

        def classlistFromClassRecursive(item, block, variants, result):
            # support blocking
            if item in block:
                return

            # check if already in
            if item in result:
                return

            # add self
            result.append(item)

            # reading dependencies:
            deps = self.getCombinedDeps(item, variants)
            unknownDeps = self._checkDepsAreKnown(deps,)
            deps["warn"] = unknownDeps
            if verifyDeps:
                for classId in unknownDeps:
                    self._console.warn("! Unknown class referenced: %s (in: %s)" % (classId, item))

            # process lists
            try:
              for subitem in deps["load"]:
                  if not subitem in result and not subitem in block and not subitem in deps["warn"]:
                      classlistFromClassRecursive(subitem, block, variants, result)

              for subitem in deps["run"]:
                  if not subitem in result and not subitem in block and not subitem in deps["warn"]:
                      classlistFromClassRecursive(subitem, block, variants, result)

            except NameError, detail:
                raise NameError("Could not resolve dependencies of class: %s \n%s" % (item, detail))

            # TODO: superseded by checkDepsAreKnown()
            #if deps['undef']:
            #    self._console.indent()
            #    for id in deps['undef']:
            #        self._console.warn("! Unknown class referenced: %s (in: %s)" % (id, item))
            #    self._console.outdent()

            return

        # -------------------------------------------

        if len(include) == 0:
            self._console.info("Including all known classes")
            result = self._classes.keys()

            # In this case the block works like an explicit exclude
            # because all classes are included like an explicit include.
            for classId in block:
                result.remove(classId)

        else:
            result = []
            for item in include:
                try:
                    classlistFromClassRecursive(item, block, variants, result)

                except NameError, detail:
                    #self._console.error("Dependencies resolving failed for %s with: \n%s" % (item, detail))
                    #sys.exit(1)
                    raise

        return result


    def getMethodDeps(self, fileId, methodNameFQ, variants):
        # find the dependencies of a specific method
        # get the fileId class, find the node of methodNameFQ, and extract its
        # dependencies (can only be runtime deps, since all inFunction)
        # return the deps

        def findMethodName(fileId, methodNameFQ):
            mo = re.match(r'(?u)^%s\.(.+)$' % fileId, methodNameFQ)
            if mo and mo.group(1):
                return mo.group(1)
            else:
                return u''
        
        def findMethod(tree, methodName):
            for node in treeutil.nodeIterator(tree, ["function"]):  # check function nodes
                if node.hasParentContext("keyvalue/value"): # it's a key : function() member
                    keyvalNode = node.parent.parent
                    key = keyvalNode.get("key", False)
                    if key and key == methodName:
                        return node
            return None

        # get the method name
        if fileId == methodNameFQ:  # corner case: the class is being called
            methodName = "construct"
        else:
            methodName = findMethodName(fileId, methodNameFQ) # methodNameFQ - fileId = methodName
        if methodName == "getInstance": # corner case: singletons get this from qx.Class
            fileId = "qx.Class"

        # get the class code
        tree = self._treeLoader.getTree(fileId, variants)

        # find the method node
        funcNode   = findMethod(tree, methodName)
        if not funcNode:
            raise RuntimeError, "No method named \"%s\" found in class \"%s\"." % (methodName, fileId)

        # get the deps of the method
        runtime  = []
        loadtime = []
        warn     = []
        self._analyzeClassDepsNode(fileId, funcNode, runtime, loadtime, warn, True, variants)

        # remove reference to itself
        while fileId in loadtime:
            loadtime.remove(fileId)

        return loadtime


    ##
    # find all run time dependencies of a given method, recursively
    #
    # this is supposed to be an improved version of getMethodDeps() that should be really
    # exhaustive (and therefore reliable):
    # - get the immediate runtime dependencies of the current method; for each of those dependencies:
    # - if it is a "<name>.xxx" method/attribute:
    #   - find the defining class (<name>, ancestor of <name>, or mixin of <name>): findClassForMethod()
    #   - add this class#method to dependencies
    #   - recurse on dependencies of this class#method, adding them to the current dependencies
    # currently only a thin wrapper around its recursive sibling, getMethodDepsR

    def getMethodDeps1(self, classId, methodId, variants):

        ##
        # find the class the given <methodId> is defined in; start with the
        # given class, inspecting its class map to find the method; if
        # unsuccessful, recurse on the potential super class and mixins; return
        # the defining class name, and the tree node defining the method
        # (actually, the map value of the method name key, whatever that is)
        #
        # @out <string> class that defines method
        # @out <tree>   tree node value of methodId in the class map

        def findClassForMethod(clazzId, methodId, variants):

            def classHasOwnMethod(classAttribs, methId):
                candidates = {}
                candidates.update(classAttribs.get("members",{}))
                candidates.update(classAttribs.get("statics",{}))
                if "construct" in classAttribs:
                    candidates.update(dict((("construct", classAttribs.get("construct")),)))
                if methId in candidates.keys():
                    return candidates[methId]  # return the definition of the attribute
                else:
                    return None

            # get the method name
            if  methodId == u'':  # corner case: the class is being called
                methodId = "construct"
            elif methodId == "getInstance": # corner case: singletons get this from qx.Class
                clazzId = "qx.Class"
            # TODO: getter/setter are also not statically available!
            # handle .call() ?!
            if clazzId in lang.BUILTIN:  # these are automatically fullfilled, signal this
                return True, True
            elif clazzId not in self._classes: # can't further process non-qooxdoo classes
                return None, None

            tree = self._treeLoader.getTree(clazzId, variants)
            clazz = treeutil.findQxDefine(tree)
            classAttribs = treeutil.getClassMap(clazz)
            keyval = classHasOwnMethod(classAttribs, methodId)
            if keyval:
                return clazzId, keyval

            # inspect inheritance/mixins
            parents = []
            extendVal = classAttribs.get('extend', None)
            if extendVal:
                extendVal = treeutil.variableOrArrayNodeToArray(extendVal)
                parents.extend(extendVal)
            includeVal = classAttribs.get('include', None)
            if includeVal:
                includeVal = treeutil.variableOrArrayNodeToArray(includeVal)
                parents.extend(includeVal)

            # go through all ancestors
            for parClass in parents:
                rclass, keyval = findClassForMethod(parClass, methodId, variants)
                if rclass:
                    return rclass, keyval
            return None, None

        ##
        # split a composed identifier into its class and attribute part, so that
        # <assembled> = <assembledId>.<attribute>

        def splitClassAttribute(assembledId, assembled):
            if assembledId == assembled:  # just a class id
                clazzId   = assembledId
                attribute = u''
            else:
                clazzId   = assembledId
                attribute = assembled[ len(assembledId) +1 :] # a.b.c.d = a.b.c + '.' + d
                
            return clazzId, attribute


        ##
        # extract the class name from a composed identifier
        # "qx.Class.define" -> "qx.Class"

        def reduceAssembled(assembled, node):
            assembledId = ''
            if assembled in self._classes:
                assembledId = assembled
            elif "." in assembled:
                for entryId in self._classes.keys() + ["this"]:
                    if assembled.startswith(entryId) and re.match(r'%s\b' % entryId, assembled):
                        if len(entryId) > len(assembledId): # take the longest match
                            assembledId = entryId
            return assembledId


        ##
        # find interesting identifiers in a (method) source tree; "interesting"
        # means references to other methods within the qooxdoo world;
        # returns the full identifiers

        def getReferencesFromSource(fileId, node, runtime):
            # the "variants" param is only to support getMethodDeps()!

            ##
            # currently interesting are 
            # - 'new' operands ("new qx.ui.form.Button(...)"), and 
            # - call operands ("qx.core.Variant.select(...)")

            def isInterestingReference(assembled, node, fileId):
                # check name in 'new ...' position
                if (node.hasParentContext("instantiation/*/*/operand")
                # check name in call position
                or (node.hasParentContext("call/operand"))):
                    # skip built-in classes (Error, document, RegExp, ...)
                    for bi in lang.BUILTIN + ['clazz']:
                        if re.search(r'^%s\b' % bi, assembled):
                            return False
                    # skip scoped vars - expensive, therefore last test
                    if self._isScopedVar(assembled, node, fileId):
                        return False
                    else:
                        return True

                return False
            
            # -----------------------------------------------------------

            if node.type == "variable":
                assembled = (treeutil.assembleVariable(node))[0]

                if isInterestingReference(assembled, node, fileId):
                    runtime.append(assembled)

            if node.hasChildren():
                for child in node.children:
                    getReferencesFromSource(fileId, child, runtime)

            return



        ##
        # find dependencies of a method <methodId> that has been referenced from
        # <classId>. recurse on the immediate dependencies in the method code.
        #
        # @param deps accumulator variable set((c1,m1), (c2,m2),...)
        #
        # returns a set of pairs each representing a signature (classId,
        # methodId)

        def getMethodDepsR(classId, methodId, variants, deps):
            self._console.debug("%s#%s dependencies:" % (classId, methodId))
            self._console.indent()

            # Check cache
            filePath= self._classes[classId]["path"]
            cacheId = "methoddeps-%r-%r-%r" % (classId, methodId, util.toString(variants))
            ndeps   = self._cache.read(cacheId, memory=True)  # no use to put this into a file, due to transitive dependencies to other files
            if ndeps != None:
                self._console.debug("using cached result")
                #deps.update(ndeps)
                self._console.outdent()
                return ndeps

            # Calculate deps

            # find the defining class
            clazzId, attribValNode = findClassForMethod(classId, methodId, variants)

            # Get the method's immediate deps
            deps_rt = []
            getReferencesFromSource(clazzId, attribValNode, deps_rt)
            ndeps= set(())
            # put into right format
            for dep in deps_rt:
                assId = reduceAssembled(dep)
                if assId == u'':  # unknown class
                    self._console.info("Skipping unknown id: %r" % dep)
                    continue
                clazzId, methId = splitClassAttribute(assId, dep)
                ndeps.add((clazzId,methId))

            self._console.debug("Code references: %r" % list(ndeps))

            # Recurse on the immediate deps
            ndepslist = list(ndeps)
            ndeps     = set(())   # will be re-populated with brushed values (e.g. 'this' gone)
            for clazzId, methId in ndepslist:
                if clazzId == "this":
                    clazzId = classId
                ndeps.add((clazzId, methId))
                nclazzId, methValNode = findClassForMethod(clazzId, methId, variants) # find the original class methId was defined in
                if not nclazzId:
                    self._console.warn("Skipping unknown class dependency: %s#%s" % (clazzId, methId))
                elif nclazzId == True:  # this must be a known global (like Error, Regexp, ...)
                    self._console.debug("Dependency automatically fullfilled: %s#%s" % (clazzId, methId))
                    continue
                else:
                    clazzId = nclazzId
                    # cyclic check
                    if (clazzId, methId) in deps:
                    #if (clazzId, methId) == (classId, methodId):
                        self._console.debug("Class.method already seen, skipping: %s#%s" % (clazzId, methId))
                        continue
                    else:
                        ndeps.add((clazzId, methId))
                        assert clazzId in self._classes
                        r = getMethodDepsR(clazzId, methId, variants, deps.union(ndeps))  # recursive call
                        ndeps.update(r)

            # Cache update
            self._cache.write(cacheId, ndeps, memory=True, writeToFile=False)
            # accumulator update
            #deps.update(ndeps)
            self._console.debug("Recursive dependencies: %r" % list(ndeps))
            self._console.outdent()
            return ndeps

        # - Main ---------------------
        deps = getMethodDepsR(classId, methodId, variants, set(()))
        return deps



    def getCombinedDeps(self, fileId, variants):
        # return dependencies of class named <fileId>, both found in its code and
        # expressed in config options

        # print "Get combined deps: %s" % fileId

        # init lists
        loadFinal = []
        runFinal = []

        # add static dependencies
        static = self.getDeps(fileId, variants)
        loadFinal.extend(static["load"])
        runFinal.extend(static["run"])

        # add config dependencies
        if self._require.has_key(fileId):
            loadFinal.extend(self._require[fileId])

        if self._use.has_key(fileId):
            runFinal.extend(self._use[fileId])

        # result dict
        deps = {
            "load" : loadFinal,
            "run"  : runFinal,
            'undef' : static['undef']
        }

        return deps



    ##
    # Interface method
    #
    def getDeps(self, fileId, variants):
        # find dependencies of class named <fileId> in its code (both meta hints as
        # well as source code)

        def analyzeClassDeps(fileId, variants):

            ## analyze with no variants

            #loadtimeDepsNV = []  # NV = no variants
            #runtimeDepsNV  = []
            #undefDepsNV    = []

            #tree = self._treeLoader.getTree(fileId, {})
            #self._analyzeClassDepsNode(fileId, tree, loadtimeDepsNV, runtimeDepsNV, undefDepsNV, False, variants)

            # now analyze with variants

            loadtimeDeps = []
            runtimeDeps  = []
            undefDeps    = []

            tree = self._treeLoader.getTree(fileId, variants)
            self._analyzeClassDepsNode(fileId, tree, loadtimeDeps, runtimeDeps, undefDeps, False, variants)

            ## this should be for *source* version only!
            #if "qx.core.Variant" in loadtimeDepsNV and "qx.core.Variant" not in loadtimeDeps:
            #    loadtimeDeps.append("qx.core.Variant")

            return loadtimeDeps, runtimeDeps, undefDeps

        def buildShallowDeps():
            # Notes:
            # load time = before class = require
            # runtime = after class = use

            load = []
            run = []

            self._console.debug("Gathering dependencies: %s" % fileId)
            self._console.indent()

            # Read meta data
            meta         = self.getMeta(fileId)
            metaLoad     = meta.get("loadtimeDeps", [])
            metaRun      = meta.get("runtimeDeps" , [])
            metaOptional = meta.get("optionalDeps", [])
            metaIgnore   = meta.get("ignoreDeps"  , [])

            # Process meta data
            load.extend(metaLoad)
            run.extend(metaRun)

            # Read content data
            (autoLoad, autoRun, autoWarn) = analyzeClassDeps(fileId, variants)
            
            # Process content data
            if not "auto-require" in metaIgnore:
                for item in autoLoad:
                    if item in metaOptional:
                        pass
                    elif item in load:
                        self._console.warn("%s: #require(%s) is auto-detected" % (fileId, item))
                    else:
                        load.append(item)

            if not "auto-use" in metaIgnore:
                for item in autoRun:
                    if item in metaOptional:
                        pass
                    elif item in load:
                        pass
                    elif item in run:
                        self._console.warn("%s: #use(%s) is auto-detected" % (fileId, item))
                    else:
                        run.append(item)

            self._console.outdent()

            # Build data structure
            deps = {
                "load" : load,
                "run"  : run,
                'undef' : autoWarn
            }

            return deps

        # -----------------------------------------------------------------

        if not self._classes.has_key(fileId):
            raise NameError("Could not find class to fulfill dependency: %s" % fileId)

        filePath = self._classes[fileId]["path"]
        cacheId = "deps-%s-%s" % (filePath, util.toString(variants))

        # print "Read from cache: %s" % fileId
        
        deps = self._cache.readmulti(cacheId, filePath)
        if deps == None:
            deps = buildShallowDeps()
            self._cache.writemulti(cacheId, deps)
        
        #deps = self._traverseDependencies(deps)
        return deps


    def _checkDepsAreKnown(self, deps,):
        # check the shallow deps are known classes
        new_warn = []
        for classId in deps["load"] + deps["run"] + deps["undef"]:
            if not self._isKnownClass(classId):
                new_warn.append(classId)
        return new_warn

    def _isKnownClass(self, classId):
        # check whether classId can be considered a known class
        if classId in lang.BUILTIN + ["clazz"]:
            return True
        elif classId in self._classes:
            return True
        elif re.match(r'this\b', classId):
            return True
        return False


    
    def _isScopedVar(self, idString, node, fileId):

        def findScopeNodeAndRoot(node):
            node1 = node
            sNode = None
            rNode = None
            while True:
                if not sNode and node1.type in ["function", "catch"]:
                    sNode = node1
                if node1.hasParent():
                    node1 = node1.parent
                else:  # we're at the root
                    if not sNode:
                        sNode = node1
                    rNode = node1
                    break
            return sNode, rNode

        # check composite id a.b.c, check only first part
        dotIdx = idString.find('.')
        if dotIdx > -1:
            idString = idString[:dotIdx]
        scopeNode, rootNode  = findScopeNodeAndRoot(node)  # find the node of the enclosing scope (function - catch - global)
        script = Script(rootNode, fileId)
        if scopeNode == rootNode:
            fcnScope = script.getGlobalScope()
        else:
            fcnScope = script.getScope(scopeNode)
        varDef = script.getVariableDefinition(idString, fcnScope)
        if varDef:
            return True
        return False



    def _analyzeClassDepsNode(self, fileId, node, loadtime, runtime, warn, inFunction, variants):
        # analyze a class AST for dependencies (compiler hints not treated here)
        # does not follow dependencies to other classes (ie. it's a "shallow" analysis)!
        # the "variants" param is only to support getMethodDeps()!

        def checkDeferNode(assembled, node):
            deferNode = None
            if assembled == "qx.Class.define" or assembled == "qx.Bootstrap.define" or assembled == "qx.List.define":
                if node.hasParentContext("call/operand"):
                    deferNode = treeutil.selectNode(node, "../../params/2/keyvalue[@key='defer']/value/function/body/block")
            return deferNode

        def reduceAssembled(assembled, node):
            assembledId = ''
            if assembled in self._classes:
                assembledId = assembled
            elif "." in assembled:
                for entryId in self._classes:
                    if assembled.startswith(entryId) and re.match(r'%s\b' % entryId, assembled):
                        if len(entryId) > len(assembledId): # take the longest match
                            assembledId = entryId
            return assembledId

        def reduceAssembled1(assembled, node):
            def tryKnownClasses(assembled):
                result = ''
                for entryId in self._classes.keys() + ["this"]:
                    if assembled.startswith(entryId) and re.match(r'%s\b' % entryId, assembled):
                        if len(entryId) > len(assembledId): # take the longest match
                            result = entryId
                return result

            def tryReduceClassname(assembled, node):
                result = ''
                # 'new <name>()'
                if (node.hasParentContext("instantiation/*/*/operand")):
                    result = assembled  # whole <name>
                # '"extend" : <name>'
                elif (node.hasParentContext("keyvalue/*") and node.parent.parent.get('key') == 'extend'):
                    result = assembled  # whole <name>
                # 'call' functor
                elif (node.hasParentContext("call/operand")):
                    result = assembled[:assembled.rindex('.')] # drop the method name after last '.'
                return result

            if assembled in self._classes:
                assembledId = assembled
            elif "." in assembled:
                assembledId = tryKnownClasses(assembled)
                if not assembledId:
                    assembledId = tryReduceClassname(assembled, node)
            if not assembledId:
                assembledId = assembled
            return assembledId

        def isUnknownClass(assembled, node, fileId):
            # check name in 'new ...' position
            if (node.hasParentContext("instantiation/*/*/operand")
            # check name in "'extend' : ..." position
            or (node.hasParentContext("keyvalue/*") and node.parent.parent.get('key') == 'extend')):
                # skip built-in classes (Error, document, RegExp, ...)
                if (assembled in lang.BUILTIN + ['clazz'] or re.match(r'this\b', assembled)):
                   return False
                # skip scoped vars - expensive, therefore last test
                elif self._isScopedVar(assembled, node, fileId):
                    return False
                else:
                    return True

            return False
        
        def addId(assembledId, runtime, loadtime):
            if inFunction:
                target = runtime
            else:
                target = loadtime

            if not assembledId in target:
                target.append(assembledId)

            if (not inFunction and  # only for loadtime items
                self._jobconf.get("dependencies/follow-static-initializers", False) and
                node.hasParentContext("call/operand")  # it's a method call
               ):  
                deps = self.getMethodDeps(assembledId, assembled, variants)
                loadtime.extend([x for x in deps if x not in loadtime]) # add uniquely

            return


        def followCallDeps(assembledId):
            if (assembledId and
                assembledId in self._classes and       # we have a class id
                assembledId != fileId and
                self._jobconf.get("dependencies/follow-static-initializers", False) and
                node.hasParentContext("call/operand")  # it's a method call
               ):
                return True
            return False


        def splitClassAttribute(assembledId, assembled):
            if assembledId == assembled:  # just a class id
                clazzId   = assembledId
                attribute = u''
            else:
                clazzId   = assembledId
                attribute = assembled[ len(assembledId) +1 :] # a.b.c.d = a.b.c + '.' + d
                
            return clazzId, attribute

        # -----------------------------------------------------------

        if node.type == "variable":
            assembled = (treeutil.assembleVariable(node))[0]

            # treat dependencies in defer as requires
            deferNode = checkDeferNode(assembled, node)
            if deferNode != None:
                self._analyzeClassDepsNode(fileId, deferNode, loadtime, runtime, warn, False, variants)

            # try to reduce to a class name
            assembledId = reduceAssembled(assembled, node)

            # warn about instantiations of unknown classes
            if not assembledId and isUnknownClass(assembled, node, fileId):
                warn.append(assembled)

            if assembledId and assembledId in self._classes and assembledId != fileId:
            #if assembledId != fileId:
                addId(assembledId, runtime, loadtime)

            # an attempt to fix static initializers (bug#1455)
            if not inFunction and followCallDeps(assembledId):
                self._console.debug("Looking for rundeps in '%s' of '%s'" % (assembled, assembledId))
                if False: # use old getMethodDeps()
                    ldeps = self.getMethodDeps(assembledId, assembled, variants)
                    # getMethodDeps is mutual recursive calling into the current function, but
                    # only does so with inFunction=True, so this branch is never hit through the
                    # recursive call
                    # make run-time deps of the called method load-deps of the current
                    loadtime.extend([x for x in ldeps if x not in loadtime]) # add uniquely
                else: # new getMethodDeps()
                    self._console.indent()
                    classId, attribId = splitClassAttribute(assembledId, assembled)
                    ldeps = self.getMethodDeps1(classId, attribId, variants)
                    ld = [x[0] for x in ldeps]
                    loadtime.extend([x for x in ld if x not in loadtime]) # add uniquely
                    self._console.outdent()

        elif node.type == "body" and node.parent.type == "function":
            inFunction = True

        if node.hasChildren():
            for child in node.children:
                self._analyzeClassDepsNode(fileId, child, loadtime, runtime, warn, inFunction, variants)

        return


    def _isInterestingReference(assembled, node, fileId):
        # check name in 'new ...' position
        if (node.hasParentContext("instantiation/*/*/operand")
        # check name in call position
        or (node.hasParentContext("call/operand"))
        # check name in "'extend' : ..." position
        or (node.hasParentContext("keyvalue/*") and node.parent.parent.get('key') == 'extend')):
            # skip built-in classes (Error, document, RegExp, ...)
            for bi in lang.BUILTIN + ['clazz', 'this']:
                if re.search(r'^%s\b' % bi, assembled):
                    return False
            # skip scoped vars - expensive, therefore last test
            if self._isScopedVar(assembled, node, fileId):
                return False
            else:
                return True

        return False


    ######################################################################
    #  CLASS SORT SUPPORT
    ######################################################################

    def sortClasses(self, include, variants):

        def sortClassesRecurser(classId, available, variants, result, path):
            if classId in result:
                return

            # reading dependencies
            deps = self.getCombinedDeps(classId, variants)

            # path is needed for recursion detection
            if not classId in path:
                path.append(classId)

            # process loadtime requirements
            for item in deps["load"]:
                if item in available and not item in result:
                    if item in path:
                        other = self.getCombinedDeps(item, variants)
                        self._console.warn("Detected circular dependency between: %s and %s" % (classId, item))
                        self._console.indent()
                        self._console.debug("%s depends on: %s" % (classId, ", ".join(deps["load"])))
                        self._console.debug("%s depends on: %s" % (item, ", ".join(other["load"])))
                        self._console.outdent()
                        sys.exit(1)

                    sortClassesRecurser(item, available, variants, result, path)

            if not classId in result:
                # remove element from path
                path.remove(classId)

                # print "Add: %s" % classId
                result.append(classId)

            return

        # ---------------------------------

        result = []
        path   = []

        for classId in include:
            sortClassesRecurser(classId, include, variants, result, path)

        return result


    def sortClassesTopological(self, include, variants):
        
        # create graph object
        gr = graph.digraph()

        # add classes as nodes
        gr.add_nodes(include)

        # for each load dependency add a directed edge
        for classId in include:
            deps = self.getCombinedDeps(classId, variants)
            for depClassId in deps["load"]:
                if depClassId in include:
                    gr.add_edge(depClassId, classId)

        # cycle check?
        cycle_nodes = gr.find_cycle()
        if cycle_nodes:
            self._console.error("Detected circular dependencies between nodes: %r" % cycle_nodes)
            sys.exit(1)

        classList = gr.topological_sorting()

        return classList




    ######################################################################
    #  META DATA SUPPORT
    ######################################################################

    HEAD = {
        "require"  : re.compile(r"^\s*#require\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
        "use"      : re.compile(r"^\s*#use\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
        "optional" : re.compile(r"^\s*#optional\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
        "ignore"   : re.compile(r"^\s*#ignore\(\s*([\.a-zA-Z0-9_-]+?)\s*\)", re.M),
        "asset"    : re.compile(r"^\s*#asset\(\s*([^)]+?)\s*\)", re.M)
    }


    def getMeta(self, fileId):

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
                    self._console.error("Self-referring runtime dependency: %s" % item)
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

        # ----------------------------------------------------------

        fileEntry = self._classes[fileId]
        filePath = fileEntry["path"]
        cacheId = "meta-%s" % filePath

        meta = self._cache.readmulti(cacheId, filePath)
        if meta != None:
            return meta

        meta = {}

        self._console.indent()

        content = filetool.read(filePath, fileEntry["encoding"])

        meta["loadtimeDeps"] = _extractLoadtimeDeps(content, fileId)
        meta["runtimeDeps"]  = _extractRuntimeDeps(content, fileId)
        meta["optionalDeps"] = _extractOptionalDeps(content)
        meta["ignoreDeps"]   = _extractIgnoreDeps(content)
        try:
            meta["assetDeps"]    = _extractAssetDeps(content)
        except ValueError, e:
            raise ValueError, e.message + u' in: %r' % filePath

        self._console.outdent()

        self._cache.writemulti(cacheId, meta)
        return meta


    def getOptionals(self, include):
        result = []

        for classId in include:
            try:
                for optional in self.getMeta(classId)["optionalDeps"]:
                    if not optional in include and not optional in result:
                        result.append(optional)

            # Not all meta data contains optional infos
            except KeyError:
                continue

        return result


