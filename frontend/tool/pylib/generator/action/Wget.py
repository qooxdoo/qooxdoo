import urllib
import htmllib
from HTMLParser import HTMLParser

class Wget(object):

    def __init__(self):
        pass

    def wget(self, url, optMap):
        pageCont = self.getPage(url)
        
        if optMap['saveTo']:
            filetool.save(optMap['saveTo'], pageCont)
        if not 'recursive' in optMap or not optMap['recursive']:
            return pageCont
        elif optMap['recursive']:
            optMap1 = optMap.copy()
            if optMap['saveTo']:
                optMap1['saveTo'] = optMap['saveTo'] + relpath
            self.wget(optMap1)
        

    def getLinks(self, page):
        parser = htmllib.HTMLParser()

    def getPage(self, url):
        pageCont = urllib.urlopen(url)

        return pageCont


class LinkExtractor(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.links = []

    def handle_starttag(self, tag, attribs):
        if tag == 'a':
            for aname, avalue in attribs:
                if aname == 'href':
                    self.links.append(avalue)

    def close(self):
        HTMLParser.close(self)
        return self.links
