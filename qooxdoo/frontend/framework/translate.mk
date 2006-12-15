###################################################################################
# PUBLIC VARIABLES
###################################################################################

QOOXDOO = ../..
APPNAME=qooxdoo

PROJECT_LOCALES=de

###################################################################################
# PRIVATE VARIABLES
###################################################################################

FRONTEND = $(QOOXDOO)/frontend
FRAMEWORK = $(FRONTEND)/framework

LOCALE_NAMESPACE=qx.locale.translation
LOCALE_TARGET_DIRECTORY=source/class/qx/locale/translation
PODIR=source/translation

###################################################################################
# GETTEXT TARGETS
###################################################################################

include $(FRAMEWORK)/tool/make/translate.mk