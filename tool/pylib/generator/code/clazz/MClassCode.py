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

import sys, os, types, re, string, copy, time
from ecmascript.backend.Packer      import Packer
from ecmascript.backend             import formatter
from ecmascript.frontend import treeutil, tokenizer
from ecmascript.frontend import treegenerator, lang
from ecmascript.frontend.SyntaxException import SyntaxException
from ecmascript.transform.check     import scopes, load_time, lint, jshints
from ecmascript.transform.optimizer import variantoptimizer, variableoptimizer, commentoptimizer
from ecmascript.transform.optimizer import stringoptimizer, basecalloptimizer, privateoptimizer
from ecmascript.transform.optimizer import featureoptimizer
from ecmascript.transform.optimizer import globalsoptimizer
from generator import Context
from generator.action               import CodeMaintenance
from misc import util, filetool


class MClassCode(object):

    _illegalIdentifierExpr = re.compile(lang.IDENTIFIER_ILLEGAL_CHARS)

    # --------------------------------------------------------------------------
    #   Tree Interface
    # --------------------------------------------------------------------------

    ##
    # Interface method. Delivers class syntax tree:
    # - handles cache
    # - can be called with alternative parser (treegenerator)
    #
    def tree(self, treegen=treegenerator, force=False):

        cache = self.context['cache']
        console = self.context['console']
        tradeSpaceForSpeed = False  # Caution: setting this to True seems to make builds slower, at least on some platforms!?
        cacheId = "tree%s-%s-%s" % (treegen.tag, self.path, util.toString({}))
        self.treeId = cacheId

        # Lookup for unoptimized tree
        tree, _ = cache.read(cacheId, self.path, memory=tradeSpaceForSpeed)

        # Tree still undefined?, create it!
        if tree == None or force:
            console.debug("Parsing file: %s..." % self.id)
            console.indent()

            # Tokenize
            fileContent = filetool.read(self.path, self.encoding)
            fileId = self.path if self.path else self.id
            try:
                tokens = tokenizer.Tokenizer().parseStream(fileContent, self.id)
            except SyntaxException, e:
                # add file info
                e.args = (e.args[0] + "\nFile: %s" % fileId,) + e.args[1:]
                raise e

            # Parse
            try:
                tree = treegen.createFileTree(tokens, fileId)
            except SyntaxException, e:
                # add file info
                e.args = (e.args[0] + "\nFile: %s" % fileId,) + e.args[1:]
                raise

            # Check class id against file id
            try:
                self.checkClassId(tree)
            except ValueError, e:
                # add file info
                e.args = (e.args[0] + "\nFile: %s" % fileId,) + e.args[1:]
                raise

            # Annotate with scopes
            if True:
                tree = scopes.create_scopes(tree)  # checks for suitable treegenerator_tag
                #tree.scope.prrnt()
                #print self.id, " (globals):", [c for s in tree.scope.scope_iterator() for c in s.globals()]

            # Annotate scopes with load time information
            if True:
                if hasattr(tree,'scope') and tree.scope:
                    load_time.load_time_check(tree.scope)

            # Annotate with jsdoc hints
            if True:
                tree = jshints.create_hints_tree(tree)

            # Store unoptimized tree
            cache.write(cacheId, tree, memory=tradeSpaceForSpeed)

            console.outdent()

        return tree


    ##
    # Raises in case of inconsistencies, otherwise returns None
    #
    def checkClassId(self, tree):
        className = None  # not-found return value
        filePathId = self.id
        qxDefine = treeutil.findQxDefine(tree)
        if qxDefine:
            className = treeutil.getClassName(qxDefine)
            if not className:  # might be u''
                className = None
            else:
                illegal = self._illegalIdentifierExpr.search(className)
                if illegal:
                    raise ValueError, "Item name '%s' contains illegal character '%s'" % (className,illegal.group(0))
        if className and className != filePathId:
            errmsg = [
                u"Detected conflict between filename and classname!\n",
                u"    Classname: %s\n" % className,
                u"    Path: %s\n" % filePathId,
            ]
            raise RuntimeError(u''.join(errmsg))

        return


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
        if not classinfo or 'svariants' not in classinfo:  # 'svariants' = supported variants
            if generate:
                # TODO: it might be better to work on the variant tree, as config variants have already been pruned?!
                tree = self.tree()  # get complete tree
                classvariants = self._variantsFromTree(tree) # get list of variant keys
                classinfo, _ = self._getClassCache()  # re-read, b.o. self.tree()
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
        #config  = self.context['jobconf'] - TODO: this can yield job 'apiconf::build-resources' when running 'apiconf::build-data'!?
        config  = Context.jobconf
        warn_non_literal_keys = "non-literal-keys" not in config.get("config-warnings/environment",[])
        classvariants = set()
        for variantNode in variantoptimizer.findVariantNodes(node):
            firstParam = treeutil.selectNode(variantNode, "../../arguments/1")
            if firstParam:
                if treeutil.isStringLiteral(firstParam):
                    classvariants.add(firstParam.get("value"))
                #elif firstParam.isVar():
                #    if warn_non_literal_keys:
                #        console.warn("qx.core.Environment call with non-literal key (%s:%s)" % (self.id, variantNode.get("line", False)))
                elif firstParam.type == "map": # e.g. .filter() method
                    mapMap = treeutil.mapNodeToMap(firstParam)
                    classvariants.update(mapMap.keys())
                else:
                    #console.warn("qx.core.Environment call with alien first argument (%s:%s)" % (self.id, variantNode.get("line", False)))
                    pass
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
    # Checking the cache for the appropriate code, and pot. invoking ecmascript.backend
    def getCode(self, compOptions, treegen=treegenerator, featuremap={}):

        # source versions
        if not compOptions.optimize:
            compiled = filetool.read(self.path)
            # assure trailing \n (e.g. to utilise ASI)
            if compiled[-1:] != "\n":
                compiled += '\n'
        # compiled versions
        else:
            optimize  = compOptions.optimize
            variants  = compOptions.variantset
            format_   = compOptions.format
            classVariants     = self.classVariants()
            # relevantVariants is the intersection between the variant set of this job
            # and the variant keys actually used in the class
            relevantVariants  = self.projectClassVariantsToCurrent(classVariants, variants)
            variantsId        = util.toString(relevantVariants)
            optimizeId        = self._optimizeId(optimize)
            cache             = self.context["cache"]

            cacheId = "compiled-%s-%s-%s-%s" % (self.path, variantsId, optimizeId, format_)
            compiled, _ = cache.read(cacheId, self.path)

            if compiled == None:
                tree = self.optimize(None, optimize, variants, featuremap)
                compiled = self.serializeTree(tree, optimize, format_)
                if not "statics" in optimize:
                    cache.write(cacheId, compiled)

        return compiled

    def serializeTree(self, tree, optimize, format_=False):
        if not "whitespace" in optimize:
            compiled = self.serializeFormatted(tree)
        else:
            compiled = self.serializeCondensed(tree, format_)

        if format_ and compiled[-1:] != "\n":
            compiled += '\n' # assure trailing \n
        return compiled

    ##
    # Interface to ecmascript.backend
    def serializeCondensed(self, tree, format_=False):
        result = [u'']
        result =  Packer().serializeNode(tree, None, result, format_)
        return u''.join(result)

    def serializeFormatted(self, tree):
        # provide minimal pretty options
        def options(): pass
        formatter.defaultOptions(options)
        options.prettypCommentsBlockAdd = False  # turn off comment filling

        result = [u'']
        result = formatter.formatNode(tree, options, result)

        return u''.join(result)


    ##
    # Optimize class tree.
    #
    def optimize(self, p_tree=None, p_optimize=[], variantSet={}, featureMap={}):

        def load_privates():
            cacheId  = privateoptimizer.privatesCacheId
            privates, _ = cache.read(cacheId, keepLock=True)
            if privates == None:
                privates = {}
            return privates

        def write_privates(globalprivs):
            cacheId  = privateoptimizer.privatesCacheId
            cache.write(cacheId, globalprivs)  # removes lock by default

        def getTreeCacheId(optimize=[], variantSet={}):
            classVariants = self.classVariants()
            relevantVariants = self.projectClassVariantsToCurrent(classVariants, variantSet)
            return "tree%s-%s-%s-%s" % (
                treegenerator.tag, # TODO: hard-coded treegen.tag
                self.path, self._optimizeId(optimize), util.toString(relevantVariants))

        def optimizeTree(tree):

            if "comments" in optimize:
                commentoptimizer.patch(tree)

            # "variants" prunes parts of the tree, so all subsequent optimizations benefit
            if "variants" in optimize:
                variantoptimizer.search(tree, variantSet, self.id)

            # 'statics' has to come before 'privates', as it needs the original key names in tree
            # if features should be removed recursively, this has to be controlled on the calling
            # level.
            if "statics" in optimize:
                if not featureMap:
                    console.warn("Empty feature map passed to static methods optimization; skipping")
                elif self.type == 'static' and self.id in featureMap:
                    featureoptimizer.patch(tree, self, featureMap)

            if "basecalls" in optimize:
                basecalloptimizer.patch(tree)

            if "privates" in optimize:
                privatesMap = load_privates()
                privateoptimizer.patch(tree, id, privatesMap)
                write_privates(privatesMap)

            if "globals" in optimize:
                tree = globalsoptimizer.process(tree) # need to re-assign as this optimizer might change the root node

            if "strings" in optimize:
                tree = stringoptimizer.process(tree, self.id)

            if "variables" in optimize:
                variableoptimizer.search(tree)

            return tree

        ##
        # Return the tree that is (pot.) closest to the optimization we want to apply
        #
        def getBestMatchingTree():
            # see if we have a "variants" optimized tree already (e.g. from calculating the class list)
            if "variants" in optimize:
                # this is a very simple form of optimizations projection
                result, _ = cache.read(getTreeCacheId(["variants"], variantSet), self.path)
                if result is None:
                    result = self.tree()
                else:
                    optimize.remove("variants")
            else:
                result = self.tree()
            return result

        # -----------------------------------------------------------------------------

        cache   = self.context['cache']
        console = self.context['console']
        optimize= p_optimize[:]

        # if a tree is passed in, just optimize it
        if p_tree:
            result = optimizeTree(p_tree)

        # else we're working on the class tree, and can cache
        else:
            cacheId = getTreeCacheId(optimize, variantSet)
            result, modtime = cache.read(cacheId, self.path)

            if result == None:
                result = getBestMatchingTree()
                result = optimizeTree(result)
                if not "statics" in optimize:  # can't cache static optimized trees
                    cache.write(cacheId, result)

        return result


    ##
    # Create an id from the optimize list
    #
    def _optimizeId(self, optimize):
        optimize = copy.copy(optimize)
        optimize.sort()
        return "[%s]" % ("-".join(optimize))



    ##
    # Convenience method for length of compiled class
    # (Might become necessary if I want to cache the length).
    def getCompiledSize(self, compOptions, treegen=treegenerator, featuremap={}):
        code = self.getCode(compOptions, treegen, featuremap)
        return len(code)


    ##
    # Lint the source
    def lint_warnings(self, lint_opts):
        classInfo, mTime = self._getClassCache()
        if (not 'lint-basics' in classInfo
            and True):  # not up-to-date?! when is the class cache invalidated?!
            warns = lint.lint_check(self.tree(), self.id, lint_opts)
            classInfo['lint-basics'] = (warns, time.time())
            self._writeClassCache(classInfo)
        return classInfo['lint-basics'][0]





