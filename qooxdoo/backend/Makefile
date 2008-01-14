################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Andreas Ecker (ecker)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

################################################################################
# PUBLIC VARIABLES
################################################################################

QOOXDOO_PATH = ..




################################################################################
# INCLUDE CORE
################################################################################

include $(QOOXDOO_PATH)/frontend/framework/tool/make/framework.mk





################################################################################
# PRIVATE VARIABLES
################################################################################

RELEASE_UNIX = release/temp/unix/qooxdoo-$(FRAMEWORK_VERSION)-backend
RELEASE_DOS = release/temp/dos/qooxdoo-$(FRAMEWORK_VERSION)-backend

TEXT_FILES = -name "*.py" -o -name "*.sh" -o -name *.java -o -name *.xml -o -name *.sample -o -name *.php -o -name *.phps -o -name AUTHORS -o -name LICENSE -o -name README -o -name RELEASENOTES -o -name TODO -o -name SERVER_WRITER_GUIDE

BACKEND_COPY = java php perl SERVER_WRITER_GUIDE





################################################################################
# DEFAULT TARGET
################################################################################

all: archive
release: archive






################################################################################
# COMMON TARGETS
################################################################################

archive:
	@echo
	@echo "  SYNCHRONISATION OF UNIX BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"
	@mkdir -p $(RELEASE_UNIX)

	@echo "  * Copying info files..."
	@$(CMD_FIND) ../ -maxdepth 1 -type f -name "[A-Z]*" -exec cp -f {} $(RELEASE_UNIX) \;
	@echo "  * Syncing backend files..."
	@$(CMD_SYNC_OFFLINE) $(BACKEND_COPY) $(RELEASE_UNIX)/backend
	@echo "  * Converting line-breaks..."
	@$(CMD_FIND) $(RELEASE_UNIX) $(TEXT_FILES) $(CMD_ANY2UNIX)

	@echo
	@echo "  SYNCHRONISATION OF DOS BUILD RELEASE"
	@echo "----------------------------------------------------------------------------"
	@mkdir -p $(RELEASE_DOS)

	@echo "  * Copying info files..."
	@$(CMD_FIND) ../ -maxdepth 1 -type f -name "[A-Z]*" -exec cp -f {} $(RELEASE_DOS) \;
	@echo "  * Syncing backend files..."
	@$(CMD_SYNC_OFFLINE) $(BACKEND_COPY) $(RELEASE_DOS)/backend
	@echo "  * Converting line-breaks..."
	@$(CMD_FIND) $(RELEASE_DOS) $(TEXT_FILES) $(CMD_ANY2DOS)

	@echo
	@echo "  COMPRESSION OF RELEASE"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Generating gzip (Unix) archive..."
	@cd release/temp/unix; rm -f qooxdoo-$(FRAMEWORK_VERSION)-backend.tar.gz; $(CMD_TAR_CREATE) ../../qooxdoo-$(FRAMEWORK_VERSION)-backend.tar.gz qooxdoo-$(FRAMEWORK_VERSION)-backend

	@echo "  * Generating zip (DOS) archive..."
	@cd release/temp/dos; rm -f qooxdoo-$(FRAMEWORK_VERSION)-backend.zip; $(CMD_ZIP_CREATE) ../../qooxdoo-$(FRAMEWORK_VERSION)-backend.zip qooxdoo-$(FRAMEWORK_VERSION)-backend

	@echo
	@echo "  CLEANUP"
	@echo "----------------------------------------------------------------------------"

	@echo "  * Removing temporary files..."
	@$(CMD_REMOVE) release/temp





################################################################################
# CLEANUP TARGETS
################################################################################

clean:
	@echo
	@echo "  CLEANING UP GENERATED FILES"
	@echo "----------------------------------------------------------------------------"
	@rm -f release/*.gz release/*.zip

distclean:
	@echo
	@echo "  CLEANING UP GENERATED FILES COMPLETELY"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Deleting files..."
	@rm -rf release
