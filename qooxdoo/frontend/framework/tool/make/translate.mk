###################################################################################
# GETTEXT TARGETS
###################################################################################

ifndef QOOXDOO
	QOOXDOO = ../../..
endif

ifndef APPNAME
	APPNAME=feedreader
endif

ifndef PROJECT_LOCALES
	PROJECT_LOCALES=de
endif

ifndef JS_SOURCE_DIR
	JS_SOURCE_DIR=source/class/
endif

ifndef LOCALE_NAMESPACE
	LOCALE_NAMESPACE=$(APPNAME).translation
endif

ifndef LOCALE_TARGET_DIRECTORY
	LOCALE_TARGET_DIRECTORY=$(JS_SOURCE_DIR)/$(APPNAME)/translation
endif

ifndef PODIR
	PODIR=source/translation
endif

FRONTEND = $(QOOXDOO)/frontend
FRAMEWORK = $(FRONTEND)/framework
QXMSGFMT= $(FRAMEWORK)/tool/qxmsgfmt.py

TRANSLATIONS := $(PROJECT_LOCALES:%=$(PODIR)/%.po)


all: translation

force-build:
	@#dummy dependency to force rebuilding the target

$(PODIR)/$(APPNAME).pot: force-build
	@echo
	@echo "  EXTRACT TRANSLATION STRINGS"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Extracting translation ..."
	@rm -f $(PODIR)/$(APPNAME).pot
	@touch $(PODIR)/$(APPNAME).pot
	@find $(JS_SOURCE_DIR) -name '*.js' | xargs xgettext --language=Java --from-code=UTF-8 \
	  -kthis.trc -kthis.tr -kthis.marktr -kthis.trn:1,2 \
	  -kManager.trc -kManager.tr -kManager.marktr -kManager.trn:1,2 \
	  -j -o $(PODIR)/$(APPNAME).pot 2> /dev/null

%.po: $(PODIR)/$(APPNAME).pot
	@echo "  * Updating translation catalog " $@
	@if test ! -f $@; then msginit --no-translator -i $(PODIR)/$(APPNAME).pot -o $@; fi
	@msgmerge --update -q $@ $(PODIR)/$(APPNAME).pot

translation: $(TRANSLATIONS)
	@echo "  * Compiling catalogs ..."
	@mkdir -p $(LOCALE_TARGET_DIRECTORY)
	@find $(PODIR) -name '*.po' | xargs python $(QXMSGFMT) --namespace=$(LOCALE_NAMESPACE) -d $(LOCALE_TARGET_DIRECTORY)

