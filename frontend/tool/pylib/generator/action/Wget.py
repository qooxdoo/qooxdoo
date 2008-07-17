import os, sys, re, types
import urllib
import urlparse
from HTMLParser import HTMLParser
from misc import filetool

class Wget(object):

    def __init__(self):
        pass

    urlIndex = []

    def wget(url, optMap, maxDepth=100):
        if optMap['saveTo']:
            savePath = optMap['saveTo']
        else:
            savePath = os.curdir
        if not 'recursive' in optMap or not optMap['recursive']:
            maxDepth = 0

        (hproto, 
        hnetLoc,
        hpath,
        hparams,
        hquery,
        hfrag ) = urlparse.urlparse(url)
        if os.path.isdir(savePath):
            saveRoot = savePath
            saveFile = os.path.basename(hpath)
        else:
            saveRoot = os.path.dirname(savePath)
            saveFile = os.path.basename(savePath)

        self._wget(url, optMap, 0, maxDepth, os.path.join(saveRoot,saveFile))


    def _wget(self, url, optMap, currDepth, maxDepth, savePath):
        # cycle check
        if url in self.urlIndex:
            return  # already processed this url
        else:
            self.urlIndex.append(url)

        # get page content
        pageCont = self.getPage(url)
        filetool.save(os.path.join(saveRoot, saveFile), pageCont)
        
        # depth check
        if currDepth + 1 > maxDepth:
            return

        # extract page links
        linkExtractor = LinkExtractor()
        linkExtractor.feed(pageCont)
        linkExtractor.close()
        pageLinks = linkExtractor.getLinks()

        # select and recurse
        followLinks = self.selectLinks(pageLinks)
        for link in followLinks:
            nsavePath = os.path.join(savePath,)
            self._wget(link, optMap, currDepth+1, maxDepth, nsavePath)
        

    def getPage(self, url):
        pageCont = urllib.urlopen(url)
        return pageCont

    def selectLinks(url, linkList):
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
