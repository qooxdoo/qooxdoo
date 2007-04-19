.PHONY: source build clean distclean

source:
	@$(MAKE) -f Makefile.runner source
	@$(MAKE) -f Makefile.tests source
    
    
build:
	@$(MAKE) -f Makefile.runner build
	@$(MAKE) -f Makefile.tests build
    
clean:
	@$(MAKE) -f Makefile.runner clean
	@$(MAKE) -f Makefile.tests clean
    
distclean:
	@$(MAKE) -f Makefile.runner distclean
	@$(MAKE) -f Makefile.tests distclean
	
api:
	@$(MAKE) -f Makefile.runner api
	