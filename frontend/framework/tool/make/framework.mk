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
CMD_PYTHON = python
CMD_NICE = nice -n $(COMPUTED_COMMON_NICE)
CMD_GENERATOR = $(CMD_NICE) $(CMD_PYTHON) $(FRAMEWORK_PATH)/tool/generator.py --cache-directory $(FRAMEWORK_CACHE_PATH)
CMD_CLDR = $(CMD_NICE) $(CMD_PYTHON) $(FRAMEWORK_PATH)/tool/modules/cldr.py 
CMD_MSGFMT = $(CMD_NICE) $(CMD_PYTHON) $(FRAMEWORK_PATH)/tool/modules/msgfmt.py
CMD_REMOVE = $(CMD_NICE) rm -rf
CMD_FIND = $(CMD_NICE) find 
CMD_SYNC = $(CMD_NICE) rsync --checksum --recursive --links --safe-links --delete --compress
CMD_LINE = echo "----------------------------------------------------------------------------"
