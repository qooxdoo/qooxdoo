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
# PUBLIC VARIABLES
################################################################################

QOOXDOO_PATH = ..




################################################################################
# INCLUDE CORE
################################################################################

include $(QOOXDOO_PATH)/frontend/framework/tool/make/framework.mk





################################################################################
# PRIVATE VARIABLES
################################################################################

RELEASE_BUILD_UNIX = release/temp/build/unix/qooxdoo-$(FRAMEWORK_VERSION)-build
RELEASE_BUILD_DOS = release/temp/build/dos/qooxdoo-$(FRAMEWORK_VERSION)-build

RELEASE_SDK_UNIX = release/temp/sdk/unix/qooxdoo-$(FRAMEWORK_VERSION)-sdk
RELEASE_SDK_DOS = release/temp/sdk/dos/qooxdoo-$(FRAMEWORK_VERSION)-sdk

APPLICATIONS = apiviewer feedreader sample showcase webmail
SDK_COPY = Makefile application/Makefile application/index.html







################################################################################
# COMMON TARGETS
################################################################################

source:
	@$(MAKE) -s -C application source

build:
	@$(MAKE) -s -C application build

api:
	@$(MAKE) -s -C application api

all:
	@$(MAKE) -s -C application all

locales:
	@$(MAKE) -s -C application locales

pretty: framework-pretty
	@$(MAKE) -s -C application pretty

fix: framework-fix
	@$(MAKE) -s -C application fix

publish:
	@echo "  * Preparing index.html..."
	@$(CMD_DIR) temp/
	@cat application/index.html | \
		sed 's/class="local"/class="local hide"/g' | \
		sed 's/ class="publish"//g' > temp/index.html
	@echo "  * Syncing index.html..."
	@$(CMD_SYNC_ONLINE) temp/index.html root@qooxdoo.org:/var/www/qooxdoo/demo/$(FRAMEWORK_VERSION)/
	@$(CMD_REMOVE) temp
	@$(MAKE) -s -C application publish

clean:
	@$(MAKE) -s -C application clean
	@$(CMD_REMOVE) application/*.tar.gz application/*.zip

distclean:
	@$(MAKE) -s -C application distclean
	@$(CMD_REMOVE) application/*.tar.gz application/*.zip
	@$(MAKE) -s release-distclean
	@$(MAKE) -s framework-distclean

skeleton: skeleton-dos skeleton-unix
quickstart: quickstart-dos quickstart-unix




################################################################################
# FRAMEWORK TARGETS
################################################################################

framework-distclean:
	@echo
	@echo "****************************************************************************"
	@echo "  CLEANING UP FRAMEWORK COMPLETELY"
	@echo "****************************************************************************"
	@echo "  * Cleaning up..."
	@$(CMD_REMOVE) $(FRAMEWORK_CACHE_PATH)
	@$(CMD_REMOVE) $(FRAMEWORK_LOCALE_CLASS_PATH)
	@$(CMD_REMOVE) $(FRAMEWORK_TRANSLATION_CLASS_PATH)
	@$(CMD_REMOVE) application/skeleton.tar.gz
	@$(CMD_REMOVE) application/skeleton.zip
	@$(CMD_FIND) $(FRAMEWORK_PATH) $(FILES_TEMP) -exec $(CMD_REMOVE) {} \;
	@$(CMD_REMOVE) $(FRAMEWORK_TOOL_PATH)/icon/temp


framework-pretty:
	@echo
	@echo "****************************************************************************"
	@echo "  PRETTIFYING FRAMEWORK CLASSES"
	@echo "****************************************************************************"
	@$(CMD_GENERATOR) \
	  --pretty-print \
	  --class-path $(FRAMEWORK_SOURCE_PATH)/class

framework-fix:
	@echo
	@echo "****************************************************************************"
	@echo "  FIXING FRAMEWORK CLASSES"
	@echo "****************************************************************************"
	@$(CMD_GENERATOR) \
	  --fix-source \
	  --class-path $(FRAMEWORK_SOURCE_PATH)/class




################################################################################
# MIGRATION TARGETS
################################################################################


checkout-migration:
	@echo
	@echo "****************************************************************************"
	@echo "  MIGRATE CHECKOUT"
	@echo "****************************************************************************"
	@if [ 1 ]; then \
	  migrate_options="--class-path framework/source/class --migration-input application/sample/source/html/"; \
	  for APPLICATION in $(APPLICATIONS); do \
	    if [ -d application/$$APPLICATION/source/class ]; then \
	      migrate_options="$${migrate_options} --class-path application/$$APPLICATION/source/class"; \
	    fi; \
	  done; \
	  $(CMD_GENERATOR) \
	    --migrate-source --migration-target `echo $(FRAMEWORK_VERSION) | cut -d'-' -f1` \
	    $${migrate_options}; \
	 fi;






################################################################################
# QUICKSTART TARGETS
################################################################################

QUICKSTART_TEMP_UNIX = temp-quickstart-unix
QUICKSTART_TEMP_DOS = temp-quickstart-dos

info-quickstart-unix:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING UNIX VERSION OF QUICKSTART"
	@echo "****************************************************************************"

info-quickstart-dos:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING DOS VERSION OF QUICKSTART"
	@echo "****************************************************************************"

quickstart-unix: info-quickstart-unix exec-quickstart-unix exec-quickstart-unix-post exec-quickstart-unix-clean
quickstart-dos: info-quickstart-dos exec-quickstart-dos exec-quickstart-dos-post exec-quickstart-dos-clean

exec-quickstart-unix: exec-quickstart-unix-collect exec-quickstart-unix-archive
exec-quickstart-dos: exec-quickstart-dos-collect exec-quickstart-dos-archive

exec-quickstart-unix-collect:
	@echo "  * Generating quickstart build..."
	@if [ ! -d application/quickstart/build ]; then $(MAKE) -s -C application/quickstart build; fi

	@$(CMD_DIR) $(QUICKSTART_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart

	@echo "  * Copying info files..."
	@$(CMD_DIR) $(QUICKSTART_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(QUICKSTART_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart; \
	done

	@echo "  * Syncing files..."
	@$(CMD_SYNC_OFFLINE) application/quickstart/build/* $(QUICKSTART_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart/quickstart

exec-quickstart-unix-archive:
	@echo "  * Cleaning up target folders..."
	@$(CMD_FIND) $(QUICKSTART_TEMP_UNIX) $(FILES_TEMP) -exec $(CMD_REMOVE) {} \;

	@echo "  * Switching to Unix line endings..."
	@$(CMD_FIND) $(QUICKSTART_TEMP_UNIX) $(FILES_TEXT) $(CMD_ANY2UNIX)

	@echo "  * Fixing executables..."
	@$(CMD_FIND) $(QUICKSTART_TEMP_UNIX) $(FILES_EXEC) -exec $(CMD_MKEXEC) {} \;

	@echo "  * Building quickstart archive..."
	@$(CMD_REMOVE) $(QUICKSTART_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.tar.gz
	@cd $(QUICKSTART_TEMP_UNIX); $(CMD_TAR_CREATE) qooxdoo-$(FRAMEWORK_VERSION)-quickstart.tar.gz qooxdoo-$(FRAMEWORK_VERSION)-quickstart
	@$(CMD_REMOVE) $(QUICKSTART_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart

exec-quickstart-dos-collect:
	@echo "  * Generating quickstart build..."
	@if [ ! -d application/quickstart/build ]; then $(MAKE) -s -C application/quickstart build; fi

	@$(CMD_DIR) $(QUICKSTART_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart

	@echo "  * Copying info files..."
	@$(CMD_DIR) $(QUICKSTART_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(QUICKSTART_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart; \
	done

	@echo "  * Syncing files..."
	@$(CMD_SYNC_OFFLINE) application/quickstart/build/* $(QUICKSTART_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart/quickstart

exec-quickstart-dos-archive:
	@echo "  * Cleaning up target folders..."
	@$(CMD_FIND) $(QUICKSTART_TEMP_DOS) $(FILES_TEMP) -exec $(CMD_REMOVE) {} \;

	@echo "  * Switching to DOS line endings..."
	@$(CMD_FIND) $(QUICKSTART_TEMP_DOS) $(FILES_TEXT) $(CMD_ANY2DOS)

	@echo "  * Fixing executables..."
	@$(CMD_FIND) $(QUICKSTART_TEMP_DOS) $(FILES_EXEC) -exec $(CMD_MKEXEC) {} \;

	@echo "  * Building quickstart archive..."
	@$(CMD_REMOVE) $(QUICKSTART_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.zip
	@cd $(QUICKSTART_TEMP_DOS); $(CMD_ZIP_CREATE) qooxdoo-$(FRAMEWORK_VERSION)-quickstart.zip qooxdoo-$(FRAMEWORK_VERSION)-quickstart
	@$(CMD_REMOVE) $(QUICKSTART_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart

exec-quickstart-unix-post:
	@echo "  * Copying archive to application folder..."
	@$(CMD_SYNC_OFFLINE) $(QUICKSTART_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.tar.gz application/
	@echo
	@echo "  * Created application/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.tar.gz"
	@echo "    Please extract to a location outside this qooxdoo folder."

exec-quickstart-dos-post:
	@echo "  * Copying archive to application folder..."
	@$(CMD_SYNC_OFFLINE) $(QUICKSTART_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.zip application/
	@echo
	@echo "  * Created application/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.zip"
	@echo "    Please extract to a location outside this qooxdoo folder."

exec-quickstart-unix-clean:
	@$(CMD_REMOVE) $(QUICKSTART_TEMP_UNIX)

exec-quickstart-dos-clean:
	@$(CMD_REMOVE) $(QUICKSTART_TEMP_DOS)








################################################################################
# SKELETON TARGETS
################################################################################

SKELETON_TEMP_UNIX = temp-skeleton-unix
SKELETON_TEMP_DOS = temp-skeleton-dos

SKELETON_FILES = Makefile source/class source/resource source/index.html

info-skeleton-unix:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING UNIX VERSION OF SKELETON"
	@echo "****************************************************************************"

info-skeleton-dos:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING DOS VERSION OF SKELETON"
	@echo "****************************************************************************"

skeleton-unix: info-skeleton-unix exec-skeleton-unix exec-skeleton-unix-post exec-skeleton-unix-clean
skeleton-dos: info-skeleton-dos exec-skeleton-dos exec-skeleton-dos-post exec-skeleton-dos-clean

exec-skeleton-unix: exec-skeleton-unix-collect exec-skeleton-unix-archive
exec-skeleton-dos: exec-skeleton-dos-collect exec-skeleton-dos-archive

exec-skeleton-unix-collect:
	@echo "  * Copying info files..."
	@$(CMD_DIR) $(SKELETON_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(SKELETON_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton; \
	done

	@echo "  * Collecting skeleton files..."
	@$(CMD_DIR) $(SKELETON_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton
	@for FILE in $(SKELETON_FILES); do \
    	echo "    - $$FILE"; \
    	$(CMD_DIR) `dirname $(SKELETON_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton/skeleton/$$FILE`; \
	  	$(CMD_SYNC_OFFLINE) application/skeleton/$$FILE `dirname $(SKELETON_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton/skeleton/$$FILE`; \
  	done

exec-skeleton-unix-archive:
	@echo "  * Cleaning up target folders..."
	@$(CMD_FIND) $(SKELETON_TEMP_UNIX) $(FILES_TEMP) -exec $(CMD_REMOVE) {} \;

	@echo "  * Switching to Unix line endings..."
	@$(CMD_FIND) $(SKELETON_TEMP_UNIX) $(FILES_TEXT) $(CMD_ANY2UNIX)

	@echo "  * Fixing executables..."
	@$(CMD_FIND) $(SKELETON_TEMP_UNIX) $(FILES_EXEC) -exec $(CMD_MKEXEC) {} \;

	@echo "  * Building skeleton archive..."
	@$(CMD_REMOVE) $(SKELETON_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton.tar.gz
	@cd $(SKELETON_TEMP_UNIX); $(CMD_TAR_CREATE) qooxdoo-$(FRAMEWORK_VERSION)-skeleton.tar.gz qooxdoo-$(FRAMEWORK_VERSION)-skeleton
	@$(CMD_REMOVE) $(SKELETON_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton

exec-skeleton-dos-collect:
	@echo "  * Copying info files..."
	@$(CMD_DIR) $(SKELETON_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(SKELETON_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton; \
	done

	@echo "  * Collecting skeleton files..."
	@$(CMD_DIR) $(SKELETON_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton
	@for FILE in $(SKELETON_FILES); do \
    	echo "    - $$FILE"; \
    	$(CMD_DIR) `dirname $(SKELETON_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton/skeleton/$$FILE`; \
	  	$(CMD_SYNC_OFFLINE) application/skeleton/$$FILE `dirname $(SKELETON_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton/skeleton/$$FILE`; \
  	done

exec-skeleton-dos-archive:
	@echo "  * Cleaning up target folders..."
	@$(CMD_FIND) $(SKELETON_TEMP_DOS) $(FILES_TEMP) -exec $(CMD_REMOVE) {} \;

	@echo "  * Switching to DOS line endings..."
	@$(CMD_FIND) $(SKELETON_TEMP_DOS) $(FILES_TEXT) $(CMD_ANY2DOS)

	@echo "  * Fixing executables..."
	@$(CMD_FIND) $(SKELETON_TEMP_DOS) $(FILES_EXEC) -exec $(CMD_MKEXEC) {} \;

	@echo "  * Building skeleton archive..."
	@$(CMD_REMOVE) $(SKELETON_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton.zip
	@cd $(SKELETON_TEMP_DOS); $(CMD_ZIP_CREATE) qooxdoo-$(FRAMEWORK_VERSION)-skeleton.zip qooxdoo-$(FRAMEWORK_VERSION)-skeleton
	@$(CMD_REMOVE) $(SKELETON_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton

exec-skeleton-unix-post:
	@echo "  * Copying archive to application folder..."
	@$(CMD_SYNC_OFFLINE) $(SKELETON_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton.tar.gz application/
	@echo
	@echo "  * Created application/qooxdoo-$(FRAMEWORK_VERSION)-skeleton.tar.gz"
	@echo "    Please extract to a location outside this qooxdoo folder."

exec-skeleton-dos-post:
	@echo "  * Copying archive to application folder..."
	@$(CMD_SYNC_OFFLINE) $(SKELETON_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton.zip application/
	@echo
	@echo "  * Created application/qooxdoo-$(FRAMEWORK_VERSION)-skeleton.zip"
	@echo "    Please extract to a location outside this qooxdoo folder."

exec-skeleton-unix-clean:
	@$(CMD_REMOVE) $(SKELETON_TEMP_UNIX)

exec-skeleton-dos-clean:
	@$(CMD_REMOVE) $(SKELETON_TEMP_DOS)








################################################################################
# RELEASE TARGETS
################################################################################

release-distclean:
	@echo
	@echo "****************************************************************************"
	@echo "  CLEANING UP RELEASE COMPLETELY"
	@echo "****************************************************************************"
	@echo "  * Cleaning up..."
	@$(CMD_REMOVE) release




release: release-sdk release-build release-quickstart
release-fast: release-build-fast release-sdk-fast




release-build: build release-build-fast
release-build-fast: release-build-info release-build-unix release-build-dos

release-build-info:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING BUILD VERSION OF RELEASE $(FRAMEWORK_VERSION)"
	@echo "****************************************************************************"

release-build-unix:
	@echo
	@echo "  SYNCHRONISATION OF BUILD RELEASE (UNIX VERSION)"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@$(CMD_DIR) $(RELEASE_BUILD_UNIX)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_BUILD_UNIX); \
	done

	@echo "  * Synchronizing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
		echo "    - $$APPLICATION"; \
	  $(CMD_DIR) $(RELEASE_BUILD_UNIX)/frontend/$$APPLICATION; \
		if [ ! -r application/$$APPLICATION/build ]; then \
		  echo "      - Missing build folder! Run $(MAKE) build first!"; \
		  exit 1; \
		fi; \
	  $(CMD_SYNC_OFFLINE) application/$$APPLICATION/build/* $(RELEASE_BUILD_UNIX)/frontend/$$APPLICATION; \
	done
	@echo "  * Generating index.html..."
	@cat application/index.html | \
		sed 's/class="local"/class="local hide"/g' | \
		sed 's/ class="publish"//g' > $(RELEASE_BUILD_UNIX)/frontend/index.html

	@echo "  * Switching to Unix line endings..."
	@$(CMD_FIND) $(RELEASE_BUILD_UNIX) $(FILES_TEXT) $(CMD_ANY2UNIX)

	@echo "  * Generating tar archive..."
	@cd release/temp/build/unix; $(CMD_REMOVE) qooxdoo-$(FRAMEWORK_VERSION)-build.tar.gz; $(CMD_NICE) tar cfzp ../../../qooxdoo-$(FRAMEWORK_VERSION)-build.tar.gz qooxdoo-$(FRAMEWORK_VERSION)-build

release-build-dos:
	@echo
	@echo "  SYNCHRONISATION OF BUILD RELEASE (DOS VERSION)"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@$(CMD_DIR) $(RELEASE_BUILD_DOS)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_BUILD_DOS); \
	done

	@echo "  * Synchronizing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
		echo "    - $$APPLICATION"; \
	  $(CMD_DIR) $(RELEASE_BUILD_DOS)/frontend/$$APPLICATION; \
		if [ ! -r application/$$APPLICATION/build ]; then \
		  echo "      - Missing build folder! Run $(MAKE) build first!"; \
		  exit 1; \
		fi; \
	  $(CMD_SYNC_OFFLINE) application/$$APPLICATION/build/* $(RELEASE_BUILD_DOS)/frontend/$$APPLICATION; \
	done

	@echo "  * Generating index.html..."
	@cat application/index.html | \
		sed 's/class="local"/class="local hide"/g' | \
		sed 's/ class="publish"//g' > $(RELEASE_BUILD_DOS)/frontend/index.html

	@echo "  * Switching to DOS line endings..."
	@$(CMD_FIND) $(RELEASE_BUILD_DOS) $(FILES_TEXT) $(CMD_ANY2DOS)

	@echo "  * Generating zip archive..."
	@cd release/temp/build/dos; $(CMD_REMOVE) qooxdoo-$(FRAMEWORK_VERSION)-build.zip; $(CMD_NICE) zip -rq ../../../qooxdoo-$(FRAMEWORK_VERSION)-build.zip qooxdoo-$(FRAMEWORK_VERSION)-build









release-sdk: distclean release-sdk-fast
release-sdk-fast: release-sdk-info release-sdk-unix release-sdk-dos

release-sdk-info:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING SDK VERSION OF RELEASE $(FRAMEWORK_VERSION)"
	@echo "****************************************************************************"

release-sdk-unix:
	@echo
	@echo "  SYNCHRONISATION OF SDK RELEASE (UNIX VERSION)"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@$(CMD_DIR) $(RELEASE_SDK_UNIX)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_SDK_UNIX); \
	done

	@echo "  * Synchronizing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
		echo "    - $$APPLICATION"; \
	  $(CMD_DIR) $(RELEASE_SDK_UNIX)/frontend/application/$$APPLICATION; \
	  $(CMD_SYNC_OFFLINE) --exclude script --exclude build --exclude publish application/$$APPLICATION/* $(RELEASE_SDK_UNIX)/frontend/application/$$APPLICATION; \
	done

	@echo "  * Synchronizing framework..."
	@$(CMD_DIR) $(RELEASE_SDK_UNIX)/frontend/framework
	@$(CMD_SYNC_OFFLINE) --exclude .cache --exclude tool/icon/themes --exclude tool/icon/temp framework/* $(RELEASE_SDK_UNIX)/frontend/framework

	@echo "  * Copying remaining SDK files..."
	@for ITEM in $(SDK_COPY); do \
	  cp -f $$ITEM $(RELEASE_SDK_UNIX)/frontend/$$ITEM; \
	done

	@$(MAKE) -s exec-skeleton-unix
	@$(CMD_SYNC_OFFLINE) $(SKELETON_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton.tar.gz $(RELEASE_SDK_UNIX)/frontend/application/
	@$(MAKE) -s exec-skeleton-unix-clean

	@$(MAKE) -s exec-quickstart-unix
	@$(CMD_SYNC_OFFLINE) $(QUICKSTART_TEMP_UNIX)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.tar.gz $(RELEASE_SDK_UNIX)/frontend/application/
	@$(MAKE) -s exec-quickstart-unix-clean

	@echo "  * Generating tar archive..."
	@cd release/temp/sdk/unix; $(CMD_REMOVE) qooxdoo-$(FRAMEWORK_VERSION)-sdk.tar.gz; $(CMD_TAR_CREATE) ../../../qooxdoo-$(FRAMEWORK_VERSION)-sdk.tar.gz qooxdoo-$(FRAMEWORK_VERSION)-sdk

release-sdk-dos:
	@echo
	@echo "  SYNCHRONISATION OF SDK RELEASE (DOS VERSION)"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@$(CMD_DIR) $(RELEASE_SDK_DOS)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_SDK_DOS); \
	done

	@echo "  * Synchronizing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
		echo "    - $$APPLICATION"; \
	  $(CMD_DIR) $(RELEASE_SDK_DOS)/frontend/application/$$APPLICATION; \
	  $(CMD_SYNC_OFFLINE) --exclude script --exclude build --exclude publish application/$$APPLICATION/* $(RELEASE_SDK_DOS)/frontend/application/$$APPLICATION; \
	done

	@echo "  * Synchronizing framework..."
	@$(CMD_DIR) $(RELEASE_SDK_DOS)/frontend/framework
	@$(CMD_SYNC_OFFLINE) --exclude .cache --exclude tool/icon/themes --exclude tool/icon/temp framework/* $(RELEASE_SDK_DOS)/frontend/framework

	@echo "  * Copying remaining SDK files..."
	@for ITEM in $(SDK_COPY); do \
	  cp -f $$ITEM $(RELEASE_SDK_DOS)/frontend/$$ITEM; \
	done

	@$(MAKE) -s exec-skeleton-dos
	@$(CMD_SYNC_OFFLINE) $(SKELETON_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-skeleton.zip $(RELEASE_SDK_DOS)/frontend/application/
	@$(MAKE) -s exec-skeleton-dos-clean

	@$(MAKE) -s exec-quickstart-dos
	@$(CMD_SYNC_OFFLINE) $(QUICKSTART_TEMP_DOS)/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.zip $(RELEASE_SDK_DOS)/frontend/application/
	@$(MAKE) -s exec-quickstart-dos-clean

	@echo "  * Generating zip archive..."
	@cd release/temp/sdk/dos; $(CMD_REMOVE) qooxdoo-$(FRAMEWORK_VERSION)-sdk.zip; $(CMD_ZIP_CREATE) ../../../qooxdoo-$(FRAMEWORK_VERSION)-sdk.zip qooxdoo-$(FRAMEWORK_VERSION)-sdk








release-quickstart: release-quickstart-info release-quickstart-unix release-quickstart-dos

release-quickstart-info:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING QUICKSTART VERSION OF RELEASE $(FRAMEWORK_VERSION)"
	@echo "****************************************************************************"

release-quickstart-unix:
	@echo
	@echo "  SYNCHRONISATION OF QUICKSTART RELEASE (UNIX VERSION)"
	@echo "----------------------------------------------------------------------------"

	@$(CMD_DIR) release
	@$(MAKE) -s exec-quickstart-unix
	@$(CMD_SYNC_OFFLINE) $(QUICKSTART_TEMP_UNIX)/quickstart.tar.gz release/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.tar.gz
	@$(MAKE) -s exec-quickstart-unix-clean

release-quickstart-dos:
	@echo
	@echo "  SYNCHRONISATION OF QUICKSTART RELEASE (UNIX VERSION)"
	@echo "----------------------------------------------------------------------------"

	@$(CMD_DIR) release
	@$(MAKE) -s exec-quickstart-dos
	@$(CMD_SYNC_OFFLINE) $(QUICKSTART_TEMP_DOS)/quickstart.zip release/qooxdoo-$(FRAMEWORK_VERSION)-quickstart.zip
	@$(MAKE) -s exec-quickstart-dos-clean










################################################################################
# READY TARGET
################################################################################

ready:
	@BASE_REQUIREMENTS="python rsync"; \
	I18N_REQUIREMENTS="gettext xgettext msginit msgmerge"; \
	EXT_REQUIREMENTS="tar gzip zip unzip"; \
	OPTIONALS="wget curl"; \
	FAILED_BASE=; \
	FAILED_I18N=; \
	FAILED_EXT=; \
	FAILED_OPTS=; \
	echo ;\
	echo "  CHECKING ENVIRONMENT"; \
	echo "----------------------------------------------------------------------------"; \
	echo ;\
	# checking for base requirements - remembering any unmet requirement \
	echo "    Checking for basic packages..."; \
	for REQ in $$BASE_REQUIREMENTS; do \
		if ! which $$REQ > /dev/null 2>&1; then \
			FAILED_BASE="$$FAILED_BASE $$REQ"; \
		fi \
	done; \
	\
	# checking for i18n requirements - remembering any unmet requirement \
	echo "    Checking for i18n packages..."; \
	for REQ in $$I18N_REQUIREMENTS; do \
		if ! which $$REQ > /dev/null 2>&1; then \
			FAILED_I18N="$$FAILED_I18N $$REQ"; \
		fi \
	done; \
	\
	# checking for extended requirements - remembering any unmet requirement \
	echo "    Checking for extended packages..."; \
	for REQ in $$EXT_REQUIREMENTS; do \
		if ! which $$REQ > /dev/null 2>&1; then \
			FAILED_EXT="$$FAILED_EXT $$REQ"; \
		fi \
	done; \
	\
	# checking for optional software - remembering any not installed optional \
	echo "    Checking for optional packages..."; \
	for OPT in $$OPTIONALS; do \
		if ! which $$OPT > /dev/null 2>&1; then \
			FAILED_OPTS="$$FAILED_OPTS $$OPT"; \
		fi \
	done; \
	\
	echo ; \
	# check for failed requirements - list all unmet requirements \
	if [ "$$FAILED_BASE" ]; then \
		echo ;\
		echo "    FOLLOWING BASE PACKAGES ARE MISSING:"; \
		for FAILED_REQ in $$FAILED_BASE; do \
			case $$FAILED_REQ in \
				"python" ) \
				echo "      * python (a script language, at least version 2.3)"; \
				;;\
				\
				"rsync" ) \
				echo "      * rsync (a file synchronizer)"; \
				;;\
			esac; \
		done; \
	fi; \
	if [ "$$FAILED_I18N" ]; then \
		echo ;\
		echo "    FOLLOWING I18N PACKAGES ARE MISSING:"; \
		for FAILED_REQ in $$FAILED_I18N; do \
			case $$FAILED_REQ in \
				"gettext" ) \
				echo "      * gettext"; \
				;;\
				\
				"xgettext" ) \
				echo "      * xgettext (gettext-tools)"; \
				;;\
				\
				"msginit" ) \
				echo "      * msginit (gettext-tools)"; \
				;;\
				\
				"msgmerge" ) \
				echo "      * msgmerge (gettext-tools)"; \
				;;\
				\
			esac; \
		done; \
	fi; \
	if [ "$$FAILED_EXT" ]; then \
		echo ;\
		echo "    FOLLOWING EXTENDED PACKAGES ARE MISSING:"; \
		for FAILED_REQ in $$FAILED_EXT; do \
			case $$FAILED_REQ in \
				"tar" ) \
				echo "      * tar (compressor and decompressor)"; \
				;;\
				\
				"gzip" ) \
				echo "      * gzip (compressor and decompressor)"; \
				;;\
				\
				"zip" ) \
				echo "      * zip (compressor)"; \
				;;\
				\
				"unzip" ) \
				echo "      * unzip (decompressor)"; \
				;;\
			esac; \
		done; \
	fi; \
	if [[ ! "$$FAILED_BASE" && ! "$$FAILED_I18N" && ! "$$FAILED_EXT" ]]; then \
		echo ; \
		echo "    *** ALL PACKAGES FOR QOOXDOO ARE INSTALLED ***"; \
	else \
		echo ; \
		echo "    Please take a look at the requirements page at http://qooxdoo.org/documentation/user_manual/requirements"; \
	fi;\
	# list all not installed optional software packages \
	if [ "$$FAILED_OPTS" ]; then \
		echo ; \
		echo "    FOLLOWING PACKAGES ARE OPTIONAL TO INSTALL:"; \
		echo "      * wget or curl (for downloading additional locale information)"; \
	fi; \
	\
	exit 0;
