###################################################################################
# GETTEXT TARGETS
###################################################################################

force-build:
	@#dummy dependency to force rebuilding the target

$(PODIR)/$(APPNAME).pot: force-build
	@echo
	@echo "  EXTRACT TRANSLATION STRINGS"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Extracting translation ..."
	@rm -f $(PODIR)/$(APPNAME).pot
	@touch $(PODIR)/$(APPNAME).pot
	@find source/class/ -name '*.js' | xargs xgettext --language=Java --from-code=UTF-8 -kthis.trc -kthis.tr -kthis.marktr -kthis.trn:1,2 -j -o $(PODIR)/$(APPNAME).pot

%.po: $(PODIR)/$(APPNAME).pot
	@echo "  * Updating translation catalog " $@
	@if test ! -f $@; then msginit --no-translator -i $(PODIR)/$(APPNAME).pot -o $@; fi
	@msgmerge --update -q $@ $(PODIR)/$(APPNAME).pot

translation: $(TRANSLATIONS)
	@echo "  * Compiling catalogs ..."
	@mkdir -p $(LOCALE_TARGET_DIRECTORY)
	@find $(PODIR) -name '*.po' | xargs python $(QXMSGFMT) --namespace=$(LOCALE_NAMESPACE) -d $(LOCALE_TARGET_DIRECTORY)

