################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1und1.de
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
#
################################################################################

APPLICATIONS = apiviewer demobrowser feedreader showcase testrunner

source:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION source || exit 1; done

build:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION build || exit 1; done

clean:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION clean || exit 1; done

distclean:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION distclean || exit 1; done

publish: build
	@FRAMEWORK_VERSION := $(shell cat ../../VERSION)
	@for APPLICATION in $(APPLICATIONS); do
	  rsync $$APPLICATION/build root@qooxdoo.org:/var/www/qooxdoo/demo/$(FRAMEWORK_VERSION)/$$APPLICATION || exit 1;
	done
