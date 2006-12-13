###################################################################################
# COMMANDS
###################################################################################

#
# Command definitions
#

qx-build: info-build exec-script-build exec-files-build
qx-source: info-source exec-script-source
qx-api: info-api exec-api-build exec-api-data exec-files-api
qx-all: qx-source qx-build qx-api
qx-pretty: info-pretty exec-pretty
qx-fix: info-fix exec-fix
qx-help: info-help
qx-clean: info-clean exec-clean
qx-realclean: info-realclean exec-realclean
qx-distclean: info-distclean exec-distclean
