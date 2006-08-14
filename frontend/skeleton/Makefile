###################################################################################
# DEFAULT TARGET
###################################################################################

all: build



###################################################################################
# TARGETS
###################################################################################

build: sample1 sample2
clean: sample1-clean sample2-clean
realclean: sample1-realclean sample2-realclean
	rm -rf build

distclean: sample1-distclean sample2-distclean
	rm -rf build

.PHONY: sample1 sample2



###################################################################################
# SAMPLE 1 TARGETS
###################################################################################

sample1: sample1-archives

sample1-build:
	$(MAKE) -C source/sample1 build

sample1-source:
	$(MAKE) -C source/sample1 source

sample1-archives: sample1-build sample1-source
	@echo
	@echo "  GENERATION OF SAMPLE 1 ARCHIVES"
	@echo "----------------------------------------------------------------------------"

	@mkdir -p build

	@echo "  * Creating gzip archive..."
	@cd source; tar cfz ../build/sample1.tar.gz sample1

	@echo "  * Creating bzip2 archive..."
	@cd source; tar cfj ../build/sample1.tar.bz2 sample1

	@echo "  * Creating zip archive..."
	@cd source; zip -rq ../build/sample1.zip sample1

sample1-clean:
	rm -rf build/sample1*
	$(MAKE) -C source/sample1 clean

sample1-realclean: sample1-clean
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

sample2-archives: sample2-build sample2-source
	@echo
	@echo "  GENERATION OF SAMPLE 2 ARCHIVES"
	@echo "----------------------------------------------------------------------------"

	@mkdir -p build

	@echo "  * Creating gzip archive..."
	@cd source; tar cfz ../build/sample2.tar.gz sample2

	@echo "  * Creating bzip2 archive..."
	@cd source; tar cfj ../build/sample2.tar.bz2 sample2

	@echo "  * Creating zip archive..."
	@cd source; zip -rq ../build/sample2.zip sample2

sample2-clean:
	rm -rf build/sample2*
	$(MAKE) -C source/sample2 clean

sample2-realclean: sample2-clean
	$(MAKE) -C source/sample2 realclean

sample2-distclean: sample2-realclean
	$(MAKE) -C source/sample2 distclean
