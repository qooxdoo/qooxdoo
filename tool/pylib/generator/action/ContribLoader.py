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
import urllib, shutil, hashlib, urlparse
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
catalog_url_schema = '%(catalogBase)s/%(cName)s/%(cBranch)s/%(maniFile)s'
catalog_base_url = 'https://github.com/qooxdoo/contrib-catalog/raw/master/contributions' # just a fall-back
archive_extensions = tuple(".zip .tar.gz .tgz .tar.bz2".split())

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

    def __init__(self, proj=project, uschema=svn_url_schema,
        cschema=catalog_url_schema, catalog_base_url=catalog_base_url):
        self.project = proj
        self.svn_url_schema = uschema
        self.catalog_url_schema = cschema
        self.catalog_base_url = catalog_base_url

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

    def url_from_catalog_schema(self, project, cName, cBranch, maniFile="Manifest.json"):
        maniUri = self.catalog_url_schema % {
            'catalogBase' : self.catalog_base_url,
            'project' : project,
            'cName'   : cName,
            'cBranch' : cBranch,
            'maniFile': maniFile,
        }
        return maniUri

    def manifest_from_url(self, url):
        urlobj = urllib.urlopen(url) # urllib does handle https
        assert urlobj.getcode() == 200, "Could not access the contrib catalog URL: %s" % url
        manifest = urlobj.read()
        manifest = ExtMap(json.loads(manifest))
        return manifest

    def contrib_from_path(self, path):
        # ".../foo/bar/baz"
        cName, cBranch = path.split('/')[-3:-1]
        return cName, cBranch

    def contrib_from_manifest(self, maniObj):
        cName = maniObj.get("info/name",'')
        cBranch = maniObj.get("info/version",'')
        return cName, cBranch

    def copy_and_hash(self, fp1, fp2, length=16*1024):  # length from shutil.py#copyfileobj
        hashobj = hashlib.sha1()
        while 1:
            buf = fp1.read(length)
            if not buf:
                break
            hashobj.update(buf)
            fp2.write(buf)
        return hashobj

    def get_local_rev(self, contrib, cache_root):
        revisionFile = os.path.join(cache_root.replace("\ ", " "), contrib, "revision.txt")
        if os.path.exists(revisionFile):
            loc_rev = open(revisionFile).readline()
        else:
            loc_rev = ''
        return loc_rev

    def update_local_rev(self, contrib, contrib_cache, rev):
        revisionFile = os.path.join(contrib_cache.replace("\ ", " "), contrib, "revision.txt")
        open(revisionFile, "w").write(rev)

    def needs_update(self, loc_rev, ext_rev, cache_path):
        if loc_rev and loc_rev == ext_rev: # we're up-to-date
            return (False, loc_rev)
        else: # clear for download
            shutil.rmtree(cache_path, ignore_errors=True)
            return (True, ext_rev)

    def sf_spider(self, url, cache_path):
        dloader = Wget()
        rc = dloader.wget(url, cache_path, {'recursive':True})
        return rc

    def archive_download(self, url, cache_path, checksum):
        rc = 0
        # Download
        arcfile = os.path.join(cache_path, os.path.basename(url))
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
        else: # .tar, .tgz, .tar.gz, .tar.bz2
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

    def download_sf(self, download_url, cache_root):
        url_part = urlparse.urlparse(download_url)
        # use the last url path directories for contrib and version
        cName, cBranch = self.contrib_from_path(url_part.path)
        contrib = os.path.join(cName, cBranch)
        contrib_cache = os.path.join(cache_root, contrib)
        # get local revision
        loc_rev = self.get_local_rev(contrib, cache_root)
        # get external revision
        ext_rev = self.get_sf_revision(cName, cBranch)
        if not ext_rev:
            print >> sys.stderr, "Could not determine current revision of \"%s\"; forcing download" % contrib
        # test freshness
        needs_update = self.needs_update(loc_rev, ext_rev, contrib_cache)
        if needs_update[0]:
            # download data
            rc = self.sf_spider(download_url, contrib_cache)
            # store new revision
            self.update_local_rev(contrib, cache_root, ext_rev)
        return needs_update + (contrib_cache,)

    def download_via_catalog(self, manifestUrl, cache_root):
        manifestObj = self.manifest_from_url(manifestUrl)
        # download URL
        download_url = manifestObj.get("info/download")
        assert download_url, "Catalog Manifest doesn't provide an 'info/download' URL: %s" % manifestUrl
        # name and version
        #cName, cBranch = self.contrib_from_manifest(manifestObj)
        cName, cBranch = self.contrib_from_path(manifestUrl)
        contrib = "%s/%s" % (cName,cBranch)
        contrib_cache = os.path.join(cache_root,contrib)
        assert all((cName,cBranch)), "Need a contribution name and version in Manifest.json: %s" % manifestUrl

        # dispatch by download method (archive or spidering)
        if sf_svn_server in download_url:
            res = self.download_sf(download_url, cache_root)
        else:
            res = self.download_archive(download_url, cache_root, manifestObj.get("info/checksum",""), contrib)
        return res + (contrib_cache,)

    def download_archive(self, download_url, cache_root, ext_rev='', contrib=''):
        if not contrib:
            contrib = self.contrib_from_path(download_url)
        cName, cBranch = contrib.split('/',1)
        contrib_cache = os.path.join(cache_root, contrib)
        # local revision
        loc_rev = self.get_local_rev(contrib, cache_root)
        # get external revision
        if not ext_rev:
            print >> sys.stderr, "Could not determine current revision of \"%s\"; forcing download" % contrib
        # test freshness
        needs_update = self.needs_update(loc_rev, ext_rev, contrib_cache)
        if needs_update[0]:
            assert download_url.endswith(archive_extensions), \
                "Unsupported archive format: %s" % download_url
            # download data
            rc = self.archive_download(download_url, contrib_cache, ext_rev)
            # store new revision
            self.update_local_rev(contrib, cache_root, ext_rev)
        return needs_update + (contrib_cache,)

    def download(self, contribUri, cache_root):
        url_part = urlparse.urlparse(contribUri)

        if url_part.scheme in ("http","https"):
            manifile = "Manifest.json"

            if url_part.path.endswith(".json"):
                res = self.download_via_catalog(contribUri, cache_root)

            elif url_part.path.endswith(archive_extensions):
                res = self.download_archive(contribUri, cache_root)

            elif url_part.hostname==sf_svn_server:
                res = self.download_sf(contribUri, cache_root)

        elif url_part.scheme in ("contrib",):

            cName = url_part.netloc  # ugly, but that's how it is parsed
            cBranch = (url_part.path.split("/"))[1] # '/0.9/Manifest.json' -> 0.9
            manifile = os.path.basename(url_part.path)
            maniUri = self.url_from_catalog_schema(self.project, cName, cBranch, manifile)
            res = self.download_via_catalog(maniUri, cache_root)

        manipath = os.path.join(res[2],manifile)
        assert os.path.exists(manipath), "Contribution doesn't contain a Manifest.json: %s" % manipath
        return res[:2] + (manipath,)

