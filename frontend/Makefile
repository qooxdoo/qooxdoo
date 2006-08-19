###################################################################################
# VARIABLES
###################################################################################

VERSION = 0.6-rc1

BUILD_RELEASE_UNIX = release/build/unix/qooxdoo-$(VERSION)-build
BUILD_RELEASE_DOS = release/build/dos/qooxdoo-$(VERSION)-build

SOURCE_RELEASE_UNIX = release/source/unix/qooxdoo-$(VERSION)-source
SOURCE_RELEASE_DOS = release/source/dos/qooxdoo-$(VERSION)-source

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

	@echo "  * Deleting release..."
	@nice -n $(NICE) rm -rf release






###################################################################################
# RELEASE TARGETS
###################################################################################

release: build-release source-release

build-release: build skeleton-archives build-release-sync build-release-compress

build-release-sync:
	@echo
	@echo "  SYNCHRONISATION OF UNIX BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Synchronizing Unix build folders..."
	@mkdir -p $(BUILD_RELEASE_UNIX)/api
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) api/build/* $(BUILD_RELEASE_UNIX)/api
	@mkdir -p $(BUILD_RELEASE_UNIX)/demo
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) demo/build/* $(BUILD_RELEASE_UNIX)/demo
	@mkdir -p $(BUILD_RELEASE_UNIX)/framework
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) framework/build/* $(BUILD_RELEASE_UNIX)/framework
	@mkdir -p $(BUILD_RELEASE_UNIX)/skeleton
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) skeleton/build/unix/*.tar.gz $(BUILD_RELEASE_UNIX)/skeleton

	@echo "  * Fixing line-breaks..."
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find $(BUILD_RELEASE_UNIX) $(FIX_FILES) | xargs dos2unix > /dev/null 2>&1


	@echo
	@echo "  SYNCHRONISATION OF DOS BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Synchronizing DOS build folders..."
	@mkdir -p $(BUILD_RELEASE_DOS)/api
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) api/build/* $(BUILD_RELEASE_DOS)/api
	@mkdir -p $(BUILD_RELEASE_DOS)/demo
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) demo/build/* $(BUILD_RELEASE_DOS)/demo
	@mkdir -p $(BUILD_RELEASE_DOS)/framework
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) framework/build/* $(BUILD_RELEASE_DOS)/framework
	@mkdir -p $(BUILD_RELEASE_UNIX)/skeleton
	@nice -n $(NICE) rsync $(RSYNC_BUILD_OPT) skeleton/build/dos/*.zip $(BUILD_RELEASE_DOS)/skeleton

	@echo "  * Fixing line-breaks..."
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find $(BUILD_RELEASE_DOS) $(FIX_FILES) | xargs unix2dos > /dev/null 2>&1


build-release-compress:
	@echo
	@echo "  COMPRESSION OF BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Generating gzip (Unix) archive..."
	@cd release/build/unix; rm -f qooxdoo-$(VERSION)-build.tar.gz; nice -n $(NICE) tar cfz qooxdoo-$(VERSION)-build.tar.gz qooxdoo-$(VERSION)-build

	@echo "  * Generating bzip2 (Unix) archive..."
	@cd release/build/unix; rm -f qooxdoo-$(VERSION)-build.tar.bz2; nice -n $(NICE) tar cfj qooxdoo-$(VERSION)-build.tar.bz2 qooxdoo-$(VERSION)-build

	@echo "  * Generating zip (DOS) archive..."
	@cd release/build/dos; rm -f qooxdoo-$(VERSION)-build.zip; nice -n $(NICE) zip -rq qooxdoo-$(VERSION)-build.zip qooxdoo-$(VERSION)-build


source-release: source source-release-sync source-release-compress

source-release-sync:
	@echo
	@echo "  SYNCHRONISATION OF UNIX SOURCE RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying Makefiles..."
	@mkdir -p $(SOURCE_RELEASE_UNIX)
	@cp -f Makefile $(SOURCE_RELEASE_UNIX)
	@mkdir -p $(SOURCE_RELEASE_UNIX)/api
	@cp -f api/Makefile $(SOURCE_RELEASE_UNIX)/api
	@mkdir -p $(SOURCE_RELEASE_UNIX)/demo
	@cp -f demo/Makefile $(SOURCE_RELEASE_UNIX)/demo
	@mkdir -p $(SOURCE_RELEASE_UNIX)/framework
	@cp -f framework/Makefile $(SOURCE_RELEASE_UNIX)/framework
	@mkdir -p $(SOURCE_RELEASE_UNIX)/skeleton
	@cp -f skeleton/Makefile $(SOURCE_RELEASE_UNIX)/skeleton

	@echo "  * Synchronizing source folders..."
	@mkdir -p $(SOURCE_RELEASE_UNIX)/api/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) api/source/* $(SOURCE_RELEASE_UNIX)/api/source
	@mkdir -p $(SOURCE_RELEASE_UNIX)/demo/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) demo/source/* $(SOURCE_RELEASE_UNIX)/demo/source
	@mkdir -p $(SOURCE_RELEASE_UNIX)/framework/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) framework/source/* $(SOURCE_RELEASE_UNIX)/framework/source
	@mkdir -p $(SOURCE_RELEASE_UNIX)/skeleton/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) skeleton/source/* $(SOURCE_RELEASE_UNIX)/skeleton/source

	@echo "  * Synchronizing tool folders..."
	@mkdir -p $(SOURCE_RELEASE_UNIX)/demo/tool
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) demo/tool/* $(SOURCE_RELEASE_UNIX)/demo/tool
	@mkdir -p $(SOURCE_RELEASE_UNIX)/framework/tool
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) framework/tool/* $(SOURCE_RELEASE_UNIX)/framework/tool

	@echo "  * Fixing line-breaks..."
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find $(SOURCE_RELEASE_UNIX) $(FIX_FILES) | xargs dos2unix > /dev/null 2>&1


	@echo
	@echo "  SYNCHRONISATION OF DOS SOURCE RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying Makefiles..."
	@mkdir -p $(SOURCE_RELEASE_DOS)
	@cp -f Makefile $(SOURCE_RELEASE_DOS)
	@mkdir -p $(SOURCE_RELEASE_DOS)/api
	@cp -f api/Makefile $(SOURCE_RELEASE_DOS)/api
	@mkdir -p $(SOURCE_RELEASE_DOS)/demo
	@cp -f demo/Makefile $(SOURCE_RELEASE_DOS)/demo
	@mkdir -p $(SOURCE_RELEASE_DOS)/framework
	@cp -f framework/Makefile $(SOURCE_RELEASE_DOS)/framework
	@mkdir -p $(SOURCE_RELEASE_DOS)/skeleton
	@cp -f skeleton/Makefile $(SOURCE_RELEASE_DOS)/skeleton

	@echo "  * Synchronizing source folders..."
	@mkdir -p $(SOURCE_RELEASE_DOS)/api/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) api/source/* $(SOURCE_RELEASE_DOS)/api/source
	@mkdir -p $(SOURCE_RELEASE_DOS)/demo/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) demo/source/* $(SOURCE_RELEASE_DOS)/demo/source
	@mkdir -p $(SOURCE_RELEASE_DOS)/framework/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) framework/source/* $(SOURCE_RELEASE_DOS)/framework/source
	@mkdir -p $(SOURCE_RELEASE_DOS)/skeleton/source
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) skeleton/source/* $(SOURCE_RELEASE_DOS)/skeleton/source

	@echo "  * Synchronizing tool folders..."
	@mkdir -p $(SOURCE_RELEASE_DOS)/demo/tool
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) demo/tool/* $(SOURCE_RELEASE_DOS)/demo/tool
	@mkdir -p $(SOURCE_RELEASE_DOS)/framework/tool
	@nice -n $(NICE) rsync $(RSYNC_SOURCE_OPT) framework/tool/* $(SOURCE_RELEASE_DOS)/framework/tool

	@echo "  * Fixing line-breaks..."
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find $(SOURCE_RELEASE_DOS) $(FIX_FILES) | xargs unix2dos > /dev/null 2>&1


source-release-compress:
	@echo
	@echo "  COMPRESSION OF SOURCE RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Generating gzip (Unix) archive..."
	@cd release/source/unix; rm -f qooxdoo-$(VERSION)-source.tar.gz; nice -n $(NICE) tar cfz qooxdoo-$(VERSION)-source.tar.gz qooxdoo-$(VERSION)-source

	@echo "  * Generating bzip2 (Unix) archive..."
	@cd release/source/unix; rm -f qooxdoo-$(VERSION)-source.tar.bz2; nice -n $(NICE) tar cfj qooxdoo-$(VERSION)-source.tar.bz2 qooxdoo-$(VERSION)-source

	@echo "  * Generating zip (DOS) archive..."
	@cd release/source/dos; rm -f qooxdoo-$(VERSION)-source.zip; nice -n $(NICE) zip -rq qooxdoo-$(VERSION)-source.zip qooxdoo-$(VERSION)-source
