###################################################################################
# PUBLIC VARIABLES
###################################################################################

VERSION = 0.6.4
NICE = 10





###################################################################################
# PRIVATE VARIABLES
###################################################################################

QOOXDOO_PATH = ..
CMD_REMOVE = rm -rf

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

PROJECTS = apiviewer feedreader framework sample showcase webmail
SKELETON_FILES = Makefile source/class source/resource source/index.html
SDK_MAKEFILES = Makefile project/Makefile





###################################################################################
# INCLUDE CORE
###################################################################################

include $(QOOXDOO_PATH)/frontend/framework/tool/make/framework.mk





###################################################################################
# COMMON TARGETS
###################################################################################

source:
	@$(MAKE) -s -C project source

build:
	@$(MAKE) -s -C project build

api:
	@$(MAKE) -s -C project api

all:
	@$(MAKE) -s -C project all

locales:
	@$(MAKE) -s -C project locales

pretty:
	@$(MAKE) -s -C project pretty

fix:
	@$(MAKE) -s -C project fix

publish:
	@$(MAKE) -s -C project publish

clean:
	@$(MAKE) -s -C project clean

realclean:
	@$(MAKE) -s -C project realclean

distclean: release-distclean framework-distclean
	@$(MAKE) -s -C project distclean

framework-distclean:
	@echo 
	@echo "****************************************************************************"
	@echo "  CLEANING UP FRAMEWORK"
	@echo "****************************************************************************"
	@echo "  * Cleaning up..."
	@$(CMD_REMOVE) $(FRAMEWORK_CACHE_PATH)
	@$(CMD_REMOVE) $(FRAMEWORK_LOCALE_CLASS_PATH)
	@$(CMD_REMOVE) $(FRAMEWORK_TRANSLATION_CLASS_PATH)

release-distclean:
	@echo 
	@echo "****************************************************************************"
	@echo "  CLEANING UP RELEASE"
	@echo "****************************************************************************"
	@echo "  * Cleaning up..."
	@$(CMD_REMOVE) release
	




###################################################################################
# RELEASE TARGETS
###################################################################################

release: release-sdk release-build
release-fast: release-build-fast release-sdk-fast




release-build: build release-build-fast
release-build-fast: release-build-unix release-build-dos

release-build-unix:
	@echo
	@echo "  SYNCHRONISATION OF UNIX BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_BUILD_UNIX)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_BUILD_UNIX); \
	done

	@echo "  * Synchronizing projects..."
	@for PROJECT in $(PROJECTS); do \
		echo "    - $$PROJECT"; \
	  mkdir -p $(RELEASE_BUILD_UNIX)/frontend/$$PROJECT; \
		if [ ! -r project/$$PROJECT/build ]; then \
		  echo "      - Missing build folder! Run $(MAKE) build first!"; \
		  exit 1; \
		fi; \
	  $(CMD_RSYNC) project/$$PROJECT/build/* $(RELEASE_BUILD_UNIX)/frontend/$$PROJECT; \
	done
	
	@echo "  * Switching to Unix line endings..."
	@$(CMD_NICE) find $(RELEASE_BUILD_UNIX) $(TEXT_FILES) $(ANY2UNIX)

	@echo "  * Generating tar archive..."
	@cd release/temp/build/unix; rm -f qooxdoo-$(VERSION)-build.tar.gz; $(CMD_NICE) tar cfzp ../../../qooxdoo-$(VERSION)-build.tar.gz qooxdoo-$(VERSION)-build

release-build-dos:
	@echo
	@echo "  SYNCHRONISATION OF DOS BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_BUILD_DOS)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_BUILD_DOS); \
	done

	@echo "  * Synchronizing projects..."
	@for PROJECT in $(PROJECTS); do \
		echo "    - $$PROJECT"; \
	  mkdir -p $(RELEASE_BUILD_DOS)/frontend/$$PROJECT; \
		if [ ! -r project/$$PROJECT/build ]; then \
		  echo "      - Missing build folder! Run $(MAKE) build first!"; \
		  exit 1; \
		fi; \
	  $(CMD_RSYNC) project/$$PROJECT/build/* $(RELEASE_BUILD_DOS)/frontend/$$PROJECT; \
	done
	
	@echo "  * Switching to DOS line endings..."
	@$(CMD_NICE) find $(RELEASE_BUILD_DOS) $(TEXT_FILES) $(ANY2DOS)

	@echo "  * Generating zip archive..."
	@cd release/temp/build/dos; rm -f qooxdoo-$(VERSION)-build.zip; $(CMD_NICE) zip -rq ../../../qooxdoo-$(VERSION)-build.zip qooxdoo-$(VERSION)-build









release-sdk: distclean release-sdk-fast
release-sdk-fast: release-sdk-unix release-sdk-dos

release-sdk-unix:
	@echo
	@echo "  SYNCHRONISATION OF UNIX SDK RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_SDK_UNIX)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_SDK_UNIX); \
	done
	
	@echo "  * Synchronizing projects..."
	@for PROJECT in $(PROJECTS); do \
		echo "    - $$PROJECT"; \
	  mkdir -p $(RELEASE_SDK_UNIX)/frontend/project/$$PROJECT; \
	  cp -f project/$$PROJECT/Makefile $(RELEASE_SDK_UNIX)/frontend/project/$$PROJECT; \
	  $(CMD_RSYNC) --exclude script project/$$PROJECT/source/* $(RELEASE_SDK_UNIX)/frontend/project/$$PROJECT/source; \
	done
	
	@echo "  * Synchronizing framework..."
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/framework
	@$(CMD_RSYNC) framework/* --exclude .cache $(RELEASE_SDK_UNIX)/frontend/framework

	@echo "  * Copying top level Makefiles..."
	@for MAKEFILE in $(SDK_MAKEFILES); do \
	  cp -f $$MAKEFILE $(RELEASE_SDK_UNIX)/frontend/$$MAKEFILE; \
	done

	@echo "  * Collecting skeleton files..."
	@for FILE in $(SKELETON_FILES); do \
    echo "    - $$FILE"; \
    mkdir -p `dirname $(RELEASE_SDK_UNIX)/frontend/project/skeleton/$$FILE`; \
	  $(CMD_RSYNC) project/skeleton/$$FILE `dirname $(RELEASE_SDK_UNIX)/frontend/project/skeleton/$$FILE`; \
  done    
  
	@echo "  * Cleaning up target folders..."
	@$(CMD_NICE) find $(RELEASE_SDK_UNIX) $(TEMP_FILES) | xargs rm -rf

	@echo "  * Switching to Unix line endings..."
	@$(CMD_NICE) find $(RELEASE_SDK_UNIX) $(TEXT_FILES) $(ANY2UNIX)

	@echo "  * Fixing executables..."
	@$(CMD_NICE) find $(RELEASE_SDK_UNIX) $(EXEC_FILES) | xargs chmod a+rx

	@echo "  * Building skeleton archive..."
	@rm -f $(RELEASE_SDK_UNIX)/frontend/project/skeleton.tar.gz
	@cd $(RELEASE_SDK_UNIX)/frontend/project; $(CMD_NICE) tar cfzp skeleton.tar.gz skeleton 
	@rm -rf $(RELEASE_SDK_UNIX)/frontend/project/skeleton
	
	@echo "  * Generating tar archive..."
	@cd release/temp/sdk/unix; rm -f qooxdoo-$(VERSION)-sdk.tar.gz; $(CMD_NICE) tar cfzp ../../../qooxdoo-$(VERSION)-sdk.tar.gz qooxdoo-$(VERSION)-sdk

release-sdk-dos:
	@echo
	@echo "  SYNCHRONISATION OF DOS SDK RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_SDK_DOS)
	@for FILE in `find ../ -maxdepth 1 -type f -name "[A-Z]*"`; do \
	  echo "    - `basename $$FILE`"; \
	  cp -f $$FILE $(RELEASE_SDK_DOS); \
	done
	
	@echo "  * Synchronizing projects..."
	@for PROJECT in $(PROJECTS); do \
		echo "    - $$PROJECT"; \
	  mkdir -p $(RELEASE_SDK_DOS)/frontend/project/$$PROJECT; \
	  cp -f project/$$PROJECT/Makefile $(RELEASE_SDK_DOS)/frontend/project/$$PROJECT; \
	  $(CMD_RSYNC) --exclude script project/$$PROJECT/source/* $(RELEASE_SDK_DOS)/frontend/project/$$PROJECT/source; \
	done

	@echo "  * Synchronizing framework..."
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/framework
	@$(CMD_RSYNC) framework/* --exclude .cache $(RELEASE_SDK_DOS)/frontend/framework

	@echo "  * Copying top level Makefiles..."
	@for MAKEFILE in $(SDK_MAKEFILES); do \
	  cp -f $$MAKEFILE $(RELEASE_SDK_DOS)/frontend/$$MAKEFILE; \
	done

	@echo "  * Collecting skeleton files..."
	@for FILE in $(SKELETON_FILES); do \
    echo "    - $$FILE"; \
    mkdir -p `dirname $(RELEASE_SDK_DOS)/frontend/project/skeleton/$$FILE`; \
	  $(CMD_RSYNC) project/skeleton/$$FILE `dirname $(RELEASE_SDK_DOS)/frontend/project/skeleton/$$FILE`; \
  done    
  
	@echo "  * Cleaning up target folders..."
	@$(CMD_NICE) find $(RELEASE_SDK_DOS) $(TEMP_FILES) | xargs rm -rf

	@echo "  * Switching to DOS line endings..."
	@$(CMD_NICE) find $(RELEASE_SDK_DOS) $(TEXT_FILES) $(ANY2DOS)

	@echo "  * Fixing executables..."
	@$(CMD_NICE) find $(RELEASE_SDK_DOS) $(EXEC_FILES) | xargs chmod a+rx

	@echo "  * Building skeleton archive..."
	@rm -f $(RELEASE_SDK_DOS)/frontend/project/skeleton.zip
	@cd $(RELEASE_SDK_DOS)/frontend/project; $(CMD_NICE) zip -rq skeleton.zip skeleton 
	@rm -rf $(RELEASE_SDK_DOS)/frontend/project/skeleton

	@echo "  * Generating zip archive..."
	@cd release/temp/sdk/dos; rm -f qooxdoo-$(VERSION)-sdk.zip; $(CMD_NICE) zip -rq ../../../qooxdoo-$(VERSION)-sdk.zip qooxdoo-$(VERSION)-sdk
