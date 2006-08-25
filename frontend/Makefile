###################################################################################
# VARIABLES
###################################################################################

VERSION = 0.6-rc2

RELEASE_BUILD_UNIX = release/temp/build/unix/qooxdoo-$(VERSION)-build
RELEASE_BUILD_DOS = release/temp/build/dos/qooxdoo-$(VERSION)-build

RELEASE_SOURCE_UNIX = release/temp/source/unix/qooxdoo-$(VERSION)-source
RELEASE_SOURCE_DOS = release/temp/source/dos/qooxdoo-$(VERSION)-source

FIX_FILES = -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile

RSYNC_BUILD_OPT = --recursive --links --delete
RSYNC_SOURCE_OPT = $(RSYNC_BUILD_OPT) --exclude script --exclude .svn

NICE=10


###################################################################################
# DEFAULT TARGET
###################################################################################

all: build



###################################################################################
# COMMON TARGETS
###################################################################################

build:
	@$(MAKE) -C api build
	@$(MAKE) -C demo build
	@$(MAKE) -C framework build

source:
	@$(MAKE) -C api source
	@$(MAKE) -C demo source
	@$(MAKE) -C framework source

api-build:
	@$(MAKE) -C api build

demo-build:
	@$(MAKE) -C demo build

framework-build:
	@$(MAKE) -C framework build

skeleton-build:
	@$(MAKE) -C skeleton build

api-source:
	@$(MAKE) -C api source

demo-source:
	@$(MAKE) -C demo source

framework-source:
	@$(MAKE) -C framework source

skeleton-source:
	@$(MAKE) -C skeleton source

skeleton-archives:
	@$(MAKE) -C skeleton archives

demo-sync:
	@$(MAKE) -C demo sync

api-sync:
	@$(MAKE) -C api sync



###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES"
	@echo "----------------------------------------------------------------------------"
	@$(MAKE) -C api clean
	@$(MAKE) -C demo clean
	@$(MAKE) -C framework clean
	@$(MAKE) -C skeleton clean

realclean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES (REAL)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@$(MAKE) -C api realclean
	@$(MAKE) -C demo realclean
	@$(MAKE) -C framework realclean
	@$(MAKE) -C skeleton realclean

	@echo "  * Deleting release temp data..."
	@nice -n $(NICE) rm -rf release/temp

distclean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES (DIST)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@$(MAKE) -C api distclean
	@$(MAKE) -C demo distclean
	@$(MAKE) -C framework distclean
	@$(MAKE) -C skeleton distclean

	@echo "  * Deleting cache..."
	@nice -n $(NICE) rm -rf .cache

	@echo "  * Deleting release archives..."
	@nice -n $(NICE) rm -rf release






###################################################################################
# RELEASE TARGETS
###################################################################################

release: release-build release-source
release-fast: release-build-fast release-source-fast




release-build: build release-build-fast
release-build-fast: release-build-sync release-build-compress

release-build-sync:
	@echo
	@echo "  SYNCHRONISATION OF UNIX BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_BUILD_UNIX)
	@cp -f ../[A-Z]* $(RELEASE_BUILD_UNIX)

	@echo "  * Synchronizing Unix build folders..."
	@mkdir -p $(RELEASE_BUILD_UNIX)/frontend/api
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) api/build/* $(RELEASE_BUILD_UNIX)/frontend/api
	@mkdir -p $(RELEASE_BUILD_UNIX)/frontend/demo
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) demo/build/* $(RELEASE_BUILD_UNIX)/frontend/demo
	@mkdir -p $(RELEASE_BUILD_UNIX)/frontend/framework
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) framework/build/* $(RELEASE_BUILD_UNIX)/frontend/framework

	@echo "  * Fixing line-breaks..."
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find $(RELEASE_BUILD_UNIX) $(FIX_FILES) | xargs dos2unix > /dev/null 2>&1

	@echo
	@echo "  SYNCHRONISATION OF DOS BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_BUILD_DOS)
	@cp -f ../[A-Z]* $(RELEASE_BUILD_DOS)

	@echo "  * Synchronizing DOS build folders..."
	@mkdir -p $(RELEASE_BUILD_DOS)/frontend/api
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) api/build/* $(RELEASE_BUILD_DOS)/frontend/api
	@mkdir -p $(RELEASE_BUILD_DOS)/frontend/demo
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) demo/build/* $(RELEASE_BUILD_DOS)/frontend/demo
	@mkdir -p $(RELEASE_BUILD_DOS)/frontend/framework
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) framework/build/* $(RELEASE_BUILD_DOS)/frontend/framework

	@echo "  * Fixing line-breaks..."
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find $(RELEASE_BUILD_DOS) $(FIX_FILES) | xargs unix2dos > /dev/null 2>&1

release-build-compress:
	@echo
	@echo "  COMPRESSION OF BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Generating gzip (Unix) archive..."
	@cd release/temp/build/unix; rm -f qooxdoo-$(VERSION)-build.tar.gz; nice -n $(NICE) tar cfz ../../../qooxdoo-$(VERSION)-build.tar.gz qooxdoo-$(VERSION)-build

	@echo "  * Generating zip (DOS) archive..."
	@cd release/temp/build/dos; rm -f qooxdoo-$(VERSION)-build.zip; nice -n $(NICE) zip -rq ../../../qooxdoo-$(VERSION)-build.zip qooxdoo-$(VERSION)-build







release-source: source skeleton-archives release-source-fast
release-source-fast: release-source-sync release-source-compress

release-source-sync:
	@echo
	@echo "  SYNCHRONISATION OF UNIX SOURCE RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_SOURCE_UNIX)
	@cp -f ../[A-Z]* $(RELEASE_SOURCE_UNIX)

	@echo "  * Copying Makefiles..."
	@mkdir -p $(RELEASE_SOURCE_UNIX)/frontend
	@cp -f Makefile $(RELEASE_SOURCE_UNIX)/frontend
	@mkdir -p $(RELEASE_SOURCE_UNIX)/frontend/api
	@cp -f api/Makefile $(RELEASE_SOURCE_UNIX)/frontend/api
	@mkdir -p $(RELEASE_SOURCE_UNIX)/frontend/demo
	@cp -f demo/Makefile $(RELEASE_SOURCE_UNIX)/frontend/demo
	@mkdir -p $(RELEASE_SOURCE_UNIX)/frontend/framework
	@cp -f framework/Makefile $(RELEASE_SOURCE_UNIX)/frontend/framework

	@echo "  * Synchronizing source folders..."
	@mkdir -p $(RELEASE_SOURCE_UNIX)/frontend/api/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) api/source/* $(RELEASE_SOURCE_UNIX)/frontend/api/source
	@mkdir -p $(RELEASE_SOURCE_UNIX)/frontend/demo/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) demo/source/* $(RELEASE_SOURCE_UNIX)/frontend/demo/source
	@mkdir -p $(RELEASE_SOURCE_UNIX)/frontend/framework/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) framework/source/* $(RELEASE_SOURCE_UNIX)/frontend/framework/source

	@echo "  * Synchronizing skeleton folder..."
	@mkdir -p $(RELEASE_SOURCE_UNIX)/frontend/skeleton
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) skeleton/build/unix/*.tar.gz $(RELEASE_SOURCE_UNIX)/frontend/skeleton

	@echo "  * Synchronizing tool folders..."
	@mkdir -p $(RELEASE_SOURCE_UNIX)/frontend/demo/tool
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) demo/tool/* $(RELEASE_SOURCE_UNIX)/frontend/demo/tool
	@mkdir -p $(RELEASE_SOURCE_UNIX)/frontend/framework/tool
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) framework/tool/* $(RELEASE_SOURCE_UNIX)/frontend/framework/tool

	@echo "  * Fixing line-breaks..."
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find $(RELEASE_SOURCE_UNIX) $(FIX_FILES) | xargs dos2unix > /dev/null 2>&1

	@echo
	@echo "  SYNCHRONISATION OF DOS SOURCE RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying info files..."
	@mkdir -p $(RELEASE_SOURCE_DOS)
	@cp -f ../[A-Z]* $(RELEASE_SOURCE_DOS)

	@echo "  * Copying Makefiles..."
	@mkdir -p $(RELEASE_SOURCE_DOS)/frontend
	@cp -f Makefile $(RELEASE_SOURCE_DOS)/frontend
	@mkdir -p $(RELEASE_SOURCE_DOS)/frontend/api
	@cp -f api/Makefile $(RELEASE_SOURCE_DOS)/frontend/api
	@mkdir -p $(RELEASE_SOURCE_DOS)/frontend/demo
	@cp -f demo/Makefile $(RELEASE_SOURCE_DOS)/frontend/demo
	@mkdir -p $(RELEASE_SOURCE_DOS)/frontend/framework
	@cp -f framework/Makefile $(RELEASE_SOURCE_DOS)/frontend/framework

	@echo "  * Synchronizing source folders..."
	@mkdir -p $(RELEASE_SOURCE_DOS)/frontend/api/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) api/source/* $(RELEASE_SOURCE_DOS)/frontend/api/source
	@mkdir -p $(RELEASE_SOURCE_DOS)/frontend/demo/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) demo/source/* $(RELEASE_SOURCE_DOS)/frontend/demo/source
	@mkdir -p $(RELEASE_SOURCE_DOS)/frontend/framework/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) framework/source/* $(RELEASE_SOURCE_DOS)/frontend/framework/source

	@echo "  * Synchronizing skeleton folder..."
	@mkdir -p $(RELEASE_SOURCE_DOS)/frontend/skeleton
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) skeleton/build/dos/*.zip $(RELEASE_SOURCE_DOS)/frontend/skeleton

	@echo "  * Synchronizing tool folders..."
	@mkdir -p $(RELEASE_SOURCE_DOS)/frontend/demo/tool
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) demo/tool/* $(RELEASE_SOURCE_DOS)/frontend/demo/tool
	@mkdir -p $(RELEASE_SOURCE_DOS)/frontend/framework/tool
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) framework/tool/* $(RELEASE_SOURCE_DOS)/frontend/framework/tool

	@echo "  * Fixing line-breaks..."
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find $(RELEASE_SOURCE_DOS) $(FIX_FILES) | xargs unix2dos > /dev/null 2>&1

release-source-compress:
	@echo
	@echo "  COMPRESSION OF SOURCE RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Generating gzip (Unix) archive..."
	@cd release/temp/source/unix; rm -f qooxdoo-$(VERSION)-source.tar.gz; nice -n $(NICE) tar cfz ../../../qooxdoo-$(VERSION)-source.tar.gz qooxdoo-$(VERSION)-source

	@echo "  * Generating zip (DOS) archive..."
	@cd release/temp/source/dos; rm -f qooxdoo-$(VERSION)-source.zip; nice -n $(NICE) zip -rq ../../../qooxdoo-$(VERSION)-source.zip qooxdoo-$(VERSION)-source
