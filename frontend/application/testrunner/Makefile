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

.PHONY: source build clean distclean api publish fix

source:
	@$(MAKE) -s -f Makefile.runner source
	@$(MAKE) -s -f Makefile.tests source

build:
	@$(MAKE) -s -f Makefile.runner build
	@$(MAKE) -s -f Makefile.tests build

clean:
	@$(MAKE) -s -f Makefile.runner clean
	@$(MAKE) -s -f Makefile.tests clean

distclean:
	@$(MAKE) -s -f Makefile.runner distclean
	@$(MAKE) -s -f Makefile.tests distclean

api:
	@$(MAKE) -s -f Makefile.runner api

publish:
	@$(MAKE) -s -f Makefile.runner publish
	@$(MAKE) -s -f Makefile.tests publish

fix:
	@$(MAKE) -s -f Makefile.runner fix
	@$(MAKE) -s -f Makefile.tests fix

locales:
	@$(MAKE) -s -f Makefile.runner locales
	@$(MAKE) -s -f Makefile.tests locales
