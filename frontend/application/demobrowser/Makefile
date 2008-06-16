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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

.PHONY: source build api

source:
	@./tool/genjson.py source/script
	@../../tool/generator.py -c config.json source

build:
	@./tool/genjson.py build/script
	@../../tool/generator.py -c config.json build

api:
	@../../tool/generator.py -c config.json api

debug:
	@../../tool/generator.py -c config.json debug-privates

# use old Makefile for other targets
%: force
	@$(MAKE) -s -f Makefile.gen1 $@

force: ;
