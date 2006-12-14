TARGETS = apiviewer feedreader sample showcase skeleton webmail

source:
	@for DIR in $(TARGETS); do \
	  make -C $$DIR source || exit 1; \
	done

build:
	@for DIR in $(TARGETS); do \
	  make -C $$DIR build || exit 1; \
	done

clean:
	@for DIR in $(TARGETS); do \
	  make -C $$DIR clean || exit 1; \
	done

realclean:
	@for DIR in $(TARGETS); do \
	  make -C $$DIR realclean || exit 1; \
	done

distclean:
	@for DIR in $(TARGETS); do \
	  make -C $$DIR distclean || exit 1; \
	done

sync:
	@for DIR in $(TARGETS); do \
	  make -C $$DIR sync || exit 1; \
	done
