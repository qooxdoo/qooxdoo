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

APPLICATIONS = apiviewer feedreader sample showcase webmail
SKELETON_FILES = Makefile source/class source/resource source/index.html
SDK_MAKEFILES = Makefile application/Makefile





###################################################################################
# INCLUDE CORE
###################################################################################

include $(QOOXDOO_PATH)/frontend/framework/tool/make/framework.mk





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

pretty:
	@$(MAKE) -s -C application pretty

fix:
	@$(MAKE) -s -C application fix

publish:
	@$(MAKE) -s -C application publish

clean:
	@$(MAKE) -s -C application clean

realclean:
	@$(MAKE) -s -C application realclean

distclean: release-distclean framework-distclean
	@$(MAKE) -s -C application distclean

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
release-build-fast: release-build-info release-build-unix release-build-dos

release-build-info:
	@echo 
	@echo "****************************************************************************"
	@echo "  GENERATING BUILD RELEASE"
	@echo "****************************************************************************"
	
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
	
	@echo "  * Switching to DOS line endings..."
	@$(CMD_NICE) find $(RELEASE_BUILD_DOS) $(TEXT_FILES) $(ANY2DOS)

	@echo "  * Generating zip archive..."
	@cd release/temp/build/dos; rm -f qooxdoo-$(VERSION)-build.zip; $(CMD_NICE) zip -rq ../../../qooxdoo-$(VERSION)-build.zip qooxdoo-$(VERSION)-build









release-sdk: distclean release-sdk-fast
release-sdk-fast: release-sdk-info release-sdk-unix release-sdk-dos

release-sdk-info:
	@echo 
	@echo "****************************************************************************"
	@echo "  GENERATING SDK RELEASE"
	@echo "****************************************************************************"

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
	
	@echo "  * Synchronizing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
		echo "    - $$APPLICATION"; \
	  mkdir -p $(RELEASE_SDK_UNIX)/frontend/application/$$APPLICATION; \
	  cp -f application/$$APPLICATION/Makefile $(RELEASE_SDK_UNIX)/frontend/application/$$APPLICATION; \
	  $(CMD_RSYNC) --exclude script application/$$APPLICATION/source/* $(RELEASE_SDK_UNIX)/frontend/application/$$APPLICATION/source; \
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
    mkdir -p `dirname $(RELEASE_SDK_UNIX)/frontend/application/skeleton/$$FILE`; \
	  $(CMD_RSYNC) application/skeleton/$$FILE `dirname $(RELEASE_SDK_UNIX)/frontend/application/skeleton/$$FILE`; \
  done    
  
	@echo "  * Cleaning up target folders..."
	@$(CMD_NICE) find $(RELEASE_SDK_UNIX) $(TEMP_FILES) | xargs rm -rf

	@echo "  * Switching to Unix line endings..."
	@$(CMD_NICE) find $(RELEASE_SDK_UNIX) $(TEXT_FILES) $(ANY2UNIX)

	@echo "  * Fixing executables..."
	@$(CMD_NICE) find $(RELEASE_SDK_UNIX) $(EXEC_FILES) | xargs chmod a+rx

	@echo "  * Building skeleton archive..."
	@rm -f $(RELEASE_SDK_UNIX)/frontend/application/skeleton.tar.gz
	@cd $(RELEASE_SDK_UNIX)/frontend/application; $(CMD_NICE) tar cfzp skeleton.tar.gz skeleton 
	@rm -rf $(RELEASE_SDK_UNIX)/frontend/application/skeleton
	
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
	
	@echo "  * Synchronizing applications..."
	@for APPLICATION in $(APPLICATIONS); do \
		echo "    - $$APPLICATION"; \
	  mkdir -p $(RELEASE_SDK_DOS)/frontend/application/$$APPLICATION; \
	  cp -f application/$$APPLICATION/Makefile $(RELEASE_SDK_DOS)/frontend/application/$$APPLICATION; \
	  $(CMD_RSYNC) --exclude script application/$$APPLICATION/source/* $(RELEASE_SDK_DOS)/frontend/application/$$APPLICATION/source; \
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
    mkdir -p `dirname $(RELEASE_SDK_DOS)/frontend/application/skeleton/$$FILE`; \
	  $(CMD_RSYNC) application/skeleton/$$FILE `dirname $(RELEASE_SDK_DOS)/frontend/application/skeleton/$$FILE`; \
  done    
  
	@echo "  * Cleaning up target folders..."
	@$(CMD_NICE) find $(RELEASE_SDK_DOS) $(TEMP_FILES) | xargs rm -rf

	@echo "  * Switching to DOS line endings..."
	@$(CMD_NICE) find $(RELEASE_SDK_DOS) $(TEXT_FILES) $(ANY2DOS)

	@echo "  * Fixing executables..."
	@$(CMD_NICE) find $(RELEASE_SDK_DOS) $(EXEC_FILES) | xargs chmod a+rx

	@echo "  * Building skeleton archive..."
	@rm -f $(RELEASE_SDK_DOS)/frontend/application/skeleton.zip
	@cd $(RELEASE_SDK_DOS)/frontend/application; $(CMD_NICE) zip -rq skeleton.zip skeleton 
	@rm -rf $(RELEASE_SDK_DOS)/frontend/application/skeleton

	@echo "  * Generating zip archive..."
	@cd release/temp/sdk/dos; rm -f qooxdoo-$(VERSION)-sdk.zip; $(CMD_NICE) zip -rq ../../../qooxdoo-$(VERSION)-sdk.zip qooxdoo-$(VERSION)-sdk
