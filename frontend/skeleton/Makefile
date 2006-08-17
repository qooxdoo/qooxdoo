NICE=10



###################################################################################
# DEFAULT TARGET
###################################################################################

all: build



###################################################################################
# GENERAL TARGETS
###################################################################################

build: sample1 sample2
clean: sample1-clean sample2-clean
realclean: sample1-realclean sample2-realclean
	rm -rf build

distclean: sample1-distclean sample2-distclean
	rm -rf build




###################################################################################
# SAMPLE 1 TARGETS
###################################################################################

sample1: sample1-archives

sample1-build:
	$(MAKE) -C source/sample1 build

sample1-source:
	$(MAKE) -C source/sample1 source

sample1-archives:
	@echo
	@echo "  GENERATION OF SAMPLE 1 ARCHIVES"
	@echo "----------------------------------------------------------------------------"

	@mkdir -p build/dos
	@mkdir -p build/unix

	@echo "  * Synchronizing Unix content..."
	@nice -n $(NICE) rsync --recursive --links --delete --exclude build --exclude script --exclude .cache --exclude=*.svn source/sample1 build/unix
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find build/unix -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile | xargs dos2unix > /dev/null 2>&1

	@echo "  * Synchronizing DOS content..."
	@nice -n $(NICE) rsync --recursive --links --delete --exclude build --exclude script --exclude .cache --exclude=*.svn source/sample1 build/dos
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find build/dos -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile | xargs unix2dos > /dev/null 2>&1

	@echo "  * Creating gzip archive..."
	@cd build/unix; rm -f sample1.tar.gz; nice -n $(NICE) tar cfz sample1.tar.gz sample1

	@echo "  * Creating zip archive..."
	@cd build/dos; rm -f sample1.zip; nice -n $(NICE) zip -rq sample1.zip sample1

sample1-clean:
	rm -rf build/unix/sample1.*
	rm -rf build/dos/sample1.*
	$(MAKE) -C source/sample1 clean

sample1-realclean: sample1-clean
	nice -n $(NICE) rm -rf build/unix/sample1
	nice -n $(NICE) rm -rf build/dos/sample1
	$(MAKE) -C source/sample1 realclean

sample1-distclean: sample1-realclean
	$(MAKE) -C source/sample1 distclean




###################################################################################
# SAMPLE 2 TARGETS
###################################################################################

sample2: sample2-archives

sample2-build:
	$(MAKE) -C source/sample2 build

sample2-source:
	$(MAKE) -C source/sample2 source

sample2-archives:
	@echo
	@echo "  GENERATION OF SAMPLE 2 ARCHIVES"
	@echo "----------------------------------------------------------------------------"

	@mkdir -p build/dos
	@mkdir -p build/unix

	@echo "  * Synchronizing Unix content..."
	@nice -n $(NICE) rsync --recursive --links --delete --exclude build --exclude script --exclude .cache --exclude=*.svn source/sample2 build/unix
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find build/unix -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile | xargs dos2unix > /dev/null 2>&1

	@echo "  * Synchronizing DOS content..."
	@nice -n $(NICE) rsync --recursive --links --delete --exclude build --exclude script --exclude .cache --exclude=*.svn source/sample2 build/dos
	@# use pipe to /dev/null because windows (cygwin) does not support the -q (quiet) argument
	@nice -n $(NICE) find build/dos -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name Makefile | xargs unix2dos > /dev/null 2>&1

	@echo "  * Creating gzip archive..."
	@cd build/unix; rm -f sample2.tar.gz; nice -n $(NICE) tar cfz sample2.tar.gz sample2

	@echo "  * Creating zip archive..."
	@cd build/dos; rm -f sample2.zip; nice -n $(NICE) zip -rq sample2.zip sample2

sample2-clean:
	rm -rf build/unix/sample2.*
	rm -rf build/dos/sample2.*
	$(MAKE) -C source/sample2 clean

sample2-realclean: sample2-clean
	nice -n $(NICE) rm -rf build/unix/sample2
	nice -n $(NICE) rm -rf build/dos/sample2
	$(MAKE) -C source/sample2 realclean

sample2-distclean: sample2-realclean
	$(MAKE) -C source/sample2 distclean
