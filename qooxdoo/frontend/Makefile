###################################################################################
# PUBLIC VARIABLES
###################################################################################

VERSION = 0.6.5-pre
NICE = 10
QOOXDOO_PATH = ..




###################################################################################
# INCLUDE CORE
###################################################################################

include $(QOOXDOO_PATH)/frontend/framework/tool/make/framework.mk




###################################################################################
# PRIVATE VARIABLES
###################################################################################

RELEASE_BUILD_UNIX = release/temp/build/unix/qooxdoo-$(VERSION)-build
RELEASE_BUILD_DOS = release/temp/build/dos/qooxdoo-$(VERSION)-build

RELEASE_SDK_UNIX = release/temp/sdk/unix/qooxdoo-$(VERSION)-sdk
RELEASE_SDK_DOS = release/temp/sdk/dos/qooxdoo-$(VERSION)-sdk

TEXT_FILES = -name "*.py" -o -name "*.sh" -o -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile -o -name AUTHORS -o -name LICENSE -o -name README -o -name RELEASENOTES -o -name TODO
TEMP_FILES = -name "*.pyc" -o -name "*.bak" -o -name "*.old" -o -name "*~" -o -name "messages.pot"
EXEC_FILES = -name "*.py" -o -name "*.sh"

CMD_NICE = nice -n $(NICE)
CMD_RSYNC = $(CMD_NICE) rsync --recursive --delete --exclude .svn
CMD_PYTHON = python

ANY2DOS = | xargs $(CMD_PYTHON) framework/tool/modules/textutil.py --command any2Dos
ANY2UNIX = | xargs $(CMD_PYTHON) framework/tool/modules/textutil.py --command any2Unix

APPLICATIONS = apiviewer feedreader sample showcase webmail
SDK_FILES = Makefile application/Makefile application/index.html







###################################################################################
# COMMON TARGETS
###################################################################################

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
	@$(MAKE) -s -C application publish

clean:
	@$(MAKE) -s -C application clean

distclean: release-distclean framework-distclean
	@$(MAKE) -s -C application distclean






###################################################################################
# FRAMEWORK TARGETS
###################################################################################

framework-distclean:
	@echo
	@echo "****************************************************************************"
	@echo "  COMPLETELY CLEANING UP FRAMEWORK"
	@echo "****************************************************************************"
	@echo "  * Cleaning up..."
	@$(CMD_REMOVE) $(FRAMEWORK_CACHE_PATH)
	@$(CMD_REMOVE) $(FRAMEWORK_LOCALE_CLASS_PATH)
	@$(CMD_REMOVE) $(FRAMEWORK_TRANSLATION_CLASS_PATH)
	@$(CMD_REMOVE) application/skeleton.tar.gz
	@$(CMD_REMOVE) application/skeleton.zip
	@$(CMD_NICE) find $(FRAMEWORK_PATH) $(TEMP_FILES) -exec rm -rf {} \;


framework-pretty:
	@echo
	@echo "****************************************************************************"
	@echo "  PRETTIFYING FRAMEWORK CLASSES"
	@echo "****************************************************************************"
	@$(CMD_GENERATOR) \
	  --pretty-print \
	  --class-path $(FRAMEWORK_SOURCE_PATH)/$(FRAMEWORK_CLASS_FOLDERNAME)

framework-fix:
	@echo
	@echo "****************************************************************************"
	@echo "  FIXING FRAMEWORK CLASSES"
	@echo "****************************************************************************"
	@$(CMD_GENERATOR) \
	  --fix-source \
	  --class-path $(FRAMEWORK_SOURCE_PATH)/$(FRAMEWORK_CLASS_FOLDERNAME)




###################################################################################
# SKELETON TARGETS
###################################################################################

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
	@echo "  * Collecting skeleton files..."
	@for FILE in $(SKELETON_FILES); do \
    	echo "    - $$FILE"; \
    	mkdir -p `dirname $(SKELETON_TEMP_UNIX)/skeleton/$$FILE`; \
	  	$(CMD_RSYNC) application/skeleton/$$FILE `dirname $(SKELETON_TEMP_UNIX)/skeleton/$$FILE`; \
  	done

exec-skeleton-unix-archive:
	@echo "  * Cleaning up target folders..."
	@$(CMD_NICE) find $(SKELETON_TEMP_UNIX) $(TEMP_FILES) | xargs rm -rf

	@echo "  * Switching to Unix line endings..."
	@$(CMD_NICE) find $(SKELETON_TEMP_UNIX) $(TEXT_FILES) $(ANY2UNIX)

	@echo "  * Fixing executables..."
	@$(CMD_NICE) find $(SKELETON_TEMP_UNIX) $(EXEC_FILES) -exec chmod a+rx {} \;

	@echo "  * Building skeleton archive..."
	@rm -f $(SKELETON_TEMP_UNIX)/skeleton.tar.gz
	@cd $(SKELETON_TEMP_UNIX); $(CMD_NICE) tar cfzp skeleton.tar.gz skeleton
	@rm -rf $(SKELETON_TEMP_UNIX)/skeleton

exec-skeleton-dos-collect:
	@echo "  * Collecting skeleton files..."
	@for FILE in $(SKELETON_FILES); do \
    	echo "    - $$FILE"; \
    	mkdir -p `dirname $(SKELETON_TEMP_DOS)/skeleton/$$FILE`; \
	  	$(CMD_RSYNC) application/skeleton/$$FILE `dirname $(SKELETON_TEMP_DOS)/skeleton/$$FILE`; \
  	done

exec-skeleton-dos-archive:
	@echo "  * Cleaning up target folders..."
	@$(CMD_NICE) find $(SKELETON_TEMP_DOS) $(TEMP_FILES) | xargs rm -rf

	@echo "  * Switching to DOS line endings..."
	@$(CMD_NICE) find $(SKELETON_TEMP_DOS) $(TEXT_FILES) $(ANY2DOS)

	@echo "  * Fixing executables..."
	@$(CMD_NICE) find $(SKELETON_TEMP_DOS) $(EXEC_FILES) -exec chmod a+rx {} \;

	@echo "  * Building skeleton archive..."
	@rm -f $(SKELETON_TEMP_DOS)/skeleton.zip
	@cd $(SKELETON_TEMP_DOS); $(CMD_NICE) zip -rq skeleton.zip skeleton
	@rm -rf $(SKELETON_TEMP_DOS)/skeleton

exec-skeleton-unix-post:
	@$(CMD_RSYNC) $(SKELETON_TEMP_UNIX)/skeleton.tar.gz application/
	@echo
	@echo "  * Created application/skeleton.tar.gz"
	@echo "    Please extract to a location outside this qooxdoo folder."

exec-skeleton-dos-post:
	@$(CMD_RSYNC) $(SKELETON_TEMP_DOS)/skeleton.zip application/
	@echo
	@echo "  * Created application/skeleton.zip"
	@echo "    Please extract to a location outside this qooxdoo folder."

exec-skeleton-unix-clean:
	@$(CMD_REMOVE) $(SKELETON_TEMP_UNIX)

exec-skeleton-dos-clean:
	@$(CMD_REMOVE) $(SKELETON_TEMP_DOS)








###################################################################################
# RELEASE TARGETS
###################################################################################

release-distclean:
	@echo
	@echo "****************************************************************************"
	@echo "  COMPLETELY CLEANING UP RELEASE"
	@echo "****************************************************************************"
	@echo "  * Cleaning up..."
	@$(CMD_REMOVE) release




release: release-sdk release-build
release-fast: release-build-fast release-sdk-fast




release-build: build release-build-fast
release-build-fast: release-build-info release-build-unix release-build-dos

release-build-info:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING BUILD VERSION OF RELEASE $(VERSION)"
	@echo "****************************************************************************"

release-build-unix:
	@echo
	@echo "  SYNCHRONISATION OF BUILD RELEASE (UNIX VERSION)"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_BUILD_UNIX)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_BUILD_UNIX); \
	done

	@echo "  * Synchronizing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
		echo "    - $$APPLICATION"; \
	  mkdir -p $(RELEASE_BUILD_UNIX)/frontend/$$APPLICATION; \
		if [ ! -r application/$$APPLICATION/build ]; then \
		  echo "      - Missing build folder! Run $(MAKE) build first!"; \
		  exit 1; \
		fi; \
	  $(CMD_RSYNC) application/$$APPLICATION/build/* $(RELEASE_BUILD_UNIX)/frontend/$$APPLICATION; \
	done
	@echo "  * Generating index.html..."
	@cat application/index.html | \
		sed 's/class="source"/class="source hide"/g' | \
		sed 's/class="build"//g' > $(RELEASE_BUILD_UNIX)/frontend/index.html

	@echo "  * Switching to Unix line endings..."
	@$(CMD_NICE) find $(RELEASE_BUILD_UNIX) $(TEXT_FILES) $(ANY2UNIX)

	@echo "  * Generating tar archive..."
	@cd release/temp/build/unix; rm -f qooxdoo-$(VERSION)-build.tar.gz; $(CMD_NICE) tar cfzp ../../../qooxdoo-$(VERSION)-build.tar.gz qooxdoo-$(VERSION)-build

release-build-dos:
	@echo
	@echo "  SYNCHRONISATION OF BUILD RELEASE (DOS VERSION)"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_BUILD_DOS)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_BUILD_DOS); \
	done

	@echo "  * Synchronizing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
		echo "    - $$APPLICATION"; \
	  mkdir -p $(RELEASE_BUILD_DOS)/frontend/$$APPLICATION; \
		if [ ! -r application/$$APPLICATION/build ]; then \
		  echo "      - Missing build folder! Run $(MAKE) build first!"; \
		  exit 1; \
		fi; \
	  $(CMD_RSYNC) application/$$APPLICATION/build/* $(RELEASE_BUILD_DOS)/frontend/$$APPLICATION; \
	done

	@echo "  * Generating index.html..."
	@cat application/index.html | \
		sed 's/class="source"/class="source hide"/g' | \
		sed 's/class="build"//g' > $(RELEASE_BUILD_DOS)/frontend/index.html

	@echo "  * Switching to DOS line endings..."
	@$(CMD_NICE) find $(RELEASE_BUILD_DOS) $(TEXT_FILES) $(ANY2DOS)

	@echo "  * Generating zip archive..."
	@cd release/temp/build/dos; rm -f qooxdoo-$(VERSION)-build.zip; $(CMD_NICE) zip -rq ../../../qooxdoo-$(VERSION)-build.zip qooxdoo-$(VERSION)-build









release-sdk: distclean release-sdk-fast
release-sdk-fast: release-sdk-info release-sdk-unix release-sdk-dos

release-sdk-info:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING SDK VERSION OF RELEASE $(VERSION)"
	@echo "****************************************************************************"

release-sdk-unix:
	@echo
	@echo "  SYNCHRONISATION OF SDK RELEASE (UNIX VERSION)"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_SDK_UNIX)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_SDK_UNIX); \
	done

	@echo "  * Synchronizing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
		echo "    - $$APPLICATION"; \
	  mkdir -p $(RELEASE_SDK_UNIX)/frontend/application/$$APPLICATION; \
	  $(CMD_RSYNC) --exclude script --exclude build --exclude publish application/$$APPLICATION/* $(RELEASE_SDK_UNIX)/frontend/application/$$APPLICATION; \
	done

	@echo "  * Synchronizing framework..."
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/framework
	@$(CMD_RSYNC) framework/* --exclude .cache $(RELEASE_SDK_UNIX)/frontend/framework

	@echo "  * Copying remaining SDK files..."
	@for FILE in $(SDK_FILES); do \
	  cp -f $$FILE $(RELEASE_SDK_UNIX)/frontend/$$FILE; \
	done

	@$(MAKE) -s exec-skeleton-unix
	@$(CMD_RSYNC) $(SKELETON_TEMP_UNIX)/skeleton.tar.gz $(RELEASE_SDK_UNIX)/frontend/application/
	@$(MAKE) -s exec-skeleton-unix-clean

	@echo "  * Generating tar archive..."
	@cd release/temp/sdk/unix; rm -f qooxdoo-$(VERSION)-sdk.tar.gz; $(CMD_NICE) tar cfzp ../../../qooxdoo-$(VERSION)-sdk.tar.gz qooxdoo-$(VERSION)-sdk

release-sdk-dos:
	@echo
	@echo "  SYNCHRONISATION OF SDK RELEASE (DOS VERSION)"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_SDK_DOS)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_SDK_DOS); \
	done

	@echo "  * Synchronizing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
		echo "    - $$APPLICATION"; \
	  mkdir -p $(RELEASE_SDK_DOS)/frontend/application/$$APPLICATION; \
	  $(CMD_RSYNC) --exclude script --exclude build --exclude publish application/$$APPLICATION/* $(RELEASE_SDK_DOS)/frontend/application/$$APPLICATION; \
	done

	@echo "  * Synchronizing framework..."
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/framework
	@$(CMD_RSYNC) framework/* --exclude .cache $(RELEASE_SDK_DOS)/frontend/framework

	@echo "  * Copying remaining SDK files..."
	@for FILE in $(SDK_FILES); do \
	  cp -f $$FILE $(RELEASE_SDK_DOS)/frontend/$$FILE; \
	done

	@$(MAKE) -s exec-skeleton-dos
	@$(CMD_RSYNC) $(SKELETON_TEMP_DOS)/skeleton.zip $(RELEASE_SDK_DOS)/frontend/application/
	@$(MAKE) -s exec-skeleton-dos-clean

	@echo "  * Generating zip archive..."
	@cd release/temp/sdk/dos; rm -f qooxdoo-$(VERSION)-sdk.zip; $(CMD_NICE) zip -rq ../../../qooxdoo-$(VERSION)-sdk.zip qooxdoo-$(VERSION)-sdk
