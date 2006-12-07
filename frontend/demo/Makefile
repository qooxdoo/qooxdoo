###################################################################################
# DEFAULT TARGET
###################################################################################

all: build



###################################################################################
# COMMON TARGETS
###################################################################################

build: samples-build build/index.html copy-files-build
source: samples-source source/index.html

samples-build:
	@$(MAKE) -C ataglance build
	@$(MAKE) -C webmail build
	@$(MAKE) -C feedreader build
	@$(MAKE) -C samples build

build/index.html:
	mkdir -p build
	@sed \
	  -e s/%{example}/example/g \
	  -e s/%{ataglance}/ataglance/g \
	  -e s/%{feedreader}/feedreader/g \
	  -e s/%{webmail}/webmail/g \
	  source/index.html.in > build/index.html

copy-files-build:
	rsync --checksum --recursive --delete --verbose --exclude '.svn' source/css build
	rsync --checksum --recursive --delete --verbose --exclude '.svn' ataglance/build/* build/ataglance
	rsync --checksum --recursive --delete --verbose --exclude '.svn' samples/build/* build/samples
	rsync --checksum --recursive --delete --verbose --exclude '.svn' webmail/build/* build/webmail
	rsync --checksum --recursive --delete --verbose --exclude '.svn' feedreader/build/* build/feedreader

samples-source:
	@$(MAKE) -C ataglance source
	@$(MAKE) -C webmail source
	@$(MAKE) -C feedreader source
	@$(MAKE) -C samples source
	
source/index.html: source/index.html.in
	@sed \
	  -e s/%{example}/..\\/example\\/source/g \
	  -e s/%{ataglance}/..\\/ataglance\\/source/g \
	  -e s/%{feedreader}/..\\/feedreader\\/source/g \
	  -e s/%{webmail}/..\\/webmail\\/source/g \
	  source/index.html.in > source/index.html

clean:
	@$(MAKE) -C ataglance clean
	@$(MAKE) -C webmail clean
	@$(MAKE) -C feedreader clean
	@$(MAKE) -C samples clean

distclean:
	@$(MAKE) -C ataglance distclean
	@$(MAKE) -C webmail distclean
	@$(MAKE) -C feedreader distclean
	@$(MAKE) -C samples distclean
	@$(RM) -rf build
	@$(RM) source/index.html


###################################################################################
# ONLINE TARGETS
###################################################################################

revision-bump:
	@$(MAKE) -C ../framework revision-bump

sync-qooxdoo-org: build
	@echo
	@echo "  SYNC FILES TO HOMEPAGE"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Syncing..."
	@nice -n $(NICE) rsync --checksum --recursive --archive --delete --verbose build/* root@qooxdoo.org:/var/www/qooxdoo/demo

