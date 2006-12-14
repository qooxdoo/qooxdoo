NICE=10

ANY2DOS = | xargs ../framework/tool/modules/textutil.py --command any2Dos
ANY2UNIX = | xargs ../framework/tool/modules/textutil.py --command any2Unix

SYNC = rsync --recursive --links --delete --exclude build --exclude script --exclude .cache --exclude=*.svn
FIXFILES = -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile

TAR = tar cfz
ZIP = zip -rq


###################################################################################
# DEFAULT TARGET
###################################################################################

all: archives



###################################################################################
# GENERAL TARGETS
###################################################################################

archives: sample-archives
build: sample-build
source: sample-source

clean: sample-clean

realclean: sample-realclean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (REAL)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -rf build/temp

distclean: sample-distclean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (DIST)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -rf build




###################################################################################
# SAMPLE 1 TARGETS
###################################################################################

sample-build:
	@$(MAKE) -C source/sample build

sample-source:
	@$(MAKE) -C source/sample source

sample-archives:
	@echo
	@echo "  GENERATION OF SAMPLE 1 ARCHIVES"
	@echo "----------------------------------------------------------------------------"

	@mkdir -p build/temp/dos
	@mkdir -p build/temp/unix

	@echo "  * Synchronizing Unix content..."
	@nice -n $(NICE) $(SYNC) source/sample build/temp/unix
	@nice -n $(NICE) find build/temp/unix $(FIXFILES) $(ANY2UNIX)

	@echo "  * Synchronizing DOS content..."
	@nice -n $(NICE) $(SYNC) source/sample build/temp/dos
	@nice -n $(NICE) find build/temp/dos $(FIXFILES) $(ANY2DOS)

	@echo "  * Creating gzip archive..."
	@cd build/temp/unix; rm -f sample.tar.gz; nice -n $(NICE) $(TAR) ../../sample.tar.gz sample

	@echo "  * Creating zip archive..."
	@cd build/temp/dos; rm -f sample.zip; nice -n $(NICE) $(ZIP) ../../sample.zip sample

sample-clean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -f build/sample.zip build/sample.tar.gz
	@$(MAKE) -C source/sample clean

sample-realclean: sample-clean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (REAL)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@nice -n $(NICE) rm -rf build/temp/unix/sample
	@nice -n $(NICE) rm -rf build/temp/dos/sample
	@$(MAKE) -C source/sample realclean

sample-distclean: sample-realclean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (DIST)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@$(MAKE) -C source/sample distclean
