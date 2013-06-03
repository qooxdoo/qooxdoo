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
import urllib, shutil, hashlib
from zipfile import ZipFile
import tarfile
from Wget import Wget
from HTMLParser import HTMLParser
from misc import json, filetool
from misc.ExtMap import ExtMap

# -- Defaults ------------------------------------------------------------------

# Allura SVN URL scheme - sample url:
# http://svn.code.sf.net/p/qooxdoo-contrib/code/trunk/qooxdoo-contrib/UploadWidget/trunk/
# - Wget cannot handle HTTPS currently
sf_svn_server = 'svn.code.sf.net'
svn_url_schema = 'http://%s/p/%%(project)s/code/trunk/%%(project)s/%%(cName)s/%%(cBranch)s/' % sf_svn_server
project = 'qooxdoo-contrib'
catalog_url_schema = 'https://github.com/qooxdoo/contrib-catalog/raw/master/%(cName)s/%(cBranch)s/Manifest.json'

# -- Defaults-end --------------------------------------------------------------

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

    def __init__(self, proj=project, uschema=svn_url_schema, cschema=catalog_url_schema):
        self.project = proj
        self.svn_url_schema = uschema
        self.catalog_url_schema = cschema

    #def get_sf_revision(self, contribName, contribBranch):
    #    svnView = AlluraSVNView()
    #    rev = svnView.get_revision(html, contribName, contribBranch)
    #    return rev

    def get_sf_revision(self, cName, cBranch):
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

    def catalogLookup(self, cName, cBranch):
        url = self.catalog_url_schema % {
            'project' : self.project,
            'cName'   : cName,
            'cBranch' : cBranch
        }
        urlobj = urllib.urlopen(url) # urllib does handle https
        assert urlobj.getcode() == 200, "Could not access the contrib catalog URL: %s" % url
        manifest = urlobj.read()
        manifest = ExtMap(json.loads(manifest))
        return manifest

    def sf_spider(self, url, contrib_cache, contrib):
        dloader = Wget()
        rc = dloader.wget(url, os.path.join(contrib_cache,contrib), {'recursive':True})
        return rc

    def copy_and_hash(self, fp1, fp2, length=16*1024):  # length from shutil.py#copyfileobj
        hashobj = hashlib.sha1()
        while 1:
            buf = fp1.read(length)
            if not buf:
                break
            hashobj.update(buf)
            fp2.write(buf)
        return hashobj

    def archive_download(self, url, contrib_cache, contrib, checksum):
        rc = 0
        # Download
        arcfile = os.path.join(contrib_cache, contrib, os.path.basename(url))
        tdir = os.path.dirname(arcfile)
        filetool.directory(tdir)
        tfp = open(arcfile, "wb")
        #(fname, urlinfo) = urllib.urlretrieve(url, arcfile)
        urlobj = urllib.urlopen(url)
        assert urlobj.getcode() == 200, "Could not the download contrib archive: %s" % url
        hashobj = self.copy_and_hash(urlobj.fp, tfp)
        assert hashobj.hexdigest()==checksum, "Checksum of archive does not validate (should be: %s): %s" % (checksum, arcfile)
        urlobj.close()
        tfp.close()

        # Extract
        if url.endswith('.zip'):
            zipf = ZipFile(arcfile, 'r')
            zipf.extractall(tdir)
            zipf.close()
        else: # .tar, .tgz(?), .tar.gz, .tar.bz2
            tar = tarfile.open(arcfile)
            tar.extractall(tdir)
            tar.close

        # Eliminate archive top-dir
        _, archive_dirs, _ = os.walk(tdir).next()
        assert archive_dirs, "The downloaded archive is not in single top-dir format: %s" % arcfile
        archive_top = os.path.join(tdir, archive_dirs[0]) # just take the first dir entry
        for item in os.listdir(archive_top):
            shutil.move(os.path.join(archive_top, item), tdir)
        os.rmdir(archive_top)
        os.unlink(arcfile)

        return rc

    def download(self, contrib, contrib_cache):
        cName, cBranch = contrib.split('/',1)

        # catalog lookup
        manifestObj = self.catalogLookup(cName, cBranch)
        download_url = manifestObj.get("info/download")

        # get local revision
        revisionFile = os.path.join(contrib_cache.replace("\ ", " "), contrib, "revision.txt")
        if os.path.exists(revisionFile):
            loc_rev = open(revisionFile).readline()
        else:
            loc_rev = ''

        # get external revision
        if sf_svn_server in download_url:
            ext_rev = self.get_sf_revision(cName, cBranch)
        else:
            ext_rev = manifestObj.get("info/checksum", "")
        if not ext_rev:
            print >> sys.stderr, "Could not determine current revision of \"%s\"; forcing download" % contrib

        # test freshness
        if loc_rev and loc_rev == ext_rev: # we're up-to-date
            return (False, loc_rev)
        else: # clear for download
            shutil.rmtree(os.path.dirname(revisionFile), ignore_errors=True)

        # download data
        if download_url.endswith(tuple(".zip .tar.gz .tgz".split())):
            # do archive download and unpack
            rc = self.archive_download(download_url, contrib_cache, contrib, ext_rev)
        elif sf_svn_server in download_url:
            # spider - only for sourceforge SVN!
            rc = self.sf_spider(download_url, contrib_cache, contrib)

        # store new revision
        open(revisionFile, "w").write(ext_rev)

        return (True, ext_rev)
