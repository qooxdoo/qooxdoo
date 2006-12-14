###################################################################################
# VARIABLES
###################################################################################

VERSION = 0.7-pre

NICE=10
NICE_CALL = nice -n $(NICE)

RELEASE_BUILD_UNIX = release/temp/build/unix/qooxdoo-$(VERSION)-build
RELEASE_BUILD_DOS = release/temp/build/dos/qooxdoo-$(VERSION)-build

RELEASE_SDK_UNIX = release/temp/sdk/unix/qooxdoo-$(VERSION)-sdk
RELEASE_SDK_DOS = release/temp/sdk/dos/qooxdoo-$(VERSION)-sdk

FIX_FILES = -name "*.py" -o -name "*.sh" -o -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile -o -name AUTHORS -o -name LICENSE -o -name README -o -name RELEASENOTES -o -name TODO

RSYNC_BUILD_OPT = --recursive --archive --delete
RSYNC_SDK_OPT = $(RSYNC_BUILD_OPT) --exclude script --exclude .svn

RSYNC_BUILD_EXEC = @$(NICE_CALL) rsync $(RSYNC_BUILD_OPT)
RSYNC_SDK_EXEC = @$(NICE_CALL) rsync $(RSYNC_SDK_OPT)

ANY2DOS = | xargs framework/tool/modules/textutil.py --command any2Dos
ANY2UNIX = | xargs framework/tool/modules/textutil.py --command any2Unix



###################################################################################
# DEFAULT TARGET
###################################################################################

all: build



###################################################################################
# COMMON TARGETS
###################################################################################

build:
	@$(MAKE) -C framework build
	@$(MAKE) -C apiviewer build
	@$(MAKE) -C demo build

source:
	@$(MAKE) -C framework source
	@$(MAKE) -C apiviewer source
	@$(MAKE) -C demo source

apiviewer-build:
	@$(MAKE) -C apiviewer build

demo-build:
	@$(MAKE) -C demo build

framework-build:
	@$(MAKE) -C framework build

apiviewer-source:
	@$(MAKE) -C apiviewer source

demo-source:
	@$(MAKE) -C demo source

framework-source:
	@$(MAKE) -C framework source

skeleton-archives:
	@$(MAKE) -C skeleton archives

demo-sync:
	@$(MAKE) -C demo sync

apiviewer-sync:
	@$(MAKE) -C apiviewer sync

framework-debug:
	@$(MAKE) -C framework debug



###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES"
	@echo "----------------------------------------------------------------------------"
	@$(MAKE) -C apiviewer clean
	@$(MAKE) -C demo clean
	@$(MAKE) -C framework clean
	@$(MAKE) -C skeleton clean

realclean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES (REAL)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@$(MAKE) -C apiviewer realclean
	@$(MAKE) -C demo realclean
	@$(MAKE) -C framework realclean
	@$(MAKE) -C skeleton realclean

	@echo "  * Deleting release temp data..."
	@$(NICE_CALL) rm -rf release/temp

distclean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES (DIST)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@$(MAKE) -C apiviewer distclean
	@$(MAKE) -C demo distclean
	@$(MAKE) -C framework distclean
	@$(MAKE) -C skeleton distclean

	@echo "  * Deleting cache..."
	@$(NICE_CALL) rm -rf .cache

	@echo "  * Deleting release archives..."
	@$(NICE_CALL) rm -rf release






###################################################################################
# RELEASE TARGETS
###################################################################################

release: release-build release-sdk
release-fast: release-build-fast release-sdk-fast




release-build: build release-build-fast
release-build-fast: release-build-sync release-build-compress

release-build-sync:
	@echo
	@echo "  SYNCHRONISATION OF UNIX BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_BUILD_UNIX)
	@find ../ -maxdepth 1 -type f -name "[A-Z]*" -exec cp -f {} $(RELEASE_BUILD_UNIX) \;

	@echo "  * Synchronizing Unix build folders..."
	@mkdir -p $(RELEASE_BUILD_UNIX)/frontend/apiviewer
	$(RSYNC_BUILD_EXEC) apiviewer/build/* $(RELEASE_BUILD_UNIX)/frontend/apiviewer
	@mkdir -p $(RELEASE_BUILD_UNIX)/frontend/demo
	$(RSYNC_BUILD_EXEC) demo/build/* $(RELEASE_BUILD_UNIX)/frontend/demo
	@mkdir -p $(RELEASE_BUILD_UNIX)/frontend/framework
	$(RSYNC_BUILD_EXEC) framework/build/* $(RELEASE_BUILD_UNIX)/frontend/framework

	@echo "  * Fixing line-breaks..."
	@$(NICE_CALL) find $(RELEASE_BUILD_UNIX) $(FIX_FILES) $(ANY2UNIX)

	@echo
	@echo "  SYNCHRONISATION OF DOS BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_BUILD_DOS)
	@find ../ -maxdepth 1 -type f -name "[A-Z]*" -exec cp -f {} $(RELEASE_BUILD_DOS) \;

	@echo "  * Synchronizing DOS build folders..."
	@mkdir -p $(RELEASE_BUILD_DOS)/frontend/apiviewer
	$(RSYNC_BUILD_EXEC) apiviewer/build/* $(RELEASE_BUILD_DOS)/frontend/apiviewer
	@mkdir -p $(RELEASE_BUILD_DOS)/frontend/demo
	$(RSYNC_BUILD_EXEC) demo/build/* $(RELEASE_BUILD_DOS)/frontend/demo
	@mkdir -p $(RELEASE_BUILD_DOS)/frontend/framework
	$(RSYNC_BUILD_EXEC) framework/build/* $(RELEASE_BUILD_DOS)/frontend/framework

	@echo "  * Fixing line-breaks..."
	@$(NICE_CALL) find $(RELEASE_BUILD_DOS) $(FIX_FILES) $(ANY2DOS)

release-build-compress:
	@echo
	@echo "  COMPRESSION OF BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Generating gzip (Unix) archive..."
	@cd release/temp/build/unix; rm -f qooxdoo-$(VERSION)-build.tar.gz; $(NICE_CALL) tar cfzp ../../../qooxdoo-$(VERSION)-build.tar.gz qooxdoo-$(VERSION)-build

	@echo "  * Generating zip (DOS) archive..."
	@cd release/temp/build/dos; rm -f qooxdoo-$(VERSION)-build.zip; $(NICE_CALL) zip -rq ../../../qooxdoo-$(VERSION)-build.zip qooxdoo-$(VERSION)-build







release-sdk: source skeleton-archives release-sdk-fast
release-sdk-fast: release-sdk-sync release-sdk-compress

release-sdk-sync:
	@echo
	@echo "  SYNCHRONISATION OF UNIX SDK RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_SDK_UNIX)
	@find ../ -maxdepth 1 -type f -name "[A-Z]*" -exec cp -f {} $(RELEASE_SDK_UNIX) \;

	@echo "  * Copying Makefiles..."
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend
	@cp -f Makefile $(RELEASE_SDK_UNIX)/frontend
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/apiviewer
	@cp -f apiviewer/Makefile $(RELEASE_SDK_UNIX)/frontend/apiviewer
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/demo
	@cp -f demo/Makefile $(RELEASE_SDK_UNIX)/frontend/demo
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/framework
	@cp -f framework/Makefile $(RELEASE_SDK_UNIX)/frontend/framework

	@echo "  * Synchronizing source folders..."
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/apiviewer/source
	$(RSYNC_SDK_EXEC) apiviewer/source/* $(RELEASE_SDK_UNIX)/frontend/apiviewer/source
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/demo/source
	$(RSYNC_SDK_EXEC) demo/source/* $(RELEASE_SDK_UNIX)/frontend/demo/source
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/framework/source
	$(RSYNC_SDK_EXEC) framework/source/* $(RELEASE_SDK_UNIX)/frontend/framework/source

	@echo "  * Synchronizing skeleton folder..."
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/skeleton
	$(RSYNC_BUILD_EXEC) skeleton/build/*.tar.gz $(RELEASE_SDK_UNIX)/frontend/skeleton

	@echo "  * Synchronizing tool folders..."
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/demo/tool
	$(RSYNC_SDK_EXEC) demo/tool/* $(RELEASE_SDK_UNIX)/frontend/demo/tool
	@$(NICE_CALL) find $(RELEASE_SDK_UNIX)/frontend/demo/tool -name "*.sh" -o -name "*.py" | xargs chmod a+rx
	@mkdir -p $(RELEASE_SDK_UNIX)/frontend/framework/tool
	$(RSYNC_SDK_EXEC) framework/tool/* $(RELEASE_SDK_UNIX)/frontend/framework/tool
	@$(NICE_CALL) find $(RELEASE_SDK_UNIX)/frontend/framework/tool -name "*.sh" -o -name "*.py" | xargs chmod a+rx

	@echo "  * Fixing line-breaks..."
	@$(NICE_CALL) find $(RELEASE_SDK_UNIX) $(FIX_FILES) $(ANY2UNIX)

	@echo
	@echo "  SYNCHRONISATION OF DOS SDK RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_SDK_DOS)
	@find ../ -maxdepth 1 -type f -name "[A-Z]*" -exec cp -f {} $(RELEASE_SDK_DOS) \;

	@echo "  * Copying Makefiles..."
	@mkdir -p $(RELEASE_SDK_DOS)/frontend
	@cp -f Makefile $(RELEASE_SDK_DOS)/frontend
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/apiviewer
	@cp -f apiviewer/Makefile $(RELEASE_SDK_DOS)/frontend/apiviewer
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/demo
	@cp -f demo/Makefile $(RELEASE_SDK_DOS)/frontend/demo
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/framework
	@cp -f framework/Makefile $(RELEASE_SDK_DOS)/frontend/framework

	@echo "  * Synchronizing source folders..."
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/apiviewer/source
	$(RSYNC_SDK_EXEC) apiviewer/source/* $(RELEASE_SDK_DOS)/frontend/apiviewer/source
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/demo/source
	$(RSYNC_SDK_EXEC) demo/source/* $(RELEASE_SDK_DOS)/frontend/demo/source
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/framework/source
	$(RSYNC_SDK_EXEC) framework/source/* $(RELEASE_SDK_DOS)/frontend/framework/source

	@echo "  * Synchronizing skeleton folder..."
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/skeleton
	$(RSYNC_BUILD_EXEC) skeleton/build/*.zip $(RELEASE_SDK_DOS)/frontend/skeleton

	@echo "  * Synchronizing tool folders..."
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/demo/tool
	$(RSYNC_SDK_EXEC) demo/tool/* $(RELEASE_SDK_DOS)/frontend/demo/tool
	@$(NICE_CALL) find $(RELEASE_SDK_DOS)/frontend/demo/tool -name "*.sh" -o -name "*.py" | xargs chmod a+rx
	@mkdir -p $(RELEASE_SDK_DOS)/frontend/framework/tool
	$(RSYNC_SDK_EXEC) framework/tool/* $(RELEASE_SDK_DOS)/frontend/framework/tool
	@$(NICE_CALL) find $(RELEASE_SDK_DOS)/frontend/framework/tool -name "*.sh" -o -name "*.py" | xargs chmod a+rx

	@echo "  * Fixing line-breaks..."
	@$(NICE_CALL) find $(RELEASE_SDK_DOS) $(FIX_FILES) $(ANY2DOS)

release-sdk-compress:
	@echo
	@echo "  COMPRESSION OF SDK RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Generating gzip (Unix) archive..."
	@cd release/temp/sdk/unix; rm -f qooxdoo-$(VERSION)-sdk.tar.gz; $(NICE_CALL) tar cfzp ../../../qooxdoo-$(VERSION)-sdk.tar.gz qooxdoo-$(VERSION)-sdk

	@echo "  * Generating zip (DOS) archive..."
	@cd release/temp/sdk/dos; rm -f qooxdoo-$(VERSION)-sdk.zip; $(NICE_CALL) zip -rq ../../../qooxdoo-$(VERSION)-sdk.zip qooxdoo-$(VERSION)-sdk
