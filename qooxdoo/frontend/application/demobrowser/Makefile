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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

QOOXDOO_PATH = ../../..
include $(QOOXDOO_PATH)/frontend/framework/tool/make/framework.mk

.PHONY: source build clean distclean api publish fix

source:
	@$(MAKE) -s -f Makefile.demobrowser source
	@$(MAKE) -s -f Makefile.demo source

build:
	@$(MAKE) -s -f Makefile.demobrowser build
	@$(MAKE) -s -f Makefile.demo build

clean:
	@$(MAKE) -s -f Makefile.demobrowser clean
	@$(MAKE) -s -f Makefile.demo clean

distclean:
	@$(MAKE) -s -f Makefile.demobrowser distclean
	@$(MAKE) -s -f Makefile.demo distclean

locales:
	@$(MAKE) -s -f Makefile.demobrowser locales

api:
	@$(MAKE) -s -f Makefile.demobrowser api

publish: build
	@echo "  * Syncing files..."
	@$(SILENCE) $(CMD_SYNC_ONLINE) build/* root@qooxdoo.org:/var/www/qooxdoo/demo/$(FRAMEWORK_VERSION)/demobrowser

fix:
	@$(MAKE) -s -f Makefile.demobrowser fix
	@$(MAKE) -s -f Makefile.demo fix

