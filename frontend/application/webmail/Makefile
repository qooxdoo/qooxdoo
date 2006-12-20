####################################################################################
# BASIC SETTINGS
####################################################################################

#
# Location of your qooxdoo distribution
# Could be relative from this location or absolute
#
QOOXDOO_PATH = ../../..

#
# The same as above, but from the webserver point of view
# Starting point is the application HTML file of the source folder.
# In most cases just add a "/.." compared to above
#
QOOXDOO_URI = ../../../..

#
# Namespace of your application e.g. custom
#
APPLICATION_NAMESPACE = webmail

#
# Titles used in your API viewer and during the build process
#
APPLICATION_MAKE_TITLE = WEBMAIL
APPLICATION_API_TITLE = WebMail

#
# Additional files (space separated list)
#
APPLICATION_FILES = index.html





####################################################################################
# ADVANCED SETTINGS
####################################################################################

#
# Enable resource filtering in API viewer
#
APPLICATION_RESOURCE_FILTER = true

#
# We don't need the full source code
#
APPLICATION_COMPLETE_SOURCE = false

#
# Disable line breaks
#
APPLICATION_LINEBREAKS_BUILD = false
APPLICATION_LINEBREAKS_SOURCE = false

#
# qooxdoo.org sync
#
APPLICATION_PUBLISH_PATH = root@qooxdoo.org:/var/www/qooxdoo/demo/$(APPLICATION_NAMESPACE)





####################################################################################
# INCLUDE CORE
####################################################################################

include $(QOOXDOO_PATH)/frontend/framework/tool/make/targets.mk
include $(QOOXDOO_PATH)/frontend/framework/tool/make/project.mk
