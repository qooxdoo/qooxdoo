################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1and1.org
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

################################################################################
# VARIABLES
################################################################################

FRAMEWORK_VERSION := $(shell svn propget qx:version .)
FRAMEWORK_SVNINFO := $(shell python tool/svninfo.py .)

CMD_LINE = echo "----------------------------------------------------------------------------"
CMD_NICE = nice -n 10
CMD_PYTHON = $(CMD_NICE) python -t -O
CMD_REMOVE = $(CMD_NICE) rm -rf
CMD_DIR = $(CMD_NICE) mkdir -p
CMD_FIND = $(CMD_NICE) find
CMD_ZIP = $(CMD_NICE) zip
CMD_ZIP_CREATE = $(CMD_ZIP) -rq
CMD_ANY2UNIX = | xargs $(CMD_PYTHON) $(FRAMEWORK_TOOL_PATH)/modules/textutil.py --command any2Unix
CMD_MKEXEC = $(CMD_NICE) chmod a+rx

FILES_TEXT = \( -name "*.py" -o -name "*.sh" -o -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile -o -name AUTHORS -o -name LICENSE -o -name README -o -name RELEASENOTES -o -name TODO \)
FILES_TEMP = \( -name "*.rej" -o -name "*.orig" -o -name "*.pyc" -o -name "*.pyo" -o -name "*.bak" -o -name "*.old" -o -name "*~" -o -name "messages.pot" \)
FILES_EXEC = \( -name "*.py" -o -name "*.sh" \)

CMD_SYNC_ONLINE = $(CMD_NICE) rsync --checksum --compress --recursive --delete --inplace --links --safe-links --exclude .svn
CMD_SYNC_OFFLINE = $(CMD_NICE) rsync --recursive --delete --inplace --links --safe-links --exclude .svn

RELEASE_BUILD = release/temp/build/qooxdoo-$(FRAMEWORK_VERSION)-build
RELEASE_SDK = release/temp/sdk/qooxdoo-$(FRAMEWORK_VERSION)-sdk

APPLICATIONS = apiviewer demobrowser feedreader showcase testrunner
SDK_COPY = Makefile application/index.html





################################################################################
# COMMON TARGETS
################################################################################

source:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C application/$$APPLICATION source || exit 1; done

build:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C application/$$APPLICATION build || exit 1; done

clean:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C application/$$APPLICATION clean || exit 1; done
	@$(MAKE) -s -C framework clean
	@$(CMD_REMOVE) application/*.zip
	@$(CMD_REMOVE) release/temp

distclean:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C application/$$APPLICATION distclean || exit 1; done
	@$(MAKE) -s -C framework distclean
	@$(CMD_REMOVE) application/*.zip
	@$(CMD_REMOVE) release

publish:
	@echo "  * Preparing index.html..."
	@$(CMD_DIR) temp/
	@cat application/index.html | \
		sed 's/class="local"/class="local hide"/g' | \
		sed 's/ class="publish"//g' > temp/index.html
	@echo "  * Syncing index.html..."
	@$(CMD_SYNC_ONLINE) temp/index.html root@qooxdoo.org:/var/www/qooxdoo/demo/$(FRAMEWORK_VERSION)/
	@$(CMD_REMOVE) temp
	@echo "  * Syncing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
	  echo "    - $$APPLICATION..."; \
	  rsync --checksum --compress --recursive --delete --inplace --links --safe-links --exclude .svn application/$$APPLICATION/build/* root@qooxdoo.org:/var/www/qooxdoo/demo/$(FRAMEWORK_VERSION)/$$APPLICATION || exit 1; \
	done






################################################################################
# MIGRATION TARGETS
################################################################################

checkout-migration:
	@echo
	@echo "****************************************************************************"
	@echo "  MIGRATE CHECKOUT"
	@echo "****************************************************************************"
	@if [ 1 ]; then \
	  migrate_options="--class-path framework/source/class --migration-input application/demobrowser/source/html/"; \
	  for APPLICATION in $(APPLICATIONS); do \
	    if [ -d application/$$APPLICATION/source/class ]; then \
	      migrate_options="$${migrate_options} --class-path application/$$APPLICATION/source/class"; \
	    fi; \
	  done; \
	  $(CMD_GENERATOR) \
	    --migrate-source --migration-target `echo $(FRAMEWORK_VERSION)` \
	    $${migrate_options}; \
	 fi;






################################################################################
# QUICKSTART TARGETS
################################################################################

QUICKSTART_TEMP = temp-quickstart

info-quickstart:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING QUICKSTART"
	@echo "****************************************************************************"

quickstart: exec-quickstart-build info-quickstart exec-quickstart-collect exec-quickstart-archive

exec-quickstart-build:
	@$(MAKE) -s -C application/quickstart build

exec-quickstart-collect:
	@$(CMD_DIR) $(QUICKSTART_TEMP)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart

	@echo "  * Copying info files..."
	@$(CMD_DIR) $(QUICKSTART_TEMP)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(QUICKSTART_TEMP)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart; \
	done

	@echo "  * Syncing files..."
	@$(CMD_SYNC_OFFLINE) application/quickstart/build/* $(QUICKSTART_TEMP)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart/quickstart

exec-quickstart-archive:
	@echo "  * Cleaning up target folders..."
	@$(CMD_FIND) $(QUICKSTART_TEMP) $(FILES_TEMP) -exec $(CMD_REMOVE) {} \;

	@echo "  * Switching to Unix line endings..."
	@$(CMD_FIND) $(QUICKSTART_TEMP) $(FILES_TEXT) $(CMD_ANY2UNIX)

	@echo "  * Fixing executables..."
	@$(CMD_FIND) $(QUICKSTART_TEMP) $(FILES_EXEC) -exec $(CMD_MKEXEC) {} \;

	@echo "  * Building quickstart archive..."
	@cd $(QUICKSTART_TEMP); $(CMD_REMOVE) ../application/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.zip; $(CMD_ZIP_CREATE) ../application/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.zip qooxdoo-$(FRAMEWORK_VERSION)-quickstart

	@echo "  * Cleaning up temporary folder..."
	@$(CMD_REMOVE) $(QUICKSTART_TEMP)

	@echo "  * Created application/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.zip"






################################################################################
# SKELETON TARGETS
################################################################################

SKELETON_TEMP = temp-skeleton
SKELETON_FILES = Makefile source/class source/resource source/index.html

info-skeleton:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING SKELETON"
	@echo "****************************************************************************"

skeleton: info-skeleton exec-skeleton-collect exec-skeleton-archive

exec-skeleton-collect:
	@echo "  * Copying info files..."
	@$(CMD_DIR) $(SKELETON_TEMP)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(SKELETON_TEMP)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton; \
	done

	@echo "  * Collecting skeleton files..."
	@$(CMD_DIR) $(SKELETON_TEMP)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton
	@for FILE in $(SKELETON_FILES); do \
    	echo "    - $$FILE"; \
    	$(CMD_DIR) `dirname $(SKELETON_TEMP)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton/skeleton/$$FILE`; \
	  	$(CMD_SYNC_OFFLINE) application/skeleton/$$FILE `dirname $(SKELETON_TEMP)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton/skeleton/$$FILE`; \
  	done

exec-skeleton-archive:
	@echo "  * Cleaning up target folders..."
	@$(CMD_FIND) $(SKELETON_TEMP) $(FILES_TEMP) -exec $(CMD_REMOVE) {} \;

	@echo "  * Switching to Unix line endings..."
	@$(CMD_FIND) $(SKELETON_TEMP) $(FILES_TEXT) $(CMD_ANY2UNIX)

	@echo "  * Fixing executables..."
	@$(CMD_FIND) $(SKELETON_TEMP) $(FILES_EXEC) -exec $(CMD_MKEXEC) {} \;

	@echo "  * Building skeleton archive..."
	@cd $(SKELETON_TEMP); $(CMD_REMOVE) ../application/qooxdoo-$(FRAMEWORK_VERSION)-skeleton.zip; $(CMD_ZIP_CREATE) ../application/qooxdoo-$(FRAMEWORK_VERSION)-skeleton.zip qooxdoo-$(FRAMEWORK_VERSION)-skeleton

	@echo "  * Cleaning up temporary folder..."
	@$(CMD_REMOVE) $(SKELETON_TEMP)

	@echo "  * Created application/qooxdoo-$(FRAMEWORK_VERSION)-skeleton.zip"





################################################################################
# RELEASE TARGETS
################################################################################

release: release-sdk release-build release-quickstart

release-build: build release-build-info release-build-collect quickstart release-build-archive

release-build-info:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING BUILD VERSION OF RELEASE $(FRAMEWORK_VERSION)"
	@echo "****************************************************************************"

release-build-collect:
	@echo
	@echo "  SYNCHRONISATION OF BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@$(CMD_DIR) $(RELEASE_BUILD)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_BUILD); \
	done

	@echo "  * Synchronizing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
		echo "    - $$APPLICATION"; \
	  $(CMD_DIR) $(RELEASE_BUILD)/frontend/$$APPLICATION; \
		if [ ! -r application/$$APPLICATION/build ]; then \
		  echo "      - Missing build folder! Run $(MAKE) build first!"; \
		  exit 1; \
		fi; \
	  $(CMD_SYNC_OFFLINE) application/$$APPLICATION/build/* $(RELEASE_BUILD)/frontend/$$APPLICATION; \
	done

	@echo "  * Generating index.html..."
	@cat application/index.html | \
		sed 's/class="local"/class="local hide"/g' | \
		sed 's/ class="publish"//g' > $(RELEASE_BUILD)/frontend/index.html

	@echo "  * Switching to Unix line endings..."
	@$(CMD_FIND) $(RELEASE_BUILD) $(FILES_TEXT) $(CMD_ANY2UNIX)

release-build-archive:
	@echo "  * Synchronizing quickstart..."
	@$(CMD_SYNC_OFFLINE) application/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.zip $(RELEASE_BUILD)/frontend/

	@echo "  * Generating zip archive..."
	@cd release/temp/build; $(CMD_REMOVE) ../../../qooxdoo-$(FRAMEWORK_VERSION)-build.zip; $(CMD_NICE) zip -rq ../../../qooxdoo-$(FRAMEWORK_VERSION)-build.zip qooxdoo-$(FRAMEWORK_VERSION)-build

	@echo "  * Cleaning up..."
	@rm -rf release/temp






release-sdk: distclean release-sdk-info release-sdk-collect skeleton quickstart release-sdk-archive

release-sdk-info:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING SDK VERSION OF RELEASE $(FRAMEWORK_VERSION)"
	@echo "****************************************************************************"

release-sdk-collect:
	@echo
	@echo "  SYNCHRONISATION OF SDK RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@$(CMD_DIR) $(RELEASE_SDK)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_SDK); \
	done

	@echo "  * Synchronizing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
		echo "    - $$APPLICATION"; \
	  $(CMD_DIR) $(RELEASE_SDK)/frontend/application/$$APPLICATION; \
	  $(CMD_SYNC_OFFLINE) --exclude script --exclude build --exclude publish application/$$APPLICATION/* $(RELEASE_SDK)/frontend/application/$$APPLICATION; \
	done

	@echo "  * Synchronizing framework..."
	@$(CMD_DIR) $(RELEASE_SDK)/frontend/framework
	@$(CMD_SYNC_OFFLINE) --exclude *.pyo --exclude *.pyc --exclude .cache --exclude tool/icon/themes --exclude tool/icon/temp framework/* $(RELEASE_SDK)/frontend/framework

	@echo "  * Synchronizing tools..."
	@$(CMD_DIR) $(RELEASE_SDK)/frontend/tool
	@$(CMD_SYNC_OFFLINE) --exclude *.pyo --exclude *.pyc tool/* $(RELEASE_SDK)/frontend/tool

	@echo "  * Copying remaining SDK files..."
	@for ITEM in $(SDK_COPY); do \
	  cp -rf $$ITEM $(RELEASE_SDK)/frontend/$$ITEM; \
	done

	@echo "  * Switching to Unix line endings..."
	@$(CMD_FIND) $(RELEASE_SDK) $(FILES_TEXT) $(CMD_ANY2UNIX)

release-sdk-archive:
	@echo "  * Synchronizing quickstart & skeleton..."
	@$(CMD_SYNC_OFFLINE) application/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.zip $(RELEASE_SDK)/frontend/application/
	@$(CMD_SYNC_OFFLINE) application/qooxdoo-$(FRAMEWORK_VERSION)-skeleton.zip $(RELEASE_SDK)/frontend/application/

	@echo "  * Generating zip archive..."
	@cd release/temp/sdk; $(CMD_REMOVE) ../../../qooxdoo-$(FRAMEWORK_VERSION)-sdk.zip; $(CMD_ZIP_CREATE) ../../../qooxdoo-$(FRAMEWORK_VERSION)-sdk.zip qooxdoo-$(FRAMEWORK_VERSION)-sdk

	@echo "  * Cleaning up..."
	@rm -rf release/temp





release-quickstart: quickstart
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING QUICKSTART VERSION OF RELEASE $(FRAMEWORK_VERSION)"
	@echo "****************************************************************************"

	@echo
	@echo "  SYNCHRONISATION OF QUICKSTART RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Synchronizing quickstart..."
	@$(CMD_DIR) release
	@$(CMD_SYNC_OFFLINE) application/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.zip release/
