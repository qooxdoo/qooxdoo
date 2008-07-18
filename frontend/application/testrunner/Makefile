################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2007 1&1 Internet AG, Germany, http://www.1und1.de
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

# need to specify a default target 'source' explicitly; all others are caught
# by '%'
source %: force
	@../../tool/bin/generator.py $@

# this replaces .PHONY
force: ;

# the next one is a hack, since gmake insists of making a target 'Makefile'
# with the above '%' rule
Makefile: ;

# use old Makefile for other targets
#%: force
#	@$(MAKE) -s -f Makefile.gen1 $@
#

