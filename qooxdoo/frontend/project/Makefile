APPLICATIONS = apiviewer feedreader framework sample showcase webmail

source:
	@for DIR in $(APPLICATIONS); do $(MAKE) -s -C $$DIR source || exit 1; done

build:
	@for DIR in $(APPLICATIONS); do $(MAKE) -s -C $$DIR build || exit 1; done
	
api:
	@for DIR in $(APPLICATIONS); do $(MAKE) -s -C $$DIR api || exit 1; done
	
all:
	@for DIR in $(APPLICATIONS); do $(MAKE) -s -C $$DIR all || exit 1; done

publish:
	@for DIR in $(APPLICATIONS); do $(MAKE) -s -C $$DIR publish || exit 1; done

fix:
	@for DIR in $(APPLICATIONS); do $(MAKE) -s -C $$DIR fix || exit 1; done

pretty:
	@for DIR in $(APPLICATIONS); do $(MAKE) -s -C $$DIR pretty || exit 1;	done	

clean:
	@for DIR in $(APPLICATIONS); do $(MAKE) -s -C $$DIR clean || exit 1; done

realclean:
	@for DIR in $(APPLICATIONS); do $(MAKE) -s -C $$DIR realclean || exit 1; done

distclean:
	@for DIR in $(APPLICATIONS); do $(MAKE) -s -C $$DIR distclean || exit 1; done
