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
# generator.code.Class Mixin: class code (tree and compile)
##

import sys, os, types, re, string, copy
import optparse 
from ecmascript.backend.Packer      import Packer
from ecmascript.backend             import pretty
from ecmascript.frontend import treeutil, tokenizer, treegenerator
from ecmascript.transform.optimizer import variantoptimizer, variableoptimizer, commentoptimizer
from ecmascript.transform.optimizer import stringoptimizer, basecalloptimizer, privateoptimizer
from misc import util, filetool


class MClassCode(object):

    # --------------------------------------------------------------------------
    #   Tree Interface
    # --------------------------------------------------------------------------

    def tree(self, variantSet={}, treegen=treegenerator):
        context = self.context
        cache   = context['cache']
        tradeSpaceForSpeed = False  # Caution: setting this to True seems to make builds slower, at least on some platforms!?

        # Construct the right cache id
        unoptCacheId     = "tree%s-%s-%s" % (treegen.tag, self.path, util.toString({}))

        classVariants    = []
        tree             = None
        classVariants    = self.classVariants(generate=False) # just check the cache
        if classVariants == None:
            tree = self._getSourceTree(unoptCacheId, tradeSpaceForSpeed, treegen)
            classVariants= self._variantsFromTree(tree)

        relevantVariants = self.projectClassVariantsToCurrent(classVariants, variantSet)
        cacheId          = "tree%s-%s-%s" % (treegen.tag, self.path, util.toString(relevantVariants))

        # Get the right tree to return
        if cacheId == unoptCacheId and tree:  # early return optimization
            return tree

        opttree, cacheMod = cache.read(cacheId, self.path, memory=tradeSpaceForSpeed)
        if not opttree:
            # start from source tree
            if tree:
                opttree = tree
            else:
                opttree = self._getSourceTree(unoptCacheId, tradeSpaceForSpeed, treegen)
            # do we have to optimze?
            if cacheId == unoptCacheId:
                return opttree
            else:
                context["console"].debug("Selecting variants: %s..." % self.id)
                context["console"].indent()
                variantoptimizer.search(opttree, variantSet, self.id)
                context["console"].outdent()
                cache.write(cacheId, opttree, memory=tradeSpaceForSpeed, writeToFile=True)

        return opttree


    def _getSourceTree(self, cacheId, tradeSpaceForSpeed, treegen):

        cache = self.context['cache']
        console = self.context['console']

        # Lookup for unoptimized tree
        tree, _ = cache.read(cacheId, self.path, memory=tradeSpaceForSpeed)

        # Tree still undefined?, create it!
        if tree == None:
            console.debug("Parsing file: %s..." % self.id)
            console.indent()

            fileContent = filetool.read(self.path, self.encoding)
            tokens = tokenizer.parseStream(fileContent, self.id)
            
            console.outdent()
            console.debug("Generating tree: %s..." % self.id)
            console.indent()
            tree = treegen.createSyntaxTree(tokens)  # allow exceptions to propagate

            # store unoptimized tree
            #print "Caching %s" % cacheId
            cache.write(cacheId, tree, memory=tradeSpaceForSpeed, writeToFile=True)

            console.outdent()
        return tree


    # --------------------------------------------------------------------------
    #   Variant Support
    # --------------------------------------------------------------------------

    ##
    # Return the list of variant keys (like "qx.debug") used in the source of
    # this class. Uses the plain source syntax tree and _variantsFromTree, and
    # caches to classCache.
    # Is used internally, but should also be usable as public interface.
    # 
    # @param generate {Boolean} whether to calculate the variant uses of the class
    #   afresh from the tree when they are not cached
    # @return {[String]} list of variant keys, e.g. ["qx.debug", ...]
    #
    def classVariants(self, generate=True):

        classinfo, _ = self._getClassCache()
        classvariants = None
        if classinfo == None or 'svariants' not in classinfo:  # 'svariants' = supported variants
            if generate:
                tree = self.tree({})  # get complete tree
                classvariants = self._variantsFromTree(tree) # get list of variant keys
                if classinfo == None:
                    classinfo = {}
                classinfo['svariants'] = classvariants
                self._writeClassCache (classinfo)
        else:
            classvariants = classinfo['svariants']

        return classvariants

    ##
    # Calculate uses of qx.core.Environment.select|get|... from the source tree.
    # This helper is used by both, tree() and classVariants(), to resolve mutual
    # recursion between them.
    #
    # @param  node {ecmascript.frontend.tree.Node} syntax tree to inspect (e.g.
    #   a file or class map)
    # @return {[String]}  list of variant keys, e.g. ["qx.debug", ...]
    #
    def _variantsFromTree(self, node):
        console = self.context['console']
        classvariants = set()
        for variantNode in variantoptimizer.findVariantNodes(node):
            firstParam = treeutil.selectNode(variantNode, "../../params/1")
            if firstParam:
                if treeutil.isStringLiteral(firstParam):
                    classvariants.add(firstParam.get("value"))
                elif firstParam.type == "map": # e.g. .filter() method
                    mapMap = treeutil.mapNodeToMap(firstParam)
                    classvariants.update(mapMap.keys())
                else:
                    console.warn("qx.core.Environment call with alien first argument (%s:%s)" % (self.id, variantNode.get("line", False)))
        return classvariants


    ##
    # Only return those key:value pairs from <variantSet> that are supported
    # in <classVariants>.
    # 
    # @param classVariants {[String]} list of variant keys used in a class
    # @param variantSet {Map} map of variant key:value's used in current build
    # @return {Map} map of variant key:value's relevant for given class
    @staticmethod
    def projectClassVariantsToCurrent(classVariants, variantSet):
        res = dict([(key,val) for key,val in variantSet.iteritems() if key in classVariants])
        return res


    # --------------------------------------------------------------------------
    #   Compile Interface
    # --------------------------------------------------------------------------

    ##
    # Interface method: selects the right code version to return
    def getCode(self, compOptions, treegen=treegenerator):

        result = u''
        # source versions
        if not compOptions.optimize:
            result = filetool.read(self.path)
            if result[-1:] != "\n": # assure trailing \n
                result += '\n'
        # compiled versions
        else:
            result = self._getCompiled(compOptions, treegen)

        return result

    ##
    # Checking the cache for the appropriate code, and pot. invoking ecmascript.backend
    def _getCompiled(self, compOptions, treegen):

        ##
        # Interface to ecmascript.backend
        def serializeCondensed(tree, format_=False):
            result = [u'']
            result =  Packer().serializeNode(tree, None, result, format_)
            return u''.join(result)

        def serializeFormatted(tree):
            # provide minimal pretty options
            def options(): pass
            pretty.defaultOptions(options)
            options.prettypCommentsBlockAdd = False  # turn off comment filling

            result = [u'']
            result = pretty.prettyNode(tree, options, result)

            return u''.join(result)

        # ----------------------------------------------------------------------

        optimize          = compOptions.optimize
        variants          = compOptions.variantset
        format_           = compOptions.format
        classVariants     = self.classVariants()
        relevantVariants  = self.projectClassVariantsToCurrent(classVariants, variants)
        variantsId        = util.toString(relevantVariants)
        optimizeId        = self._optimizeId(optimize)
        cache             = self.context["cache"]

        # Caution: Sharing cache id with TreeCompiler
        cacheId = "compiled-%s-%s-%s-%s" % (self.path, variantsId, optimizeId, format_)
        compiled, _ = cache.read(cacheId, self.path)

        if compiled == None:
            tree   = self.tree(variants, treegen=treegen)
            tree   = self.optimize(tree, optimize)
            if optimize == ["comments"]:
                compiled = serializeFormatted(tree)
                if compiled[-1:] != "\n": # assure trailing \n
                    compiled += '\n'
            else:
                compiled = serializeCondensed(tree, format_)
            cache.write(cacheId, compiled)

        return compiled


    ##
    # Create an id from the optimize list
    def _optimizeId(self, optimize):
        optimize = copy.copy(optimize)
        optimize.sort()
        return "[%s]" % ("-".join(optimize))


    def optimize(self, tree, optimize=[], featureMap={}):

        def load_privates():
            cacheId  = privateoptimizer.privatesCacheId
            privates, _ = cache.read(cacheId, keepLock=True)
            if privates == None:
                privates = {}
            return privates

        def write_privates(globalprivs):
            cacheId  = privateoptimizer.privatesCacheId
            cache.write(cacheId, globalprivs)  # removes lock by default

        # -----------------------------------------------------------------------------

        if not optimize:
            return tree
        
        cache = self.context['cache']
        console = self.context['console']

        if ["comments"] == optimize:
            # do a mere comment stripping
            commentoptimizer.patch(tree)
            return tree

        # 'statics' has to come before 'privates', as it needs the original key names in tree
        if "statics" in optimize:
            if not featureMap:
                console.warn("Empty feature map passed to static methods optimization; skipping")
            elif self.type == 'static' and self.id in featureMap:
                featureoptimizer.patch(tree, self.id, featureMap[self.id])

        if "basecalls" in optimize:
            basecalloptimizer.patch(tree)

        if "privates" in optimize:
            privatesMap = load_privates()
            privateoptimizer.patch(tree, id, privatesMap)
            write_privates(privatesMap)

        if "strings" in optimize:
            tree = self._stringOptimizer(tree)

        if "variables" in optimize:
            variableoptimizer.search(tree)

        return tree


    def _stringOptimizer(self, tree):
        stringMap = stringoptimizer.search(tree)

        if len(stringMap) == 0:
            return tree

        stringList = stringoptimizer.sort(stringMap)
        stringoptimizer.replace(tree, stringList)

        # Build JS string fragments
        stringStart = "(function(){"
        stringReplacement = stringoptimizer.replacement(stringList)
        stringStop = "})();"

        # Compile wrapper node
        wrapperNode = treeutil.compileString(stringStart+stringReplacement+stringStop, self.id + "||stringopt")

        # Reorganize structure
        funcBody = wrapperNode.getChild("operand").getChild("group").getChild("function").getChild("body").getChild("block")
        if tree.hasChildren():
            for child in copy.copy(tree.children):
                tree.removeChild(child)
                funcBody.addChild(child)

        # Add wrapper to tree
        tree.addChild(wrapperNode)

        return tree



    ##
    # Convenience method for length of compiled class
    # (Might become necessary if I want to cache the length).
    def getCompiledSize(self, compOptions):
        code = self.getCode(compOptions)
        return len(code)




