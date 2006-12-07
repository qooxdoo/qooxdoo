NICE=10

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
# ONLINE TARGETS
###################################################################################

revision-bump:
	@$(MAKE) -C ../framework revision-bump

sync-qooxdoo-org:
	@echo
	@echo "  SYNC FILES TO HOMEPAGE"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Syncing..."
	
	@nice -n $(NICE) rsync --checksum --recursive --delete --verbose --exclude '.svn' ataglance/build/* root@qooxdoo.org:/var/www/qooxdoo/demo/ataglance
	@nice -n $(NICE) rsync --checksum --recursive --delete --verbose --exclude '.svn' samples/build/* root@qooxdoo.org:/var/www/qooxdoo/demo/samples
	@nice -n $(NICE) rsync --checksum --recursive --delete --verbose --exclude '.svn' webmail/build/* root@qooxdoo.org:/var/www/qooxdoo/demo/webmail
	@nice -n $(NICE) rsync --checksum --recursive --delete --verbose --exclude '.svn' feedreader/build/* root@qooxdoo.org:/var/www/qooxdoo/demo/feedreader

