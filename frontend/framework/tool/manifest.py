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
#    * Fabian Jakobs (fjakobs)
#
################################################################################

import os
import sys
import codecs
import optparse
from types import *

# reconfigure path to import own modules from modules subfolder
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "modules"))

import simplejson
import optparseext


def filterKey(contribIterator, key, value):
	for contrib in contribIterator:
		if not contrib.has_key(key):
			continue

		if type(contrib[key]) is ListType:
			if value in contrib[key]:
				yield contrib
		else:
			if contrib[key] == value:
				yield contrib

def filterByQooxdooVersion(contribIterator, qooxdooVersion):
	return filterKey(contribIterator, "qooxdoo-versions", qooxdooVersion)

def filterByKeyword(contribIterator, keyword):
	return filterKey(contribIterator, "keyword", keyword)


def loadContrib(manifestPath):
	""" load a contribution description from a manifest file """
	try:
		manifestData = simplejson.load(codecs.open(manifestPath, "r", "UTF-8"))
	except Exception, e:
		print >> sys.stderr, "Could not parse Manifest: '%s'." % manifestPath
		print >> sys.stderr, e
		sys.exit()

	manifestData["path"] = os.path.dirname(manifestPath)

	if not manifestData.has_key("resource-uri-setting"):
		manifestData["resource-uri-setting"] = manifestData["namespace"] + ".resourceUri"

	return manifestData


def loadContribDb(contribPath):
	db = []

	for dir in os.listdir(contribPath):
		if dir[0] == ".":
			continue

		for versionDir in os.listdir(os.path.join(contribPath, dir)):
			manifest = os.path.join(contribPath, dir, versionDir, "Manifest.js")
			if not os.path.exists(manifest):
				continue

			db.append(loadContrib(manifest))

	return db


def getClassUriFlags(contrib):
	flags = "../%s/source/class," % contrib["path"]
	return flags


def getClassPathFlags(contrib):
	flags = "%s/source/class," % contrib["path"]
	return flags


def getResourceFlags(contrib, application_build_path, application_to_root_uri="."):
	sourceFlags = '--use-setting %s:../%s/%s/source/resource ' % (
		contrib["resource-uri-setting"], application_to_root_uri, contrib["path"].replace(" ", "\ ")
	)

	buildFlags = "--copy-resources "
	buildFlags += '--resource-input %s/source/resource ' % contrib["path"]
	buildFlags += "--resource-output %s/resource/%s " % (application_build_path, contrib["namespace"])

	buildFlags += "--use-setting %s:%s/resource/%s " % (
		contrib["resource-uri-setting"], application_to_root_uri, contrib["namespace"]
	)

	return (sourceFlags, buildFlags)


def getGeneratorFlags(contrib, application_build_path, application_to_root_uri="."):
	flags = "--class-path " + getClassPathFlags(contrib)
	flags += "--class-uri " + getClassUriFlags(contrib)
	(sourceFlags, buildFlags) = getResourceFlags(contrib, application_build_path, application_to_root_uri)
	return (sourceFlags+flags, buildFlags+flags)


def getGeneratorSourceFlags(contrib, application_build_path, application_to_root_uri="."):
	return getGeneratorFlags(contrib, application_build_path, application_to_root_uri)[0]

def getGeneratorBuildFlags(contrib, application_build_path, application_to_root_uri):
	return getGeneratorFlags(contrib)[1]

def generateProjectListing(contrib):
	str = """==== %(name)s %(version)s ====

%(summary)s

""" % contrib
	if contrib.has_key("description"):
		str += contrib["description"] + "\n\n"

	authors = []
	for author in contrib["authors"]:
		if author.has_key("email"):
			authors.append("%(name)s <%(email)s> " % author)
		else:
			authors.append(author["name"])
	str += "|Authors|%s|\n" % ", ".join(authors)

	if contrib.has_key("homepage"):
		str += "|Homepage|[[%(homepage)s]]|\n" % contrib

	str += "|License|%(license)s|\n" % contrib
	str += "|qooxdoo version|%s|\n" % ", ".join(contrib["qooxdoo-versions"])

	return str


def main(argv=None):
	if argv is None:
		argv = sys.argv

	parser = optparse.OptionParser(
		"usage: %prog [options] [ContribNames]",
		option_class=optparseext.ExtendAction
	)

	parser.add_option(
		"-m", "--manifest", metavar="MANIFEST", action="extend", dest="manifests", default=[], type="string",
		help="File name of a 'Manifest.js' file to load."
	)

	parser.add_option(
		"--contrib-path", metavar="PATH", dest="contrib_path", default="",
		help="Path to the qooxdoo-contrib repository."
	)

	parser.add_option(
		"--build-flags", action="store_true", default=False, dest="build_flags",
		help="Print build flags for the selected packages to stdout."
	)

	parser.add_option(
		"--source-flags", action="store_true", default=False, dest="source_flags",
		help="Print source flags for the selected packages to stdout."
	)

	parser.add_option(
		"--class-path", action="store_true", default=False, dest="class_path",
		help="Print class path for the selected packages to stdout."
	)

	parser.add_option(
		"--class-uri", action="store_true", default=False, dest="class_uri",
		help="Print class URI for the selected packages to stdout."
	)

	parser.add_option(
		"--resource-flags-source", action="store_true", default=False, dest="resource_flags_source",
		help="Print class resource flags for the build target of the selected packages to stdout. (source version)"
	)

	parser.add_option(
		"--resource-flags-build", action="store_true", default=False, dest="resource_flags_build",
		help="Print class resource copy flags for the build target of the selected packages to stdout. (build version)"
	)

	parser.add_option(
		"--print-wiki-list", action="store_true", default=False, dest="print_wiki_list",
		help=""
	)

	parser.add_option(
		"--application-build-path", default="./build", type="string", dest="application_build_path",
		help="The build folder of your application relative to the directory, which contains the " +
		"Makefile (if defined relatively). This is the folder where the application self-contained " +
		"build is generated to. The default is %default."
	)

	parser.add_option(
		"--application-to-root-uri", default=".", type="string", dest="application_to_root_uri",
		help="Defines the position of the HTML/PHP etc. file used to include your application " +
		"JavaScript code in relation to root directory. The default is %default."
	)

	parser.add_option(
		"-k", "--key", default="", type="string", dest="key",
		help="Get the value of the given key from all selected contrributions."
	)

	parser.add_option(
		"--filter", action="extend", default=[], dest="filters", metavar="KEY:VALUE", type="string",
		help="Only use contributions with the given key value pair."
	)

	(options, args) = parser.parse_args(args=argv[1:])

	# load contributions
	contribs = []

	if options.contrib_path != "":
		contribs.extend(loadContribDb(options.contrib_path))

	for manifest in options.manifests:
		contribs.append(loadContrib(manifest))

	# filter contributiuons
	contribIterator = iter(contribs)

	for filter in options.filters:
		(key, value) = filter.strip().split(":")
		contribIterator = filterKey(contribIterator, key, value)


	#for contrib in contribIterator:
	#	print generateProjectListing(contrib)
	#
	#return

	if options.key:
		print "\n".join([contrib[options.key] for contrib in contribIterator])

	if options.class_path:
		print "".join([getClassPathFlags(contrib) for contrib in contribIterator])

	if options.class_uri:
		print "".join([getClassUriFlags(contrib) for contrib in contribIterator])

	if options.print_wiki_list:
		for contrib in contribIterator:
			print generateProjectListing(contrib).encode("UTF-8")

	if options.resource_flags_source:
		print "".join([getResourceFlags(contrib, options.application_build_path, options.application_to_root_uri)[0] for contrib in contribIterator])

	if options.resource_flags_build:
		print "".join([getResourceFlags(contrib, options.application_build_path, options.application_to_root_uri)[1] for contrib in contribIterator])

	if options.build_flags:
		print "".join([getGeneratorBuildFlags(contrib, options.application_build_path, options.application_to_root_uri) for contrib in contribIterator])

	if options.source_flags:
		print "".join([getGeneratorSourceFlags(contrib, options.application_build_path, options.application_to_root_uri) for contrib in contribIterator])


if __name__ == '__main__':
	sys.exit(main())
