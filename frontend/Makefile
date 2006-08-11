###################################################################################
# DEFAULT TARGET
###################################################################################

all: build



###################################################################################
# COMMON TARGETS
###################################################################################

build:
	$(MAKE) -C api build
	$(MAKE) -C demo build
	$(MAKE) -C framework build

source:
	$(MAKE) -C api source
	$(MAKE) -C demo source
	$(MAKE) -C framework source

api-build:
	$(MAKE) -C api build

demo-build:
	$(MAKE) -C demo build

framework-build:
	$(MAKE) -C framework build

api-source:
	$(MAKE) -C api source

demo-source:
	$(MAKE) -C demo source

framework-source:
	$(MAKE) -C framework source



###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	$(MAKE) -C api clean
	$(MAKE) -C demo clean
	$(MAKE) -C framework clean

realclean:
	$(MAKE) -C api realclean
	$(MAKE) -C demo realclean
	$(MAKE) -C framework realclean

distclean:
	$(MAKE) -C api distclean
	$(MAKE) -C demo distclean
	$(MAKE) -C framework distclean

	@rm -rf .cache
