#!/usr/bin/env python
# encoding: utf-8
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Fabian Jakobs (fjakobs)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import os, re, sys, types
import urllib, shutil
import optparse, optparseext
from Wget import Wget


class ContribLoader(object):
    def __init__(self):
        pass

    def getRevision(self, contrib):
        rev_url = "http://qooxdoo-contrib.svn.sourceforge.net/viewvc/qooxdoo-contrib/trunk/qooxdoo-contrib/%s/" % contrib
        data = urllib.urlopen(rev_url)
        for line in data:
            match = re.compile("\/viewvc\/qooxdoo-contrib\?view\=rev\&amp;revision\=([0-9]+)").search(line)
            if match:
                return match.group(1)


    def download(self, contrib, contrib_cache):

        # get external revision nr
        externalRevision = ""
        if True:  # enable version check since sf.net ViewVC is back again (20aug08)
            try:
                externalRevision = self.getRevision(contrib)
            except IOError:
                print >> sys.stderr, "Could not conncet to the internet. Will use cached contributions."
                return

        # get local revision nr
        revisionFile = os.path.join(contrib_cache.replace("\ ", " "), contrib, "revision.txt")
        if os.path.exists(revisionFile):
            rev = open(revisionFile).readline()
            if rev == externalRevision: # we're up-to-date
                return
            else: # clear for download
                shutil.rmtree(os.path.dirname(revisionFile))

        dloader = Wget()
        url = "http://qooxdoo-contrib.svn.sourceforge.net/svnroot/qooxdoo-contrib/trunk/qooxdoo-contrib/%s/" % contrib  # Wget cannot currently handle 'https' scheme
        dloader.wget(url, os.path.join(contrib_cache,contrib), {'recursive':True})

        # store new revision nr
        open(revisionFile, "w").write(externalRevision)
        return


