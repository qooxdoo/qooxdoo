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
#    * Sebastian Werner (wpbasti)
#    * Andreas Ecker (ecker)
#    * Fabian Jakobs (fjakobs)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

################################################################################
# EXEC TARGETS
################################################################################

#
# Generator targets
#

exec-script-source:
	$(SILENCE) $(CMD_GENERATOR2) -c jobs.json -j source

exec-script-build:
	@echo "ALERT: Be sure to do an initial \"make build\" first!"
	$(SILENCE) $(CMD_GENERATOR2) -c jobs.json -j build

exec-api-build:
	@echo "ALERT: Be sure to do an initial \"make api\" first!"
	$(SILENCE) $(CMD_GENERATOR2) -c jobs.json -j api-build,api-data

exec-api-data:
	@echo
