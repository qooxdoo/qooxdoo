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

import os, sys, re, types, codecs
from misc                           import util, filetool
from ecmascript.frontend            import treeutil, tokenizer, treegenerator, lang
from ecmascript.frontend.Script import Script
from ecmascript.transform.optimizer import variantoptimizer
from generator.resource.AssetHint   import AssetHint
from generator.resource.Resource    import Resource

DefaultIgnoredNamesDynamic = None
QXGLOBALS = [
    #"clazz",
    "qxvariants",
    "qxsettings",
    r"qx\.\$\$",    # qx.$$domReady, qx.$$libraries, ...
    ]

_memo1_ = {}  # for memoizing getScript()
_memo2_ = [None, None]

GlobalSymbolsCombinedPatt = re.compile('|'.join(r'^%s\b' % x for x in lang.GLOBALS + QXGLOBALS))

class Class(Resource):

    def __init__(self, id, path, library, context, container):
        #__slots__       = ('id', 'path', 'size', 'encoding', 'library', 'context', 'source', 'scopes', 'translations')
        global console, cache, DefaultIgnoredNamesDynamic
        super(Class, self).__init__(path)
        self.id         = id   # qooxdoo name of class, classId
        self.library    = library     # Library()
        self.context    = context
        self._classesObj= container   # this is ugly, but curr. used to identify known names
        self.size       = -1
        self.encoding   = 'utf-8'
        self.source     = u''  # source text of this class
        #self.ast        = None # ecmascript.frontend.tree instance
        self.scopes     = None # an ecmascript.frontend.Script instance
        self.translations = {} # map of translatable strings in this class
        self.resources  = set() # set of resource objects needed by the class
        self._assetRegex= None  # regex from #asset hints, for resource matching

        console = context["console"]
        cache   = context["cache"]

        DefaultIgnoredNamesDynamic = [lib["namespace"] for lib in self.context['jobconf'].get("library", [])]


    # --------------------------------------------------------------------------
    #   Tree Interface
    # --------------------------------------------------------------------------

    def _getSourceTree(self, cacheId):
        tradeSpaceForSpeed = False

        # Lookup for unoptimized tree
        tree = cache.read(cacheId, self.path, memory=tradeSpaceForSpeed)

        # Tree still undefined?, create it!
        if tree == None:
            console.debug("Parsing file: %s..." % self.id)
            console.indent()

            fileContent = filetool.read(self.path, self.encoding)
            tokens = tokenizer.parseStream(fileContent, self.id)
            
            console.outdent()
            console.debug("Generating tree: %s..." % self.id)
            console.indent()
            tree = treegenerator.createSyntaxTree(tokens)  # allow exceptions to propagate

            # store unoptimized tree
            #print "Caching %s" % cacheId
            cache.write(cacheId, tree, memory=tradeSpaceForSpeed, writeToFile=True)

            console.outdent()
        return tree


    def tree(self, variantSet={}):
        context = self.context
        tradeSpaceForSpeed = False  # Caution: setting this to True seems to make builds slower, at least on some platforms!?

        # Construct the right cache id
        unoptCacheId     = "tree-%s-%s" % (self.path, util.toString({}))

        classVariants    = []
        tree             = None
        classVariants    = getClassVariants(self.id, self.path, None, context["cache"], context["console"], generate=False) # just check the cache
        if classVariants == None:
            tree = self._getSourceTree(unoptCacheId)
            classVariants= getClassVariantsFromTree(tree, context["console"])

        relevantVariants = projectClassVariantsToCurrent(classVariants, variantSet)
        cacheId          = "tree-%s-%s" % (self.path, util.toString(relevantVariants))

        # Get the right tree to return
        if cacheId == unoptCacheId and tree:  # early return optimization
            return tree

        opttree = context["cache"].read(cacheId, self.path, memory=tradeSpaceForSpeed)
        if not opttree:
            # start from source tree
            if tree:
                opttree = tree
            else:
                opttree = self._getSourceTree(unoptCacheId)
            # do we have to optimze?
            if cacheId == unoptCacheId:
                return opttree
            else:
                context["console"].debug("Selecting variants: %s..." % self.id)
                context["console"].indent()
                variantoptimizer.search(opttree, variantSet, self.id)
                context["console"].outdent()
                # store optimized tree
                #print "Caching %s" % cacheId
                context["cache"].write(cacheId, opttree, memory=tradeSpaceForSpeed, writeToFile=True)

        return opttree


    # --------------------------------------------------------------------------
    #   Variant Support
    # --------------------------------------------------------------------------

    ##
    # look for places where qx.core.Variant.select|isSet|.. are called
    # and return the list of first params (the variant name)
    # @cache

    def classVariants(self, generate=True):

        cache     = self.context["cache"]
        cacheId   = "class-%s" % (self.path,)
        classinfo = cache.readmulti(cacheId, self.path)
        classvariants = None
        if classinfo == None or 'svariants' not in classinfo:  # 'svariants' = supported variants
            if generate:
                tree = self.tree({})  # get complete tree
                classvariants = getClassVariantsFromTree(tree, self.context["console"])       # get variants used in qx.core.Variant...(<variant>,...)
                if classinfo == None:
                    classinfo = {}
                classinfo['svariants'] = classvariants
                cache.writemulti(cacheId, classinfo)
        else:
            classvariants = classinfo['svariants']

        return classvariants

    # --------------------------------------------------------------------------
    #   Compile Interface
    # --------------------------------------------------------------------------

    def _getAst(self):
        pass

    ast = property(_getAst)

    def getCode(self, compile_options=None, variants=None, source_with_comments=False):
        result = u''
        # source versions
        if not compile_options:
            result = filetool.read(self.path)
            if not source_with_comments:
                result = strip_comments(result)
        # compiled versions
        else:
            tree = self.optimize(self.ast, compile_options, variants)
            result =compiler.compile(tree)
        return result

    # --------------------------------------------------------------------------
    #   Dependencies Interface
    # --------------------------------------------------------------------------

    ##
    # Interface method
    #
    # return all dependencies of class from its code (both meta hints as well
    # as source code)

    def dependencies(self, variantSet):

        ##
        # get deps from meta info and class code
        #
        # Notes:
        # load time = before class = require
        # run time  = after class  = use
        def buildShallowDeps():

            load   = []
            run    = []
            ignore = [DependencyItem(x,-1) for x in DefaultIgnoredNamesDynamic]

            console.debug("Analyzing tree: %s" % self.id)
            console.indent()

            # Read meta data
            meta         = self.getHints()
            metaLoad     = meta.get("loadtimeDeps", [])
            metaRun      = meta.get("runtimeDeps" , [])
            metaOptional = meta.get("optionalDeps", [])
            metaIgnore   = meta.get("ignoreDeps"  , [])

            # Process meta data
            load.extend(DependencyItem(x,-1) for x in metaLoad)
            run.extend(DependencyItem(x,-1) for x in metaRun)
            ignore.extend(DependencyItem(x,-1) for x in metaIgnore)

            # Read source tree data
            (treeLoad, treeRun) = ([], [])  # will be filled by _analyzeClassDepsNode
            self._analyzeClassDepsNode(self.tree(variantSet), treeLoad, treeRun, inFunction=False, variants=variantSet)
            
            # Process source tree data
            if not "auto-require" in metaIgnore:
                for dep in treeLoad:
                    item = dep.name
                    if item in metaOptional:
                        pass
                    elif item in metaLoad:
                        console.warn("%s: #require(%s) is auto-detected" % (self.id, item))
                    else:
                        # force uniqueness on the class name
                        if item not in (x.name for x in load):
                            load.append(dep)

            if not "auto-use" in metaIgnore:
                for dep in treeRun:
                    item = dep.name
                    if item in metaOptional:
                        pass
                    elif item in (x.name for x in load):
                        pass
                    elif item in metaRun:
                        console.warn("%s: #use(%s) is auto-detected" % (self.id, item))
                    else:
                        # force uniqueness on the class name
                        if item not in (x.name for x in run):
                            run.append(dep)

            console.outdent()

            # Build data structure
            deps = {
                "load"   : load,
                "run"    : run,
                "ignore" : ignore,
            }

            return deps

        # -- Main ---------------------------------------------------------

        # handles cache and invokes worker function

        classVariants    = self.classVariants()
        relevantVariants = projectClassVariantsToCurrent(classVariants, variantSet)
        cacheId          = "deps-%s-%s" % (self.path, util.toString(relevantVariants))
        cached           = True

        deps = cache.readmulti(cacheId, self.path)
        if deps == None:
            cached = False
            deps = buildShallowDeps()
            cache.writemulti(cacheId, deps)
        
        return deps, cached

        # end:dependencies()


    # -- all methods below this line up to _analyzeClassDepsNode() are only used by that -------------------
    
    def checkDeferNode(self, assembled, node):
        deferNode = None
        if assembled == "qx.Class.define" or assembled == "qx.Bootstrap.define" or assembled == "qx.List.define":
            if node.hasParentContext("call/operand"):
                deferNode = treeutil.selectNode(node, "../../params/2/keyvalue[@key='defer']/value/function/body/block")
        return deferNode


    def isUnknownClass(self, assembled, node, fileId):
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
        
    def addDep(self, depsItem, inFunction, runtime, loadtime):
        if inFunction:
            target = runtime
        else:
            target = loadtime

        if not depsItem in target:
            target.append(depsItem)

        return


    def followCallDeps(self, node, fileId, className):
        if (className
            and className in self._classesObj  # we have a class id
            and className != fileId
            and self.context['jobconf'].get("dependencies/follow-static-initializers", False)
            and (
                node.hasParentContext("keyvalue/value/call/operand")  # it's a method call as map value
                or node.hasParentContext("keyvalue/value/instantiation/expression/call/operand")  # it's an instantiation as map value
            )
           ):
            return True
        return False


    ##
    # analyze a class AST for dependencies (compiler hints not treated here)
    # does not follow dependencies to other classes (ie. it's a "shallow" analysis)!
    # the "variants" param is only to support getMethodDeps()!
    #
    # i tried an iterative version once, wrapping the main function body into a
    # loop over treeutil.nodeIteratorNonRec(); surprisingly, it seem slightly
    # slower than the recursive version on first measurements; also, it still
    # needed a recursive call when coming across a 'defer' node, and i'm not
    # sure how to handle this sub-recursion when the main body is an iteration.
    def _analyzeClassDepsNode(self, node, loadtime, runtime, inFunction, variants):

        fileId = self.id

        if node.type == "variable":
            assembled = (treeutil.assembleVariable(node))[0]

            # treat dependencies in defer as requires
            deferNode = self.checkDeferNode(assembled, node)
            if deferNode != None:
                self._analyzeClassDepsNode(deferNode, loadtime, runtime, False, variants)

            (context, className, classAttribute) = self._isInterestingReference(assembled, node, fileId)
            # postcond: 
            # - if className != '' it is an interesting reference
            # - might be a known qooxdoo class, or an unknown class (use 'className in self._classes')
            # - if assembled contained ".", classAttribute will contain approx. non-class part

            if className:
                # we allow self-references, to be able to track method dependencies within the same class
                if className == 'this':
                    className = fileId
                #print "-- adding: %s (%s:%s)" % (className, treeutil.getFileFromSyntaxItem(node), node.get('line',False))
                depsItem = DependencyItem(className, node.get('line', -1), classAttribute)
                self.addDep(depsItem, inFunction, runtime, loadtime)

                # an attempt to fix static initializers (bug#1455)
                if not inFunction and self.followCallDeps(node, fileId, className):
                    console.debug("Looking for rundeps in call to '%s' of '%s'(%d)" % (assembled, fileId, depsItem.line))
                    console.indent()
                    # getMethodDeps is mutual recursive calling into the current
                    # function, but only does so with inFunction=True, so this
                    # branch is never hit through the recursive call
                    ldeps = self.getMethodDeps(depsItem, variants)
                    loadtime.extend([x for x in ldeps if x not in loadtime]) # add uniquely
                    console.outdent()

        elif node.type == "body" and node.parent.type == "function":
            inFunction = True

        if node.hasChildren():
            for child in node.children:
                self._analyzeClassDepsNode(child, loadtime, runtime, inFunction, variants)

        return

        # end:_analyzeClassDepsNode


    def _isInterestingReference(self, assembled, node, fileId):

        def checkNodeContext(node):
            context = 'interesting' # every context is interesting, mybe we get more specific
            #context = ''

            # filter out the occurrences like 'c' in a.b().c
            myFirst = node.getFirstChild(mandatory=False, ignoreComments=True)
            if not treeutil.checkFirstChainChild(myFirst): # see if myFirst is the first identifier in a chain
                context = ''

            # filter out ... = position (lvals) - Nope! (qx.ui.form.ListItem.prototype.setValue = 
            # function(..){...};)
            #elif (node.hasParentContext("assignment/left")):
            #    context = ''

            # check name in 'new ...' position
            elif (node.hasParentContext("instantiation/*/*/operand")):
                context = 'new'

            # check name in call position
            elif (node.hasParentContext("call/operand")):
                context = 'call'

            # check name in "'extend' : ..." position
            elif (node.hasParentContext("keyvalue/*") and node.parent.parent.get('key') in ['extend']): #, 'include']):
                #print "-- found context: %s" % node.parent.parent.get('key')
                context = 'extend'

            return context

        def isInterestingIdentifier(assembled):
            # accept 'this', as we want to track dependencies within the same class
            if assembled[:3] == "this":
                if len(assembled) == 4 or (len(assembled) > 4 and assembled[4] == "."):
                    return True
            # skip built-in classes (Error, document, RegExp, ...); GLOBALS contains 'this' and 'arguments'
            if GlobalSymbolsCombinedPatt.search(assembled):
                return False
            # skip scoped vars - expensive, therefore last test
            elif self._isScopedVar(assembled, node, fileId):
                return False
            else:
                return True

        def attemptSplitIdentifier(context, assembled):
            # try qooxdoo classes first
            className, classAttribute = self._splitQxClass(assembled)
            if className:
                return className, classAttribute
            
            className, classAttribute = assembled, ''
            # now handle non-qooxdoo classes
            if context == 'new':
                className = assembled
            elif context == 'extend':
                className = assembled
            elif context == 'call':
                lastDotIdx = assembled.rfind('.')
                if lastDotIdx > -1:
                    className   = assembled[:lastDotIdx]
                    classAttribute = assembled[lastDotIdx + 1:]
                else:
                    className = assembled

            return className, classAttribute

        # ---------------------------------------------------------------------
        context = nameBase = nameExtension = ''
        context = checkNodeContext(node)
        if context: 
            if isInterestingIdentifier(assembled): # filter some local or build-in names
                nameBase, nameExtension = attemptSplitIdentifier(context, assembled)

        return context, nameBase, nameExtension

        # end:_isInterestingReference()


    ##
    # this supersedes reduceAssembled(), improving the return value
    def _splitQxClass(self, assembled):
        className = classAttribute = ''
        if assembled in self._classesObj:  # short cut
            className = assembled
        elif "." in assembled:
            for entryId in self._classesObj:
                if assembled.startswith(entryId) and re.match(r'%s\b' % entryId, assembled):
                    if len(entryId) > len(className): # take the longest match
                        className      = entryId
                        classAttribute = assembled[ len(entryId) +1 :]  # skip entryId + '.'
        return className, classAttribute


    def _isScopedVar(self, idStr, node, fileId):

        def findScopeNode(node):
            node1 = node
            sNode = None
            while not sNode:
                if node1.type in ["function", "catch"]:
                    sNode = node1
                if node1.hasParent():
                    node1 = node1.parent
                else:
                    break # we're at the root
            if not sNode:
                sNode = node1 # use root node
            return sNode

        def findRoot(node):
            rnode = node
            while rnode.hasParent():
                rnode = rnode.parent
            return rnode

        def getScript(node, fileId, ):
            # TODO: checking the root nodes is a fix, as they sometimes differ (prob. caching)
            rootNode = findRoot(node)
            #if fileId in _memo1_:
            #if fileId in _memo1_ and _memo1_[fileId].root == rootNode:
            #    script = _memo1_[fileId]
            #if _memo2_[0] == fileId: # replace with '_memo2_[0] == rootNode', to make it more robust, but slightly less performant
            if _memo2_[0] == rootNode:
                #print "-- re-using scopes for: %s" % fileId
                script = _memo2_[1]
            else:
                #rootNode = findRoot(node)
                #if fileId in _memo1_ and _memo1_[fileId].root != rootNode:
                #print "-- re-calculating scopes for: %s" % fileId
                script = Script(rootNode, fileId)
                #_memo1_[fileId] = script
                #_memo2_[0], _memo2_[1] = fileId, script
                _memo2_[0], _memo2_[1] = rootNode, script
            return script

        def getLeadingId(idStr):
            leadingId = idStr
            dotIdx = idStr.find('.')
            if dotIdx > -1:
                leadingId = idStr[:dotIdx]
            return leadingId

        # check composite id a.b.c, check only first part
        idString = getLeadingId(idStr)
        script   = getScript(node, fileId)

        scopeNode = findScopeNode(node)  # find the node of the enclosing scope (function - catch - global)
        if scopeNode == script.root:
            fcnScope = script.getGlobalScope()
        else:
            fcnScope  = script.getScope(scopeNode)
        #assert fcnScope != None, "idString: '%s', idStr: '%s', fileId: '%s'" % (idString, idStr, fileId)
        varDef = script.getVariableDefinition(idString, fcnScope)
        if varDef:
            return True
        return False

        # end:_isScopedVar()


    # --------------------------------------------------------------------------
    #   I18N Support
    # --------------------------------------------------------------------------

    ##
    # returns array of message dicts [{method:, line:, column:, hint:, id:, plural:},...]
    def messageStrings(self, variants):
        # this duplicates codef from Locale.getTranslation
        
        classVariants     = self.classVariants()
        relevantVariants  = projectClassVariantsToCurrent(classVariants, variants)
        variantsId        = util.toString(relevantVariants)

        cacheId = "messages-%s-%s" % (self.path, variantsId)

        messages = cache.readmulti(cacheId, self.path)
        if messages != None:
            return messages

        console.debug("Looking for message strings: %s..." % self.id)
        console.indent()

        tree = self.tree(variants)

        #try:
        if True:
            messages = self._findTranslationBlocks(tree, [])
        #except NameError, detail:
        #    raise RuntimeError("Could not extract message strings from %s!\n%s" % (self.id, detail))

        if len(messages) > 0:
            console.debug("Found %s message strings" % len(messages))

        console.outdent()
        cache.writemulti(cacheId, messages)

        return messages


    def _findTranslationBlocks(self, node, messages):
        if node.type == "call":
            oper = node.getChild("operand", False)
            if oper:
                var = oper.getChild("variable", False)
                if var:
                    varname = (treeutil.assembleVariable(var))[0]
                    for entry in [ ".tr", ".trn", ".trc", ".marktr" ]:
                        if varname.endswith(entry):
                            self._addTranslationBlock(entry[1:], messages, node, var)
                            break

        if node.hasChildren():
            for child in node.children:
                self._findTranslationBlocks(child, messages)

        return messages

     
    def _addTranslationBlock(self, method, data, node, var):
        entry = {
            "method" : method,
            "line"   : node.get("line"),
            "column" : node.get("column")
        }

        # tr(msgid, args)
        # trn(msgid, msgid_plural, count, args)
        # trc(hint, msgid, args)
        # marktr(msgid)

        if method == "trn" or method == "trc": minArgc=2
        else: minArgc=1

        params = node.getChild("params", False)
        if not params or not params.hasChildren():
            raise NameError("Invalid param data for localizable string method at line %s!" % node.get("line"))

        if len(params.children) < minArgc:
            raise NameError("Invalid number of parameters %s at line %s" % (len(params.children), node.get("line")))

        strings = []
        for child in params.children:
            if child.type == "commentsBefore":
                continue

            elif child.type == "constant" and child.get("constantType") == "string":
                strings.append(child.get("value"))

            elif child.type == "operation":
                strings.append(self._concatOperation(child))

            elif len(strings) < minArgc:
                console.warn("Unknown expression as argument to translation method at line %s" % (child.get("line"),))

            # Ignore remaining (run time) arguments
            if len(strings) == minArgc:
                break

        lenStrings = len(strings)
        if lenStrings > 0:
            if method == "trc":
                entry["hint"] = strings[0]
                if lenStrings > 1 and strings[1]:  # msgid must not be ""
                    entry["id"]   = strings[1]
            else:
                if strings[0]:
                    entry["id"] = strings[0]

            if method == "trn" and lenStrings > 1:
                entry["plural"] = strings[1]

        # register the entry only if we have a proper key
        if "id" in entry:
            data.append(entry)

        return





    # --------------------------------------------------------------------------
    #   Resource Support
    # --------------------------------------------------------------------------

    def getAssets(self, assetMacros={}):

        if self._assetRegex == None:
            # prepare a regex encompassing all asset hints, asset macros resolved
            classAssets = self.getHints()['assetDeps'][:]
            iresult  = []  # [AssetHint]
            for res in classAssets:
                # expand file glob into regexp
                res = re.sub(r'\*', ".*", res)
                # expand macros
                if res.find('${')>-1:
                    expres = self._expandMacrosInMeta(assetMacros, res)
                else:
                    expres = [res]
                # collect resulting asset objects
                for e in expres:
                    assethint = AssetHint(res)
                    assethint.clazz = self
                    assethint.expanded = e
                    assethint.regex = re.compile(e)
                    if assethint not in iresult:
                        iresult.append(assethint)
            self._assetRegex = iresult

        return self._assetRegex


    ##
    # expand asset macros in asset strings, like "qx/decoration/${theme}/*"
    def _expandMacrosInMeta(self, assetMacros, res):
        
        def expMacRec(rsc):
            if rsc.find('${')==-1:
                return [rsc]
            result = []
            nres = rsc[:]
            mo = re.search(r'\$\{(.*?)\}',rsc)
            if mo:
                themekey = mo.group(1)
                if themekey in assetMacros:
                    # create an array with all possibly variants for this replacement
                    iresult = []
                    for val in assetMacros[themekey]:
                        iresult.append(nres.replace('${'+themekey+'}', val))
                    # for each variant replace the remaining macros
                    for ientry in iresult:
                        result.extend(expMacRec(ientry))
                else:
                    nres = nres.replace('${'+themekey+'}','') # just remove '${...}'
                    nres = nres.replace('//', '/')    # get rid of '...//...'
                    result.append(nres)
                    console.warn("Warning: (%s): Cannot replace macro '%s' in #asset hint" % (self.id, themekey))
            else:
                raise SyntaxError, "Non-terminated macro in string: %s" % rsc
            return result

        result = expMacRec(res)
        return result


    # --------------------------------------------------------------------------
    #   Compiler Hints Support
    # --------------------------------------------------------------------------

    HEAD = {
        "require"  : re.compile(r"^\s* \#require  \(\s* (%s+)     \s*\)" % lang.IDENTIFIER_CHARS, re.M|re.X),
        "use"      : re.compile(r"^\s* \#use      \(\s* (%s+)     \s*\)" % lang.IDENTIFIER_CHARS, re.M|re.X),
        "optional" : re.compile(r"^\s* \#optional \(\s* (%s+)     \s*\)" % lang.IDENTIFIER_CHARS, re.M|re.X),
        "ignore"   : re.compile(r"^\s* \#ignore   \(\s* (%s+)     \s*\)" % lang.IDENTIFIER_CHARS, re.M|re.X),
        "asset"    : re.compile(r"^\s* \#asset    \(\s* ([^)]+?)  \s*\)"                        , re.M|re.X),
        "cldr"     : re.compile(r"^\s*(\#cldr) (?:\(\s* ([^)]+?)  \s*\))?"                      , re.M|re.X),
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

        # ----------------------------------------------------------

        fileEntry = self
        filePath = fileEntry.path
        fileId   = self.id
        cacheId = "meta-%s" % filePath

        meta = cache.readmulti(cacheId, filePath)
        if meta != None:
            if metatype:
                return meta[metatype]
            else:
                return meta

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

        console.outdent()

        cache.writemulti(cacheId, meta)

        if metatype:
            return meta[metatype]
        else:
            return meta


    def getOptionals(self, includeWithDeps):
        result = []

        for classId in includeWithDeps:
            try:
                for optional in self.getHints(classId)["optionalDeps"]:
                    if not optional in includeWithDeps and not optional in result:
                        result.append(optional)

            # Not all meta data contains optional infos
            except KeyError:
                continue

        return result

    ######################################################################
    #  METHOD DEPENDENCIES SUPPORT
    ######################################################################

    ##
    # find all run time dependencies of a given method, recursively
    #
    # this is supposed to be an improved version of getMethodDeps() that should be really
    # exhaustive (and therefore reliable):
    # - get the immediate runtime dependencies of the current method; for each of those dependencies:
    # - if it is a "<name>.xxx" method/attribute:
    #   - add this class#method dependency  (class symbol is required, even if the method is defined by super class)
    #   - find the defining class (<name>, ancestor of <name>, or mixin of <name>): findClassForMethod()
    #   - add defining class to dependencies (class symbol is required for inheritance)
    #   - recurse on dependencies of defining class#method, adding them to the current dependencies
    #
    # currently only a thin wrapper around its recursive sibling, getMethodDepsR

    def getMethodDeps(self, depsItem, variants):

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
            elif clazzId not in self._classesObj: # can't further process non-qooxdoo classes
                return None, None

            tree = self._classesObj[clazzId].tree( variants)
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
        # add to global result set sanely
        def resultAdd(depsItem, result):
            # cyclic check
            if depsItem in result:
                console.debug("Class.method already seen, skipping: %s#%s" % (depsItem.name, depsItem.attribute))
                return False
            result.append(depsItem)
            return True


        ##
        # find dependencies of a method <methodId> that has been referenced from
        # <classId>. recurse on the immediate dependencies in the method code.
        #
        # @param deps accumulator variable set((c1,m1), (c2,m2),...)
        #
        # returns a set of pairs each representing a signature (classId,
        # methodId)

        def getMethodDepsR(depsItem, variants, globalResult):
            # We don't add the in-param to the global result
            classId = depsItem.name
            methodId= depsItem.attribute

            console.debug("%s#%s dependencies:" % (classId, methodId))
            console.indent()

            # Calculate deps

            # find the defining class
            defClassId, attribNode = findClassForMethod(classId, methodId, variants)

            # lookup error
            if not defClassId:
                console.warn("Skipping unknown class dependency: %s#%s" % (defClassId, methodId))
                return
            
            defDepsItem = DependencyItem(defClassId, -1, methodId)  # not sure about methodId, but the class is important
            # method of super class/mixin
            if defClassId != classId:
                resultAdd(defDepsItem, globalResult)


            # Get the method's immediate deps
            deps_rt = []
            deps_lt = []

            # TODO: is this the right API?!
            self._analyzeClassDepsNode(attribNode, deps_lt, deps_rt, True, variants)

            assert not deps_lt

            for depsItem in deps_rt:
                if resultAdd(depsItem, globalResult):

                    # Recurse dependencies
                    assert depsItem.name in self._classesObj
                    getMethodDepsR(depsItem, variants, globalResult)

            console.outdent()
            return


        # -- Main --------------------------------------------------------------

        #print "- running getMethodDeps for", depsItem
        deps = []
        getMethodDepsR(depsItem, variants, deps)
        #print "  ", deps

        return deps




class DependencyItem(object):
    __slots__ = ('name', 'attribute', 'line')
    def __init__(self, name, line, attribute=''):
        self.name = name            # e.g. "qx.Class"
        self.attribute = attribute  # e.g. "define"
        self.line = line            # source line in referencing file
    def __repr__(self):
        return "<DepItem>:" + self.name + "#" + self.attribute
    def __str__(self):
        return self.name + "#" + self.attribute
    def __eq__(self, other):
        return self.name == other.name and self.attribute == other.attribute
    def __hash__(self):
        return hash(self.name + self.attribute)


# -- temp. module helper functions ---------------------------------------------


##
# only return those keys from <variantSet> that are supported
# in <classVariants>

def projectClassVariantsToCurrent(classVariants, variantSet):
    res = {}
    for key in variantSet:
        if key in classVariants:
            res[key] = variantSet[key]
    return res


##
# helper that operates on ecmascript.frontend.tree
def getClassVariantsFromTree(node, console):
    classvariants = set([])
    # mostly taken from ecmascript.transform.optimizer.variantoptimizer
    variants = treeutil.findVariablePrefix(node, "qx.core.Variant")
    for variant in variants:
        if not variant.hasParentContext("call/operand"):
            continue
        variantMethod = treeutil.selectNode(variant, "identifier[4]/@name")
        if variantMethod not in ["select", "isSet", "compilerIsSet"]:
            continue
        firstParam = treeutil.selectNode(variant, "../../params/1")
        if firstParam and treeutil.isStringLiteral(firstParam):
            classvariants.add(firstParam.get("value"))
        else:
            console.warn("! qx.core.Variant call without literal argument")

    return classvariants

##
# look for places where qx.core.Variant.select|isSet|.. are called
# and return the list of first params (the variant name)
# @cache

def getClassVariants(fileId, filePath, treeLoader, cache, console, generate=True):

    cacheId   = "class-%s" % (filePath,)
    classinfo = cache.readmulti(cacheId, filePath)
    classvariants = None
    if classinfo == None or 'svariants' not in classinfo:  # 'svariants' = supported variants
        if generate:
            tree = treeLoader.getTree(fileId, {})  # get complete tree
            classvariants = getClassVariantsFromTree(tree, console)       # get variants used in qx.core.Variant...(<variant>,...)
            if classinfo == None:
                classinfo = {}
            classinfo['svariants'] = classvariants
            cache.writemulti(cacheId, classinfo)
    else:
        classvariants = classinfo['svariants']

    return classvariants

