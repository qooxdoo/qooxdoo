#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007 1&1 Internet AG, Germany, http://www.1and1.org
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Fabian Jakobs (fjakobs)
#
################################################################################

import os
import re
import sys
import urllib
import shutil
import optparse

# reconfigure path to import own modules from modules subfolder
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "..", "modules"))

import optparseext

def getRevision(contrib):
	rev_url = "http://qooxdoo-contrib.svn.sourceforge.net/viewvc/qooxdoo-contrib/trunk/qooxdoo-contrib/contribution/%s/" % contrib
	data = urllib.urlopen(rev_url)
	for line in data:
		match = re.compile("\/viewvc\/qooxdoo-contrib\?view\=rev\&amp;revision\=([0-9]+)").search(line)
		if match:
			return match.group(1)


def download_contribs(contribs, contrib_cache):

	header = False

	for contrib in contribs:
		externalRevision = ""
		try:
			externalRevision = getRevision(contrib)
		except IOError:
			print >> sys.stderr, "Could not conncet to the internet. Will use cached contributions."
			return
				
		revisionFile = os.path.join(contrib_cache.replace("\ ", " "), "contribution", contrib, "REVISION.txt")
		if os.path.exists(revisionFile):
			rev = open(revisionFile).readline()
			if rev == externalRevision:
				return
				
			shutil.rmtree(os.path.dirname(revisionFile));
		
		url = "https://qooxdoo-contrib.svn.sourceforge.net/svnroot/qooxdoo-contrib/trunk/qooxdoo-contrib/contribution/%s/" % contrib

		if header == False:
			header = True
			print
			print "  DOWNLOADING CONTRIBUTIONS:"
			print "----------------------------------------------------------------------------"

		print "  * %s" % url
		os.system(
			"wget --recursive --relative --no-parent --level=20 --quiet --execute robots=off --no-host-directories --cut-dirs=4 " +
			"--directory-prefix=%s --no-check-certificate %s" % (contrib_cache, url)
		)
		open(revisionFile, "w").write(externalRevision)
		
def cleanUpIndexHtml(contribCache):
	pass
	#os.system("""find %s -print0 -name 'index.html' | xargs -0 grep  '<hr noshade><em>Powered by <a href="http://subversion.tigris.org/">Subversion</a>' --files-with-matches --null | xargs -0 rm""" % contribCache)


def main():
	parser = optparse.OptionParser(
		"usage: %prog [options] [Contris]",
		option_class=optparseext.ExtendAction
	)

	parser.add_option(
		"-c", "--contrib", metavar="CONTRIB", action="extend", dest="contribs", default=[], type="string",
		help="List of contributions to download"
	)

	parser.add_option(
		"--contrib-cache", metavar="PATH", dest="contrib_cache", default="",
		help="Path to the qooxdoo-contrib cache directory."
	)

	(options, args) = parser.parse_args()
	
	if len(options.contribs) == 0:
		return
	
	if (options.contrib_cache == ""):
		print >> sys.stdout, "qooxdoo-contrib cache directory must be specified."
		return
	
	download_contribs(options.contribs, options.contrib_cache)
	cleanUpIndexHtml(options.contrib_cache)

if __name__ == '__main__':
	main()
