#!/usr/bin/env python
# encoding: utf-8
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007-2013 1&1 Internet AG, Germany, http://www.1und1.de
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
# ContribLoader that plays with the new SF 'Allura' platform
#
# - mainly, ContribLoader.getRevision needed to be adapted
# - ContribLoader.download is nearly unchanged, except for the 'url' var
##

import sys, os, re, types
import urllib, shutil
import optparse, misc
from Wget import Wget
from HTMLParser import HTMLParser

# -- Defaults -----

project = 'qooxdoo-contrib'
# Allura SVN URL scheme
# sample url: http://svn.code.sf.net/p/dosbox/code-0/dosbox/trunk/src/lib/ - Wget cannot handle HTTPS currently
svn_url_schema = 'http://svn.code.sf.net/p/%(project)s/code/trunk/%(project)s/%(cName)s/%(cBranch)s/'

# -----------------

##
# This is to parse Allura's view code HTML interface, to extract a dir revision from
# the contained elements.
# - not used, as SVN dir revision is available more reliably through svn.code.sf.net URLs
#   but left for re-use
class AlluraSVNView(HTMLParser):

    svn_root = '/p/%s/code/'

    def get_revision(self, html, pName):
        self._t = []
        self.tag_stack = []
        self.svn_root = '/p/%s/code/' % pName
        self.reg = re.compile(r'^%s/(\d+)/$' % self.svn_root)
        self.reg = re.compile(self.svn_root, re.I)
        
        self.feed(html)
        return max(self._t)

    def handle_starttag(self, tag, attrs):
        self.tag_stack.append(tag.lower())
        if self.tag_stack[-2:] == ['td', 'a']:
            for key,val in attrs:
                if key=='href' and val.startswith(self.svn_root):
                    mo = self.reg.search(val)
                    if mo:
                        self._t.append(int(mo.group(1)))

    def handle_endtag(self, tag):
        self.tag_stack.pop()


##
# Interface class
#
class ContribLoader(object):

    def __init__(self, proj=project, uschema=svn_url_schema):
        self.project = proj
        self.svn_url_schema = uschema

    #def getRevision(self, contribName, contribBranch):
    #    svnView = AlluraSVNView()
    #    rev = svnView.get_revision(html, contribName, contribBranch)
    #    return rev

    def getRevision(self, cName, cBranch):
        cUrl =  self.svn_url_schema % {
                    'project' : self.project, 
                    'cName' : cName,
                    'cBranch' : cBranch
                    }
        urlobj = urllib.urlopen(cUrl)
        assert urlobj.getcode() == 200, "Could not access contrib SVN URL: %s" % cUrl
        urlinfo=urlobj.info()
        # etag mirror line: 
        #  'W/"3812//dosbox/trunk/src/libs"'  (directory)
        #  '"3653//dosbox/trunk/src/libs/Makefile.am"'  (file)
        etag = urlinfo.getheader('etag')
        mo = re.search(r'^.*"(\d+)//', etag)
        if mo:
            return mo.group(1)
        return ''



    def download(self, contrib, contrib_cache):

        cName, cBranch = contrib.split('/',1)
        # get external revision nr
        externalRevision = ""
        if True:  # enable version check since sf.net ViewVC is back again (20aug08)
            try:
                externalRevision = self.getRevision(cName, cBranch)
            except IOError:
                print >> sys.stderr, "Could not connect to the internet."
                return (False, -1)
            if not externalRevision:
                print >> sys.stderr, "Could not determine current revision of \"%s\"" % contrib
                return (False, -1)

        # get local revision nr
        revisionFile = os.path.join(contrib_cache.replace("\ ", " "), contrib, "revision.txt")
        if os.path.exists(revisionFile):
            rev = open(revisionFile).readline()
            if rev == externalRevision: # we're up-to-date
                return (False, rev)
            else: # clear for download
                shutil.rmtree(os.path.dirname(revisionFile))

        dloader = Wget()
        #url = "http://qooxdoo-contrib.svn.sourceforge.net/svnroot/qooxdoo-contrib/trunk/qooxdoo-contrib/%s/" % contrib  # Wget cannot currently handle 'https' scheme
        url =  self.svn_url_schema % {
                    'project' : self.project, 
                    'cName' : cName,
                    'cBranch' : cBranch
                    }
        dloader.wget(url, os.path.join(contrib_cache,contrib), {'recursive':True})

        # store new revision nr
        open(revisionFile, "w").write(externalRevision)
        return (True, externalRevision)


