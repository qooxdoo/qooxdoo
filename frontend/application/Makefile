APPLICATIONS = apiviewer feedreader sample showcase webmail

source:
	@for DIR in $(APPLICATIONS); do \
	  make -C $$DIR source || exit 1; \
	done

build:
	@for DIR in $(APPLICATIONS); do \
	  make -C $$DIR build || exit 1; \
	done

clean:
	@for DIR in $(APPLICATIONS); do \
	  make -C $$DIR clean || exit 1; \
	done

realclean:
	@for DIR in $(APPLICATIONS); do \
	  make -C $$DIR realclean || exit 1; \
	done

distclean:
	@for DIR in $(APPLICATIONS); do \
	  make -C $$DIR distclean || exit 1; \
	done

publish:
	@for DIR in $(APPLICATIONS); do \
	  make -C $$DIR publish || exit 1; \
	done
