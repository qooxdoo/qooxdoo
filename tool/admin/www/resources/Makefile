QOOXDOO_PATH = ../../../..
SPHINX_THEME = _theme.indigo

css: less/*.less
	lessc less/base.less stylesheets/base.css
	lessc less/layout.less stylesheets/layout.css
	lessc less/pages.less stylesheets/pages.css
	lessc less/reset.less stylesheets/reset.css

# the next is more of a note, to keep things in mind
manual: css
	@cp -R fonts $(QOOXDOO_PATH)/documentation/manual/source/$(SPHINX_THEME)
	@cp stylesheets/* $(QOOXDOO_PATH)/documentation/manual/source/$(SPHINX_THEME)/copies
	@cp javascripts/* $(QOOXDOO_PATH)/documentation/manual/source/$(SPHINX_THEME)/copies
