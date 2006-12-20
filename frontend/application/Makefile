APPLICATIONS = apiviewer feedreader sample showcase webmail

source:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION source || exit 1; done

build:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION build || exit 1; done
	
api:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION api || exit 1; done
	
all:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION all || exit 1; done

publish:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION publish || exit 1; done

fix:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION fix || exit 1; done

pretty:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION pretty || exit 1;	done	

clean:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION clean || exit 1; done

realclean:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION realclean || exit 1; done

distclean:
	@for APPLICATION in $(APPLICATIONS); do $(MAKE) -s -C $$APPLICATION distclean || exit 1; done
