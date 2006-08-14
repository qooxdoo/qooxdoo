###################################################################################
# DEFAULT TARGET
###################################################################################

all: build



###################################################################################
# COMMON TARGETS
###################################################################################

build:
	$(MAKE) -C api build
	$(MAKE) -C demo build
	$(MAKE) -C framework build

source:
	$(MAKE) -C api source
	$(MAKE) -C demo source
	$(MAKE) -C framework source

api-build:
	$(MAKE) -C api build

demo-build:
	$(MAKE) -C demo build

framework-build:
	$(MAKE) -C framework build

api-source:
	$(MAKE) -C api source

demo-source:
	$(MAKE) -C demo source

framework-source:
	$(MAKE) -C framework source



###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	$(MAKE) -C api clean
	$(MAKE) -C demo clean
	$(MAKE) -C framework clean

realclean:
	$(MAKE) -C api realclean
	$(MAKE) -C demo realclean
	$(MAKE) -C framework realclean

distclean:
	$(MAKE) -C api distclean
	$(MAKE) -C demo distclean
	$(MAKE) -C framework distclean

	@rm -rf .cache






###################################################################################
# RELEASE TARGETS
###################################################################################

release: build-release source-release

build-release: build build-release-sync build-release-compress

build-release-sync:
	@echo
	@echo "  SYNCHRONISATION OF BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Synchronizing build folders..."
	@mkdir -p release/build/api
	@rsync --recursive --links --delete api/build/* release/build/api
	@mkdir -p release/build/demo
	@rsync --recursive --links --delete demo/build/* release/build/demo
	@mkdir -p release/build/framework
	@rsync --recursive --links --delete framework/build/* release/build/framework

build-release-compress:
	@echo
	@echo "  COMPRESSION OF BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Generating gzip archive..."
	@cd release; tar cfz build.tar.gz build

	@echo "  * Generating bzip2 archive..."
	@cd release; tar cfj build.tar.bz2 build

	@echo "  * Generating zip archive..."
	@cd release; zip -rq build.zip build

source-release: source source-release-sync source-release-compress

source-release-sync:
	@echo
	@echo "  SYNCHRONISATION OF SOURCE RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Copying Makefiles..."
	@mkdir -p release/source
	@cp -f Makefile release/source
	@mkdir -p release/source/api
	@cp -f api/Makefile release/source/api
	@mkdir -p release/source/demo
	@cp -f demo/Makefile release/source/demo
	@mkdir -p release/source/framework
	@cp -f framework/Makefile release/source/framework

	@echo "  * Synchronizing source folders..."
	@mkdir -p release/source/api/source
	@rsync --recursive --links --delete --exclude script api/source/* --exclude .svn release/source/api/source
	@mkdir -p release/source/demo/source
	@rsync --recursive --links --delete --exclude script demo/source/* --exclude .svn release/source/demo/source
	@mkdir -p release/source/framework/source
	@rsync --recursive --links --delete --exclude script framework/source/* --exclude .svn release/source/framework/source

	@echo "  * Synchronizing tool folders..."
	@mkdir -p release/source/demo/tool
	@rsync --recursive --links --delete --exclude script demo/source/* --exclude .svn release/source/demo/tool
	@mkdir -p release/source/framework/tool
	@rsync --recursive --links --delete --exclude script framework/source/* --exclude .svn release/source/framework/tool

source-release-compress:
	@echo
	@echo "  COMPRESSION OF SOURCE RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Generating gzip archive..."
	@cd release; tar cfz source.tar.gz source

	@echo "  * Generating bzip2 archive..."
	@cd release; tar cfj source.tar.bz2 source

	@echo "  * Generating zip archive..."
	@cd release; zip -rq source.zip source
