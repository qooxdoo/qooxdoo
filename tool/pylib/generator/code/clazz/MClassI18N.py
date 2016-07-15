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
#    MIT: https://opensource.org/licenses/MIT
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# generator.code.Class Mixin: class internationalization support (mainly translation)
##

import sys, os, types, re, string
from ecmascript.frontend import treeutil
from ecmascript.transform.optimizer import reducer
from misc import util

class MClassI18N(object):


    # --------------------------------------------------------------------------
    #   I18N Support
    # --------------------------------------------------------------------------

    ##
    # returns array of message dicts [{method:, line:, column:, hint:, id:, plural:},...]
    def messageStrings(self, variants):
        # this duplicates codef from Locale.getTranslation

        classVariants     = self.classVariants()
        relevantVariants  = self.projectClassVariantsToCurrent(classVariants, variants)
        variantsId        = util.toString(relevantVariants)
        cacheId           = "messages-%s" % (variantsId,)
        cached            = True
        console           = self.context['console']

        #messages, _ = cache.readmulti(cacheId, self.path)
        classInfo, cacheModTime = self._getClassCache()
        messages = classInfo[cacheId] if cacheId in classInfo else None
        if messages != None:
            return messages, cached

        console.debug("Looking for message strings: %s..." % self.id)
        console.indent()
        cached = False

        tree = self.tree()

        try:
            messages = self._findTranslationBlocks(tree, [])
        except NameError, detail:
            raise RuntimeError("Could not extract message strings from %s!\n%s" % (self.id, detail))

        if len(messages) > 0:
            console.debug("Found %s message strings" % len(messages))

        console.outdent()
        #cache.writemulti(cacheId, messages)
        classInfo[cacheId] = messages
        self._writeClassCache(classInfo)

        return messages, cached


    def _findTranslationBlocks(self, node, messages):
        if node.type == "call":
            oper = node.getChild("operand", False)
            if oper:
                var = oper.getFirstChild()
                if var.isVar():
                    varname = (treeutil.assembleVariable(var))[0]
                    for entry in [ ".tr", ".trn", ".trc", ".trnc", ".marktr" ]:
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
        console = self.context['console']

        # tr(msgid, args)
        # trn(msgid, msgid_plural, count, args)
        # trc(hint, msgid, args)
        # trnc(hint, msgid, msgid_plural, count, args)
        # marktr(msgid)

        if method == "trnc": minArgc=3
        elif method == "trn" or method == "trc": minArgc=2
        else: minArgc=1

        params = node.getChild("arguments", False)
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

            elif child.type == "operation": # must be "foo" + "bar"
                strings.append(self._concatOperation(child))

            elif len(strings) < minArgc:
                console.warn("Unknown expression as argument to translation method (%s:%s)" % (treeutil.getFileFromSyntaxItem(child), child.get("line"),))

            # Ignore remaining (run time) arguments
            if len(strings) == minArgc:
                break

        lenStrings = len(strings)
        if lenStrings > 0:
            if method in ("trc", "trnc"):
                entry["hint"] = strings[0]
                if lenStrings > 1 and strings[1]:  # msgid must not be ""
                    entry["id"]   = strings[1]
            else:
                if strings[0]:
                    entry["id"] = strings[0]

            if method == "trn" and lenStrings > 1:
                entry["plural"] = strings[1]

            if method == "trnc" and lenStrings > 2:
                entry["plural"] = strings[2]

        # register the entry only if we have a proper key
        if "id" in entry:
            data.append(entry)

        return


    def _concatOperation(self, node):
        console = self.context['console']
        result = ""
        reduced_node = reducer.ast_reduce(node)
        if reduced_node.type == 'constant' and reduced_node.get("constantType",'') == "string":
            result = reduced_node.get('value')
        else:
            console.warn("Cannot extract string argument to translation method (%s:%s): %s" % (
                treeutil.getFileFromSyntaxItem(node), node.get("line"), node.toJS(None)))
        return result


