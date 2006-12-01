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

archives: sample1-archives sample2-archives sample3-archives
build: sample1-build sample2-build sample3-build
source: sample1-source sample2-source sample3-source

clean: sample1-clean sample2-clean sample3-clean

realclean: sample1-realclean sample2-realclean sample3-realclean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (REAL)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -rf build/temp

distclean: sample1-distclean sample2-distclean sample3-distclean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (DIST)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -rf build




###################################################################################
# SAMPLE 1 TARGETS
###################################################################################

sample1-build:
	@$(MAKE) -C source/sample1 build

sample1-source:
	@$(MAKE) -C source/sample1 source

sample1-archives:
	@echo
	@echo "  GENERATION OF SAMPLE 1 ARCHIVES"
	@echo "----------------------------------------------------------------------------"

	@mkdir -p build/temp/dos
	@mkdir -p build/temp/unix

	@echo "  * Synchronizing Unix content..."
	@nice -n $(NICE) $(SYNC) source/sample1 build/temp/unix
	@nice -n $(NICE) find build/temp/unix $(FIXFILES) $(ANY2UNIX)

	@echo "  * Synchronizing DOS content..."
	@nice -n $(NICE) $(SYNC) source/sample1 build/temp/dos
	@nice -n $(NICE) find build/temp/dos $(FIXFILES) $(ANY2DOS)

	@echo "  * Creating gzip archive..."
	@cd build/temp/unix; rm -f sample1.tar.gz; nice -n $(NICE) $(TAR) ../../sample1.tar.gz sample1

	@echo "  * Creating zip archive..."
	@cd build/temp/dos; rm -f sample1.zip; nice -n $(NICE) $(ZIP) ../../sample1.zip sample1

sample1-clean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -f build/sample1.zip build/sample1.tar.gz
	@$(MAKE) -C source/sample1 clean

sample1-realclean: sample1-clean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (REAL)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@nice -n $(NICE) rm -rf build/temp/unix/sample1
	@nice -n $(NICE) rm -rf build/temp/dos/sample1
	@$(MAKE) -C source/sample1 realclean

sample1-distclean: sample1-realclean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (DIST)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@$(MAKE) -C source/sample1 distclean




###################################################################################
# SAMPLE 2 TARGETS
###################################################################################

sample2-build:
	@$(MAKE) -C source/sample2 build

sample2-source:
	@$(MAKE) -C source/sample2 source

sample2-archives:
	@echo
	@echo "  GENERATION OF SAMPLE 2 ARCHIVES"
	@echo "----------------------------------------------------------------------------"

	@mkdir -p build/temp/dos
	@mkdir -p build/temp/unix

	@echo "  * Synchronizing Unix content..."
	@nice -n $(NICE) $(SYNC) source/sample2 build/temp/unix
	@nice -n $(NICE) find build/temp/unix $(FIXFILES) $(ANY2UNIX)

	@echo "  * Synchronizing DOS content..."
	@nice -n $(NICE) $(SYNC) source/sample2 build/temp/dos
	@nice -n $(NICE) find build/temp/dos $(FIXFILES) $(ANY2DOS)

	@echo "  * Creating gzip archive..."
	@cd build/temp/unix; rm -f sample2.tar.gz; nice -n $(NICE) $(TAR) ../../sample2.tar.gz sample2

	@echo "  * Creating zip archive..."
	@cd build/temp/dos; rm -f sample2.zip; nice -n $(NICE) $(ZIP) ../../sample2.zip sample2

sample2-clean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -f build/sample2.zip build/sample2.tar.gz
	@$(MAKE) -C source/sample2 clean

sample2-realclean: sample2-clean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (REAL)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@nice -n $(NICE) rm -rf build/temp/unix/sample2
	@nice -n $(NICE) rm -rf build/temp/dos/sample2
	@$(MAKE) -C source/sample2 realclean

sample2-distclean: sample2-realclean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (DIST)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@$(MAKE) -C source/sample2 distclean




###################################################################################
# SAMPLE 3 TARGETS
###################################################################################

sample3-build:
	@$(MAKE) -C source/sample3 build

sample3-source:
	@$(MAKE) -C source/sample3 source

sample3-archives:
	@echo
	@echo "  GENERATION OF SAMPLE 3 ARCHIVES"
	@echo "----------------------------------------------------------------------------"

	@mkdir -p build/temp/dos
	@mkdir -p build/temp/unix

	@echo "  * Synchronizing Unix content..."
	@nice -n $(NICE) $(SYNC) source/sample3 build/temp/unix
	@nice -n $(NICE) find build/temp/unix $(FIXFILES) $(ANY2UNIX)

	@echo "  * Synchronizing DOS content..."
	@nice -n $(NICE) $(SYNC) source/sample3 build/temp/dos
	@nice -n $(NICE) find build/temp/dos $(FIXFILES) $(ANY2DOS)

	@echo "  * Creating gzip archive..."
	@cd build/temp/unix; rm -f sample3.tar.gz; nice -n $(NICE) $(TAR) ../../sample3.tar.gz sample3

	@echo "  * Creating zip archive..."
	@cd build/temp/dos; rm -f sample3.zip; nice -n $(NICE) $(ZIP) ../../sample3.zip sample3

sample3-clean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -f build/sample3.zip build/sample3.tar.gz
	@$(MAKE) -C source/sample3 clean

sample3-realclean: sample3-clean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (REAL)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@nice -n $(NICE) rm -rf build/temp/unix/sample3
	@nice -n $(NICE) rm -rf build/temp/dos/sample3
	@$(MAKE) -C source/sample3 realclean

sample3-distclean: sample3-realclean
	@echo
	@echo "  CLEANUP OF GENERATED FILES (DIST)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@$(MAKE) -C source/sample3 distclean
