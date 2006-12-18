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

CMD_NICE = nice -n $(NICE)
CMD_RSYNC = $(CMD_NICE) rsync --recursive --delete --exclude .svn

CMD_PYTHON=/usr/bin/env python

ANY2DOS = | xargs $(CMD_PYTHON) framework/tool/modules/textutil.py --command any2Dos
ANY2UNIX = | xargs $(CMD_PYTHON) framework/tool/modules/textutil.py --command any2Unix

TARGETS = framework application/apiviewer application/feedreader application/sample application/showcase application/webmail
SKELETON_FILES = Makefile source/class source/resource source/index.html
SDK_MAKEFILES = Makefile framework/Makefile application/Makefile

DIRECTORIES = framework application






###################################################################################
# COMMON TARGETS
###################################################################################

source:
	@for DIR in $(DIRECTORIES); do make -C $$DIR source || exit 1; done

build:
	@for DIR in $(DIRECTORIES); do make -C $$DIR build || exit 1; done

api:
	@for DIR in $(DIRECTORIES); do make -C $$DIR api || exit 1; done

all:
	@for DIR in $(DIRECTORIES); do make -C $$DIR all || exit 1; done

locales:
	@for DIR in $(DIRECTORIES); do make -C $$DIR locales || exit 1; done

pretty:
	@for DIR in $(DIRECTORIES); do make -C $$DIR pretty || exit 1; done

fix:
	@for DIR in $(DIRECTORIES); do make -C $$DIR fix || exit 1; done

publish:
	@for DIR in $(DIRECTORIES); do make -C $$DIR publish || exit 1; done

clean:
	@for DIR in $(DIRECTORIES); do make -C $$DIR clean || exit 1; done

realclean:
	@for DIR in $(DIRECTORIES); do make -C $$DIR realclean || exit 1; done
	@$(CMD_NICE) rm -rf release/temp

distclean:
	@for DIR in $(DIRECTORIES); do make -C $$DIR distclean || exit 1; done
	@$(CMD_NICE) rm -rf release






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
	  $(CMD_RSYNC) $$TARGET/build/* $(RELEASE_BUILD_UNIX)/frontend/$$TARGET; \
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

	@echo "  * Synchronizing builds..."
	@for TARGET in $(TARGETS); do \
		echo "    - $$TARGET"; \
	  mkdir -p $(RELEASE_BUILD_DOS)/frontend/$$TARGET; \
		if [ ! -r $$TARGET/build ]; then \
		  echo "      - Missing build folder! Run make build first!"; \
		  exit 1; \
		fi; \
	  $(CMD_RSYNC) $$TARGET/build/* $(RELEASE_BUILD_DOS)/frontend/$$TARGET; \
	done
	
	@echo "  * Switching to DOS line endings..."
	@$(CMD_NICE) find $(RELEASE_BUILD_DOS) $(TEXT_FILES) $(ANY2DOS)

	@echo "  * Generating zip archive..."
	@cd release/temp/build/dos; rm -f qooxdoo-$(VERSION)-build.zip; $(CMD_NICE) zip -rq ../../../qooxdoo-$(VERSION)-build.zip qooxdoo-$(VERSION)-build









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
	  $(CMD_RSYNC) --exclude script $$TARGET/source/* $(RELEASE_SDK_UNIX)/frontend/$$TARGET/source; \
	done

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
  
	@echo "  * Synchronizing tool folders..."
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/framework/tool
	@$(CMD_RSYNC) framework/tool/* $(RELEASE_SDK_UNIX)/frontend/framework/tool
  
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
	
	@echo "  * Synchronizing sources..."
	@for TARGET in $(TARGETS); do \
		echo "    - $$TARGET"; \
	  mkdir -p $(RELEASE_SDK_DOS)/frontend/$$TARGET; \
	  cp -f $$TARGET/Makefile $(RELEASE_SDK_DOS)/frontend/$$TARGET; \
	  $(CMD_RSYNC) --exclude script $$TARGET/source/* $(RELEASE_SDK_DOS)/frontend/$$TARGET/source; \
	done

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
  
	@echo "  * Synchronizing tool folders..."
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/framework/tool
	@$(CMD_RSYNC) framework/tool/* $(RELEASE_SDK_DOS)/frontend/framework/tool
  
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
