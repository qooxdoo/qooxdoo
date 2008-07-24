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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# NAME
#  Wget.py  -- simple wget implementation, to download directory trees
##

import os, sys, re, types
import urllib
import urlparse
from HTMLParser import HTMLParser
from misc import filetool, Path

class Wget(object):

    def __init__(self):
        self.maxDepth   = 20
        self.fileRoot   = ""
        self.urlRoot    = ""
        self.urlIndex   = []

    urlPathSep = "/"

    def wget(self, url, fileRoot, optMap):

        # Set various attributes on the object
        # self.maxDepth
        if not 'recursive' in optMap or not optMap['recursive']:
            self.maxDepth = 0
        if 'maxDepth' in optMap and isinstance(optMap['maxDepth'], types.IntType):
            self.maxDepth = optMap['maxDepth']

        # self.urlRoot
        (hproto, 
        hnetLoc,
        hpath,
        hparams,
        hquery,
        hfrag ) = urlparse.urlparse(url)

        self.urlRoot  = urlparse.urlunparse((hproto,hnetLoc,hpath,'','','')) # debateable!
        self.fileRoot = fileRoot
        self.urlIndex = []

        # Do the actual downloading
        self._wget(url, optMap, 0)


    def _wget(self, url, optMap, currDepth):
        # cycle check
        if url in self.urlIndex:
            return  # already processed this url
        else:
            self.urlIndex.append(url)

        # get page content and save file
        pageObj   = self.getPage(url)
        actualUrl = pageObj.geturl()
        pageCont  = pageObj.read()
        # normalize actual url
        if actualUrl.endswith(self.urlPathSep):
            # actually, since we are currently only downloading directory trees,
            # we could skip index files (but wget keeps them, too):
            # pass
            actualUrl += "index.html"
        #else:
        savePath = self.getSavePath(self.urlRoot, self.fileRoot, actualUrl)
        self.saveFile(savePath, pageCont)
        
        # depth check
        if currDepth + 1 > self.maxDepth:
            return

        # extract page links
        headers = pageObj.info().items()
        if not [x for x in headers if x[0]=='content-type' and re.search(r'.*?/.*html.*', x[1], re.I)]:
            return  # no html to parse
        linkExtractor = LinkExtractor()
        linkExtractor.feed(pageCont)
        linkExtractor.close()
        pageLinks = linkExtractor.getLinks()

        # select and recurse
        followLinks = self.selectLinks(actualUrl, pageLinks)
        for link in followLinks:
            self._wget(link, optMap, currDepth+1)
        

    def getSavePath(self, urlRoot, fileRoot, currUrl):
        savePath = pathFrag = ""
        # pathFrag = currUrl - urlRoot; assert currUrl > urlRoot
        assert currUrl.startswith(urlRoot)  # only consider urls from the same root
        (pre,sfx1,sfx2) = Path.getCommonPrefix(urlRoot, currUrl)
        pathFrag = sfx2
        savePath = os.path.join(fileRoot, pathFrag)

        return savePath

    def getPage(self, url):
        pageObject = urllib.urlopen(url)
        # TODO: error recovery
        #actualUrl  = pageObject.geturl()  # this is what the server actually returned
        #pageCont   = pageObject.read()
        return pageObject

    def saveFile(self, path, cont):
        filetool.directory(os.path.dirname(path))
        fo = open(path, 'wb')
        fo.write(cont)
        fo.close


    def selectLinks(self, url, linkList):
        'Filter and normalize links to be followed'
        result = []
        # break up host url
        (hproto, 
        hnetLoc,
        hpath,
        hparams,
        hquery,
        hfrag ) = urlparse.urlparse(url)
        for link in linkList:
            nurl = urlparse.urljoin(url,link) # calculate new url from base
            (proto, 
            netLoc,
            path,
            params,
            query,
            frag ) = urlparse.urlparse(nurl)
            # only local links (in the SOP sense)
            if proto and proto!=hproto:
                continue
            if netLoc and netLoc!=hnetLoc:
                continue
            # disallow pages outside this document tree? - yes
            hdir = os.path.dirname(hpath)
            if path and not path.startswith(hdir):
               continue
            result.append(nurl)

        return result


class LinkExtractor(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.links = []

    def handle_starttag(self, tag, attribs):
        if tag == 'a':
            for aname, avalue in attribs:
                if aname == 'href':
                    self.links.append(avalue)

    def getLinks(self):
        return self.links
