###################################################################################
# DEFAULT TARGET
###################################################################################

all: build




###################################################################################
# COMMON TARGETS
###################################################################################


build:
	@$(MAKE) -C ataglance build
	@$(MAKE) -C webmail build
	@$(MAKE) -C feedreader build
	@$(MAKE) -C samples build


source:
	@$(MAKE) -C ataglance source
	@$(MAKE) -C webmail source
	@$(MAKE) -C feedreader source
	@$(MAKE) -C samples source
	




###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	@$(MAKE) -C ataglance clean
	@$(MAKE) -C webmail clean
	@$(MAKE) -C feedreader clean
	@$(MAKE) -C samples clean

realclean:
	@$(MAKE) -C ataglance realclean
	@$(MAKE) -C webmail realclean
	@$(MAKE) -C feedreader realclean
	@$(MAKE) -C samples realclean

distclean:
	@$(MAKE) -C ataglance distclean
	@$(MAKE) -C webmail distclean
	@$(MAKE) -C feedreader distclean
	@$(MAKE) -C samples distclean





###################################################################################
# SYNC TARGETS
###################################################################################

sync:
	@$(MAKE) -C ataglance sync
	@$(MAKE) -C webmail sync
	@$(MAKE) -C feedreader sync
	@$(MAKE) -C samples sync
