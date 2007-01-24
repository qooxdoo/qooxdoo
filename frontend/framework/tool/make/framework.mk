#
# Framework config
#
FRAMEWORK_VERSION := $(shell cat $(QOOXDOO_PATH)/VERSION)


#
# Framework paths
#
FRAMEWORK_PATH = $(QOOXDOO_PATH)/frontend/framework
FRAMEWORK_NAMESPACE = qx
FRAMEWORK_SOURCE_PATH = $(FRAMEWORK_PATH)/source
FRAMEWORK_CACHE_PATH = $(FRAMEWORK_PATH)/.cache
FRAMEWORK_CLASS_FOLDERNAME = class

FRAMEWORK_LOCALE_PATH = $(FRAMEWORK_SOURCE_PATH)/locale
FRAMEWORK_LOCALE_CLASS_PATH = $(FRAMEWORK_SOURCE_PATH)/$(FRAMEWORK_CLASS_FOLDERNAME)/$(FRAMEWORK_NAMESPACE)/locale/data

FRAMEWORK_TRANSLATION_PATH = $(FRAMEWORK_SOURCE_PATH)/translation
FRAMEWORK_TRANSLATION_CLASS_NAMESPACE = $(FRAMEWORK_NAMESPACE).locale.translation
FRAMEWORK_TRANSLATION_CLASS_PATH = $(FRAMEWORK_SOURCE_PATH)/$(FRAMEWORK_CLASS_FOLDERNAME)/$(FRAMEWORK_NAMESPACE)/locale/translation

FRAMEWORK_TOOL_PATH = $(FRAMEWORK_PATH)/tool


#
# Framework URIs
#
FRAMEWORK_URI = $(QOOXDOO_URI)/frontend/framework
FRAMEWORK_SOURCE_URI = $(FRAMEWORK_URI)/source
FRAMEWORK_CLDR_DOWNLOAD_URI = http://unicode.org/cldr/data/common/main


#
# Configure commands
#
CMD_LINE = echo "----------------------------------------------------------------------------"
CMD_NICE = nice -n 10
CMD_PYTHON = $(CMD_NICE) python
CMD_GENERATOR = $(CMD_PYTHON) $(FRAMEWORK_TOOL_PATH)/generator.py --cache-directory $(FRAMEWORK_CACHE_PATH)
CMD_CLDR =  $(CMD_PYTHON) $(FRAMEWORK_TOOL_PATH)/modules/cldr.py
CMD_MSGFMT = $(CMD_PYTHON) $(FRAMEWORK_TOOL_PATH)/modules/msgfmt.py
CMD_REMOVE = $(CMD_NICE) rm -rf
CMD_FIND = $(CMD_NICE) find
CMD_ZIP = $(CMD_NICE) zip
CMD_TAR = $(CMD_NICE) tar
CMD_ZIP_CREATE = $(CMD_ZIP) -rq
CMD_TAR_CREATE = $(CMD_TAR) cfzp
CMD_DIR = $(CMD_NICE) mkdir -p
CMD_ANY2DOS = | xargs $(CMD_PYTHON) $(FRAMEWORK_TOOL_PATH)/modules/textutil.py --command any2Dos
CMD_ANY2UNIX = | xargs $(CMD_PYTHON) $(FRAMEWORK_TOOL_PATH)/modules/textutil.py --command any2Unix

# Optimized for remote sync (ssh etc.)
CMD_SYNC_ONLINE = $(CMD_NICE) rsync --checksum --compress --recursive --delete --inplace --links --safe-links --exclude .svn

# Optimized for local sync (same computer, filesystem)
CMD_SYNC_OFFLINE = $(CMD_NICE) rsync --recursive --delete --inplace --links --safe-links --exclude .svn
