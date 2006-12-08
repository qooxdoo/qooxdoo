###################################################################################
# DEFAULT TARGET
###################################################################################

all: build




###################################################################################
# COMMON TARGETS
###################################################################################


build:
	@$(MAKE) -C glance build
	@$(MAKE) -C webmail build
	@$(MAKE) -C feedreader build
	@$(MAKE) -C sample build


source:
	@$(MAKE) -C glance source
	@$(MAKE) -C webmail source
	@$(MAKE) -C feedreader source
	@$(MAKE) -C sample source
	




###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	@$(MAKE) -C glance clean
	@$(MAKE) -C webmail clean
	@$(MAKE) -C feedreader clean
	@$(MAKE) -C sample clean

realclean:
	@$(MAKE) -C glance realclean
	@$(MAKE) -C webmail realclean
	@$(MAKE) -C feedreader realclean
	@$(MAKE) -C sample realclean

distclean:
	@$(MAKE) -C glance distclean
	@$(MAKE) -C webmail distclean
	@$(MAKE) -C feedreader distclean
	@$(MAKE) -C sample distclean





###################################################################################
# SYNC TARGETS
###################################################################################

sync:
	@$(MAKE) -C glance sync
	@$(MAKE) -C webmail sync
	@$(MAKE) -C feedreader sync
	@$(MAKE) -C sample sync
