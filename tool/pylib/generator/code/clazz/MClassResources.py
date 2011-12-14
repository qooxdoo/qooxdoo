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
# generator.code.Class Mixin: class resources
##

import sys, os, types, re, string, copy
from generator.resource.AssetHint   import AssetHint
from generator.resource.CombinedImage    import CombinedImage
from generator import Context
from misc import util
from misc.securehash import sha_construct


class MClassResources(object):

    # --------------------------------------------------------------------------
    #   Resource Support
    # --------------------------------------------------------------------------

    def getAssets(self, assetMacros={}):

        # Memoizing needs assetMacros in the key, otherwise you get wrong
        # results with multiple builds in one generator run.
        macroskey = util.toString(assetMacros)
        macroskey = sha_construct(macroskey).hexdigest()
        if macroskey not in self._assetRegex:
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
            self._assetRegex[macroskey] = iresult

        return self._assetRegex[macroskey]


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

        console = self.context['console']
        result = expMacRec(res)
        return result


    ##
    # Map resources to classes.
    # Takes a list of Library's and a list of Class'es, and modifies the
    # classes' .resources member to hold suitable resources from the Libs.
    @staticmethod
    def mapResourcesToClasses(libs, classes, assetMacros={}):
        
        # Resource list
        resources = []
        for libObj in libs:
            resources.extend(libObj.getResources()) # weightedness of same res id through order of script.libraries
        # remove unwanted files
        exclpatt = re.compile("\.(?:meta|py)$", re.I)
        resources = [res for res in resources if not exclpatt.search(res.id)]
        
        # Asset pattern list  -- this is basically an optimization, to condense
        # asset patterns
        #assetMacros = self._genobj._job.get('asset-let',{})
        assetHints  = []
        for clazz in classes:
            assetHints.extend(clazz.getAssets(assetMacros))
            clazz.resources = set() #TODO: they might be filled by previous jobs, with different libs

        # Go through resources and asset patterns
        for res in resources:
            for hint in assetHints:
                # add direct matches
                if hint.regex.match(res.id):
                    hint.seen = True
                    hint.clazz.resources.add(res)
                # add matches of embedded images
                if isinstance(res, CombinedImage):
                    for embed in res.embeds:
                        if hint.regex.match(embed.id):
                            hint.seen = True
                            hint.clazz.resources.add(res)

        # Now that the resource mapping is done, check if we have unfullfilled hints
        for hint in assetHints:
            if not hint.seen:
                Context.console.warn("No resource matched #asset(%s) (%s)" % (hint.source, hint.clazz.id))
        
        return classes


