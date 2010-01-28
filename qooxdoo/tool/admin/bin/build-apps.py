#! /usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2008 - 2009 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Alexander Back (aback)
#
################################################################################


# Small script to automatically walk through a SDK directory and
# call every 'generate.py' script with parameters to test the 
# functionality of the tool-chain itself.

import sys
import os
import string

# framework targets
FRAMEWORK_TARGETS = { "FRAMEWORK API VIEWER" : "api", "TEST RUNNER" : "test", "TEST RUNNER SOURCE" : "test-source" }

# application targets
APPLICATION_TARGETS = { "SOURCE VERSION" :  "source", "BUILD VERSION" : "build" }

def subdirFunction(arg, directory, names):
	generator = ""
	currentdir = os.path.join(workingdir, directory)

	# check for 'generate.py'
	if os.path.exists(os.path.join(currentdir, 'generate.py')):
		generator = './generate.py '

		os.chdir(currentdir)
	
		# the framework folder is special
		if os.path.basename(directory) == "framework":
			for target in FRAMEWORK_TARGETS.keys():
				print "### BUILDING %s" % (target)
				os.system(generator + FRAMEWORK_TARGETS[target])
		else:
			for target in APPLICATION_TARGETS.keys():
				print "### BUILDING %s OF %s" % (target, string.swapcase(os.path.basename(directory)))
				os.system(generator + APPLICATION_TARGETS[target])

def main():
	if len(sys.argv) > 1:
		if os.path.exists(sys.argv[1]):
			workingdir = sys.argv[1]
		
			# change the dir and scan the subdirs
			os.chdir(workingdir)	
			os.path.walk(os.getcwd(), subdirFunction, None)
		else:
			print "ERROR: PROVIDED DIRECTORY '%s' DOES NOT EXIST!" % (sys.argv[1])
			
	else:	
		print "ERROR: PROVIDE AN ABSOLUTE PATH TO A QOOXDOO SDK"
		exit()
	
main();
