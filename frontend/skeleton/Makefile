###################################################################################
# DEFAULT TARGET
###################################################################################

all: subdirs



###################################################################################
# TARGETS
###################################################################################

SUBDIRS = $(shell find source/ -mindepth 1 -maxdepth 1 ! -name "*.svn" -type d)

.PHONY: subdirs $(SUBDIRS)
subdirs: $(SUBDIRS)

$(SUBDIRS):
	@echo
	$(MAKE) -C $@ build
	@echo
	$(MAKE) -C $@ source
	@echo

	@echo "****************************************************************************"
	@echo "  GENERATE ARCHIVES FOR $@"
	@echo "****************************************************************************"

	@mkdir -p build
	@cd source; \
	echo "  * Creating gzip archive..."; \
	tar cfz ../build/`basename $@`.tar.gz `basename $@`; \
	echo "  * Creating bzip2 archive..."; \
	tar cfj ../build/`basename $@`.tar.bz2 `basename $@`; \
	echo "  * Creating zip archive..."; \
	zip -rq ../build/`basename $@`.zip `basename $@`; \
	cd ..

clean:
	rm -rf build
	rm -rf source/*/build source/*/source/script
