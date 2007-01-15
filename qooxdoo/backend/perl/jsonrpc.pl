#!/usr/bin/perl -w

#
# qooxdoo - the new era of web interface development
#
# Copyright:
#   (C) 2006, 2007 by Nick Glencross
#       All rights reserved
#
# License:
#   LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/
#
# Internet:
#   # http://qooxdoo.org
#
# Author:
#   * Nick Glencross
#     nick dot glencross at gmail dot com
#

# This is a simple JSON-RPC server.  We receive a service name in
# dot-separated path format and expect to find the class containing the
# service in a module corresponding to the service name

# This harness script should be run using CGI or preferably mod_perl

use strict;

# Change this space-separated list of directories to include
# Qooxdoo::JSONRPC.pm and co-located Services
use lib qw(/PATH_TO_QOOXDOO/backend/perl);

use Qooxdoo::JSONRPC;

Qooxdoo::JSONRPC::handle_request ();
