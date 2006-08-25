NICE=10



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
	@nice -n $(NICE) rsync --recursive --links --delete --exclude build --exclude script --exclude .cache --exclude=*.svn source/sample1 build/temp/unix
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find build/temp/unix -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile | xargs dos2unix > /dev/null 2>&1

	@echo "  * Synchronizing DOS content..."
	@nice -n $(NICE) rsync --recursive --links --delete --exclude build --exclude script --exclude .cache --exclude=*.svn source/sample1 build/temp/dos
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find build/temp/dos -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile | xargs unix2dos > /dev/null 2>&1

	@echo "  * Creating gzip archive..."
	@cd build/temp/unix; rm -f sample1.tar.gz; nice -n $(NICE) tar cfz ../../sample1.tar.gz sample1

	@echo "  * Creating zip archive..."
	@cd build/temp/dos; rm -f sample1.zip; nice -n $(NICE) zip -rq ../../sample1.zip sample1

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
	@nice -n $(NICE) rsync --recursive --links --delete --exclude build --exclude script --exclude .cache --exclude=*.svn source/sample2 build/temp/unix
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find build/temp/unix -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile | xargs dos2unix > /dev/null 2>&1

	@echo "  * Synchronizing DOS content..."
	@nice -n $(NICE) rsync --recursive --links --delete --exclude build --exclude script --exclude .cache --exclude=*.svn source/sample2 build/temp/dos
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find build/temp/dos -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile | xargs unix2dos > /dev/null 2>&1

	@echo "  * Creating gzip archive..."
	@cd build/temp/unix; rm -f sample2.tar.gz; nice -n $(NICE) tar cfz ../../sample2.tar.gz sample2

	@echo "  * Creating zip archive..."
	@cd build/temp/dos; rm -f sample2.zip; nice -n $(NICE) zip -rq ../../sample2.zip sample2

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
	@nice -n $(NICE) rsync --recursive --links --delete --exclude build --exclude script --exclude .cache --exclude=*.svn source/sample3 build/temp/unix
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find build/temp/unix -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile | xargs dos2unix > /dev/null 2>&1

	@echo "  * Synchronizing DOS content..."
	@nice -n $(NICE) rsync --recursive --links --delete --exclude build --exclude script --exclude .cache --exclude=*.svn source/sample3 build/temp/dos
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find build/temp/dos -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile | xargs unix2dos > /dev/null 2>&1

	@echo "  * Creating gzip archive..."
	@cd build/temp/unix; rm -f sample3.tar.gz; nice -n $(NICE) tar cfz ../../sample3.tar.gz sample3

	@echo "  * Creating zip archive..."
	@cd build/temp/dos; rm -f sample3.zip; nice -n $(NICE) zip -rq ../../sample3.zip sample3

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
