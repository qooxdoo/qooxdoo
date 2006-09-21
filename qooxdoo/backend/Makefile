###################################################################################
# VARIABLES
###################################################################################

VERSION = 0.6.1

NICE=10
NICE_CALL = nice -n $(NICE)

RELEASE_UNIX = release/temp/unix/qooxdoo-$(VERSION)-backend
RELEASE_DOS = release/temp/dos/qooxdoo-$(VERSION)-backend

FIX_FILES = -name SERVER_WRITER_GUIDE -o -name *.java -o -name *.xml -o -name *.sample -o -name *.php -o -name *.phps -o -name AUTHORS -o -name LICENSE -o -name README -o -name RELEASENOTES -o -name TODO

RSYNC = --recursive --archive --delete --exclude .svn
RSYNC_EXEC = @$(NICE_CALL) rsync $(RSYNC)

UNIX2DOS = | xargs unix2dos > /dev/null 2>&1
DOS2UNIX = | xargs dos2unix > /dev/null 2>&1

FILES = java php SERVER_WRITER_GUIDE


###################################################################################
# DEFAULT TARGET
###################################################################################

all: archive



###################################################################################
# COMMON TARGETS
###################################################################################

archive:
	@echo
	@echo "  SYNCHRONISATION OF UNIX BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"
	@mkdir -p $(RELEASE_UNIX)

	@echo "  * Copying info files..."
	@find ../ -maxdepth 1 -type f -name "[A-Z]*" -exec cp -f {} $(RELEASE_UNIX) \;
	@echo "  * Syncing backend files..."
	@$(RSYNC_EXEC) $(FILES) $(RELEASE_UNIX)/backend
	@echo "  * Converting line-breaks..."
	@$(NICE_CALL) find $(RELEASE_UNIX)/backend $(FIX_FILES) $(DOS2UNIX)

	@echo
	@echo "  SYNCHRONISATION OF DOS BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"
	@mkdir -p $(RELEASE_DOS)

	@echo "  * Copying info files..."
	@find ../ -maxdepth 1 -type f -name "[A-Z]*" -exec cp -f {} $(RELEASE_DOS) \;
	@echo "  * Syncing backend files..."
	@$(RSYNC_EXEC) $(FILES) $(RELEASE_DOS)/backend
	@echo "  * Converting line-breaks..."
	@$(NICE_CALL) find $(RELEASE_UNIX)/backend $(FIX_FILES) $(UNIX2DOS)

	@echo
	@echo "  COMPRESSION OF RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Generating gzip (Unix) archive..."
	@cd release/temp/unix; rm -f qooxdoo-$(VERSION)-backend.tar.gz; $(NICE_CALL) tar cfzp ../../qooxdoo-$(VERSION)-backend.tar.gz qooxdoo-$(VERSION)-backend

	@echo "  * Generating zip (DOS) archive..."
	@cd release/temp/dos; rm -f qooxdoo-$(VERSION)-backend.zip; $(NICE_CALL) zip -rq ../../qooxdoo-$(VERSION)-backend.zip qooxdoo-$(VERSION)-backend







###################################################################################
# CLEANUP TARGETS
###################################################################################

clean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES"
	@echo "----------------------------------------------------------------------------"
	@rm -f release/*.gz release/*.zip

realclean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES (REAL)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -rf release/temp

distclean:
	@echo
	@echo "  CLEANUP OF GENERATED FILES (DIST)"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -rf release
