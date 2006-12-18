###################################################################################
# PUBLIC VARIABLES
###################################################################################

VERSION = 0.6.4
NICE=10





###################################################################################
# PRIVATE VARIABLES
###################################################################################

RELEASE_BUILD_UNIX = release/temp/build/unix/qooxdoo-$(VERSION)-build
RELEASE_BUILD_DOS = release/temp/build/dos/qooxdoo-$(VERSION)-build

RELEASE_SDK_UNIX = release/temp/sdk/unix/qooxdoo-$(VERSION)-sdk
RELEASE_SDK_DOS = release/temp/sdk/dos/qooxdoo-$(VERSION)-sdk

TEXT_FILES = -name "*.py" -o -name "*.sh" -o -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile -o -name AUTHORS -o -name LICENSE -o -name README -o -name RELEASENOTES -o -name TODO
TEMP_FILES = -name "*.pyc" -o -name "*.bak" -o -name "*.old"
EXEC_FILES = -name "*.py" -o -name "*.sh"

NICE_CMD = nice -n $(NICE)
RSYNC_CMD = $(NICE_CMD) rsync --recursive --delete --exclude .svn

ANY2DOS = | xargs framework/tool/modules/textutil.py --command any2Dos
ANY2UNIX = | xargs framework/tool/modules/textutil.py --command any2Unix

TARGETS = framework application/apiviewer application/feedreader application/sample application/showcase application/webmail
SKELETON_FILES = Makefile source/class source/resource source/index.html
SDK_MAKEFILES = Makefile framework/Makefile application/Makefile







###################################################################################
# COMMON TARGETS
###################################################################################

source:
	@$(MAKE) -C framework source
	@$(MAKE) -C application source

build:
	@$(MAKE) -C framework build
	@$(MAKE) -C application build

api:
	@$(MAKE) -C framework api
	@$(MAKE) -C application api

all: source build api

locales:
	@$(MAKE) -C framework locales
	@$(MAKE) -C application locales

pretty:
	@$(MAKE) -C framework pretty
	@$(MAKE) -C application pretty

fix:
	@$(MAKE) -C framework fix
	@$(MAKE) -C application fix

publish:
	@$(MAKE) -C framework publish
	@$(MAKE) -C application publish

clean:
	@$(MAKE) -C application clean
	@$(MAKE) -C framework clean

realclean:
	@$(MAKE) -C application realclean
	@$(MAKE) -C framework realclean

	@echo "  * Deleting release temp data..."
	@$(NICE_CMD) rm -rf release/temp

distclean:
	@$(MAKE) -C application distclean
	@$(MAKE) -C framework distclean

	@echo "  * Deleting release archives..."
	@$(NICE_CMD) rm -rf release






###################################################################################
# RELEASE TARGETS
###################################################################################

release: release-build release-sdk
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

	@echo "  * Synchronizing builds..."
	@for TARGET in $(TARGETS); do \
		echo "    - $$TARGET"; \
	  mkdir -p $(RELEASE_BUILD_UNIX)/frontend/$$TARGET; \
		if [ ! -r $$TARGET/build ]; then \
		  echo "      - Missing build folder! Run make build first!"; \
		  exit 1; \
		fi; \
	  $(RSYNC_CMD) $$TARGET/build/* $(RELEASE_BUILD_UNIX)/frontend/$$TARGET; \
	done
	
	@echo "  * Switching to Unix line endings..."
	@$(NICE_CMD) find $(RELEASE_BUILD_UNIX) $(TEXT_FILES) $(ANY2UNIX)

	@echo "  * Generating tar archive..."
	@cd release/temp/build/unix; rm -f qooxdoo-$(VERSION)-build.tar.gz; $(NICE_CMD) tar cfzp ../../../qooxdoo-$(VERSION)-build.tar.gz qooxdoo-$(VERSION)-build

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

	@echo "  * Synchronizing builds..."
	@for TARGET in $(TARGETS); do \
		echo "    - $$TARGET"; \
	  mkdir -p $(RELEASE_BUILD_DOS)/frontend/$$TARGET; \
		if [ ! -r $$TARGET/build ]; then \
		  echo "      - Missing build folder! Run make build first!"; \
		  exit 1; \
		fi; \
	  $(RSYNC_CMD) $$TARGET/build/* $(RELEASE_BUILD_DOS)/frontend/$$TARGET; \
	done
	
	@echo "  * Switching to DOS line endings..."
	@$(NICE_CMD) find $(RELEASE_BUILD_DOS) $(TEXT_FILES) $(ANY2DOS)

	@echo "  * Generating zip archive..."
	@cd release/temp/build/dos; rm -f qooxdoo-$(VERSION)-build.zip; $(NICE_CMD) zip -rq ../../../qooxdoo-$(VERSION)-build.zip qooxdoo-$(VERSION)-build









release-sdk: release-sdk-fast
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
	
	@echo "  * Synchronizing sources..."
	@for TARGET in $(TARGETS); do \
		echo "    - $$TARGET"; \
	  mkdir -p $(RELEASE_SDK_UNIX)/frontend/$$TARGET; \
	  cp -f $$TARGET/Makefile $(RELEASE_SDK_UNIX)/frontend/$$TARGET; \
	  $(RSYNC_CMD) --exclude script $$TARGET/source/* $(RELEASE_SDK_UNIX)/frontend/$$TARGET/source; \
	done

	@echo "  * Copying top level Makefiles..."
	@for MAKEFILE in $(SDK_MAKEFILES); do \
	  cp -f $$MAKEFILE $(RELEASE_SDK_UNIX)/frontend/$$MAKEFILE; \
	done

	@echo "  * Collecting skeleton files..."
	@for FILE in $(SKELETON_FILES); do \
    echo "    - $$FILE"; \
    mkdir -p `dirname $(RELEASE_SDK_UNIX)/frontend/application/skeleton/$$FILE`; \
	  $(RSYNC_CMD) application/skeleton/$$FILE `dirname $(RELEASE_SDK_UNIX)/frontend/application/skeleton/$$FILE`; \
  done    
  
	@echo "  * Synchronizing tool folders..."
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/framework/tool
	@$(RSYNC_CMD) framework/tool/* $(RELEASE_SDK_UNIX)/frontend/framework/tool
  
	@echo "  * Cleaning up target folders..."
	@$(NICE_CMD) find $(RELEASE_SDK_UNIX) $(TEMP_FILES) | xargs rm -rf

	@echo "  * Switching to Unix line endings..."
	@$(NICE_CMD) find $(RELEASE_SDK_UNIX) $(TEXT_FILES) $(ANY2UNIX)

	@echo "  * Fixing executables..."
	@$(NICE_CMD) find $(RELEASE_SDK_UNIX) $(EXEC_FILES) | xargs chmod a+rx

	@echo "  * Building skeleton archive..."
	@rm -f $(RELEASE_SDK_UNIX)/frontend/application/skeleton.tar.gz
	@cd $(RELEASE_SDK_UNIX)/frontend/application; $(NICE_CMD) tar cfzp skeleton.tar.gz skeleton 
	@rm -rf $(RELEASE_SDK_UNIX)/frontend/application/skeleton
	
	@echo "  * Generating tar archive..."
	@cd release/temp/sdk/unix; rm -f qooxdoo-$(VERSION)-sdk.tar.gz; $(NICE_CMD) tar cfzp ../../../qooxdoo-$(VERSION)-sdk.tar.gz qooxdoo-$(VERSION)-sdk

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
	
	@echo "  * Synchronizing sources..."
	@for TARGET in $(TARGETS); do \
		echo "    - $$TARGET"; \
	  mkdir -p $(RELEASE_SDK_DOS)/frontend/$$TARGET; \
	  cp -f $$TARGET/Makefile $(RELEASE_SDK_DOS)/frontend/$$TARGET; \
	  $(RSYNC_CMD) --exclude script $$TARGET/source/* $(RELEASE_SDK_DOS)/frontend/$$TARGET/source; \
	done

	@echo "  * Copying top level Makefiles..."
	@for MAKEFILE in $(SDK_MAKEFILES); do \
	  cp -f $$MAKEFILE $(RELEASE_SDK_DOS)/frontend/$$MAKEFILE; \
	done

	@echo "  * Collecting skeleton files..."
	@for FILE in $(SKELETON_FILES); do \
    echo "    - $$FILE"; \
    mkdir -p `dirname $(RELEASE_SDK_DOS)/frontend/application/skeleton/$$FILE`; \
	  $(RSYNC_CMD) application/skeleton/$$FILE `dirname $(RELEASE_SDK_DOS)/frontend/application/skeleton/$$FILE`; \
  done    
  
	@echo "  * Synchronizing tool folders..."
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/framework/tool
	@$(RSYNC_CMD) framework/tool/* $(RELEASE_SDK_DOS)/frontend/framework/tool
  
	@echo "  * Cleaning up target folders..."
	@$(NICE_CMD) find $(RELEASE_SDK_DOS) $(TEMP_FILES) | xargs rm -rf

	@echo "  * Switching to DOS line endings..."
	@$(NICE_CMD) find $(RELEASE_SDK_DOS) $(TEXT_FILES) $(ANY2DOS)

	@echo "  * Fixing executables..."
	@$(NICE_CMD) find $(RELEASE_SDK_DOS) $(EXEC_FILES) | xargs chmod a+rx

	@echo "  * Building skeleton archive..."
	@rm -f $(RELEASE_SDK_DOS)/frontend/application/skeleton.zip
	@cd $(RELEASE_SDK_DOS)/frontend/application; $(NICE_CMD) zip -rq skeleton.zip skeleton 
	@rm -rf $(RELEASE_SDK_DOS)/frontend/application/skeleton

	@echo "  * Generating zip archive..."
	@cd release/temp/sdk/dos; rm -f qooxdoo-$(VERSION)-sdk.zip; $(NICE_CMD) zip -rq ../../../qooxdoo-$(VERSION)-sdk.zip qooxdoo-$(VERSION)-sdk
