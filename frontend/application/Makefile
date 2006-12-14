###################################################################################
# DEFAULT TARGET
###################################################################################

all: build




###################################################################################
# COMMON TARGETS
###################################################################################


build:
	@$(MAKE) -C showcase build
	@$(MAKE) -C webmail build
	@$(MAKE) -C feedreader build
	@$(MAKE) -C sample build


source:
	@$(MAKE) -C showcase source
	@$(MAKE) -C webmail source
	@$(MAKE) -C feedreader source
	@$(MAKE) -C sample source
	




###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	@$(MAKE) -C showcase clean
	@$(MAKE) -C webmail clean
	@$(MAKE) -C feedreader clean
	@$(MAKE) -C sample clean

realclean:
	@$(MAKE) -C showcase realclean
	@$(MAKE) -C webmail realclean
	@$(MAKE) -C feedreader realclean
	@$(MAKE) -C sample realclean

distclean:
	@$(MAKE) -C showcase distclean
	@$(MAKE) -C webmail distclean
	@$(MAKE) -C feedreader distclean
	@$(MAKE) -C sample distclean





###################################################################################
# SYNC TARGETS
###################################################################################

sync:
	@$(MAKE) -C showcase sync
	@$(MAKE) -C webmail sync
	@$(MAKE) -C feedreader sync
	@$(MAKE) -C sample sync
