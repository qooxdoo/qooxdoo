###################################################################################
# DEFAULT TARGET
###################################################################################

all: build



###################################################################################
# COMMON TARGETS
###################################################################################

build:
	@$(MAKE) -C at-a-glance build
	@$(MAKE) -C mail build
	@$(MAKE) -C reader build
	@$(MAKE) -C samples build

source:
	@$(MAKE) -C at-a-glance source
	@$(MAKE) -C mail source
	@$(MAKE) -C reader source
	@$(MAKE) -C samples source

clean:
	@$(MAKE) -C at-a-glance clean
	@$(MAKE) -C mail clean
	@$(MAKE) -C reader clean
	@$(MAKE) -C samples clean

distclean:
	@$(MAKE) -C at-a-glance distclean
	@$(MAKE) -C mail distclean
	@$(MAKE) -C reader distclean
	@$(MAKE) -C samples distclean
	