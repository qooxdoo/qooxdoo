#
# Downloads locale data files from the Common Locale Data repository (cldr)
# and converts it to qooxdoo JavaScript locale files.
#
# Don't include this file using 'include'
# rather call if using '$(MAKE) -C PATH_TO_MAKEFILE -f cldr.mk
#

QOOXDOO_PATH=../../../..

# May be overwritten in the calling Makefile
PROJECT_LOCALES=de de_AT zh en en_US fr es ar

JS_CLDR_LOCALE_DIR=$(QOOXDOO_PATH)/frontend/framework/source/class/qx/locale/data
CLDR_CACHE_DIR=$(QOOXDOO_PATH)/frontend/.cache

CLDR_CVS=http://unicode.org/cldr/data/common/main

JS_CLDR_FILES := $(PROJECT_LOCALES:%=$(JS_CLDR_LOCALE_DIR)/%.js)
CLDR_XML_FILES := $(PROJECT_LOCALES:%=$(CLDR_CACHE_DIR)/%.xml)

EXTRACT_CLDR=$(QOOXDOO_PATH)/frontend/framework/tool/cldr/extract_cldr.py
WGET=wget

all: $(JS_CLDR_FILES) $(CLDR_XML_FILES) $(EXTRACT_CLDR)

%.js: $(JS_CLDR_LOCALE_DIR) $(CLDR_XML_FILES)
	@python $(EXTRACT_CLDR) -o $(JS_CLDR_LOCALE_DIR) $(CLDR_CACHE_DIR)/`basename $@ | sed s/.js/.xml/`
	
%.xml:
	@mkdir -p $(CLDR_CACHE_DIR)
	@$(WGET) http://unicode.org/cldr/data/common/main/`basename $@` -nv -P $(CLDR_CACHE_DIR)
	
clean:
	rm -rf $(CLDR_XML_FILES)
	rm -rf $(CLDR_CACHE_DIR)