#!/usr/bin/perl -w

# qooxdoo - the new era of web development
#
# http://qooxdoo.org
#
# Copyright:
#   2006-2007 Nick Glencross
#
# License:
#   LGPL: http://www.gnu.org/licenses/lgpl.html
#   EPL: http://www.eclipse.org/org/documents/epl-v10.php
#   See the LICENSE file in the project's top-level directory for details.
#
# Authors:
#  * Nick Glencross

# This is a simple JSON-RPC server.  We receive a service name in
# dot-separated path format and expect to find the class containing the
# service in a module corresponding to the service name

# This harness script should be run using CGI or preferably mod_perl

use strict;

use CGI;
use CGI::Session;

use vars qw($cgi $session);

# Change this space-separated list of directories to include
# Qooxdoo::JSONRPC.pm and co-located Services
use lib qw(/PATH_TO_QOOXDOO/backend/perl);

# If this module can't be found, the previous line is incorrect
use Qooxdoo::JSONRPC;

# Instantiating the CGI module which parses the HTTP request

$cgi     = new CGI;
$session = new CGI::Session;

# You can customise this harness here to handle cases before treating
# the request as being JSON-RPC

Qooxdoo::JSONRPC::handle_request ($cgi, $session);
