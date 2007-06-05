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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

QOOXDOO_PATH = ../../..
include $(QOOXDOO_PATH)/frontend/framework/tool/make/framework.mk

.PHONY: source build clean distclean api publish fix

source:
	@$(MAKE) -s -f Makefile.browser source
	@$(MAKE) -s -f Makefile.sample source

build:
	@$(MAKE) -s -f Makefile.browser build
	@$(MAKE) -s -f Makefile.sample build

clean:
	@$(MAKE) -s -f Makefile.browser clean
	@$(MAKE) -s -f Makefile.sample clean

distclean:
	@$(MAKE) -s -f Makefile.browser distclean
	@$(MAKE) -s -f Makefile.sample distclean

api:
	@$(MAKE) -s -f Makefile.browser api

publish:
	@echo "  * Syncing files..."
	@$(SILENCE) $(CMD_SYNC_ONLINE) build root@qooxdoo.org:/var/www/qooxdoo/demo/$(FRAMEWORK_VERSION)/demobrowser

fix:
	@$(MAKE) -s -f Makefile.browser fix
	@$(MAKE) -s -f Makefile.sample fix

