#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Andreas Ecker (ecker)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# This is a currently unused module, as a first step in replacing bin/migrator.py
##

import re, os, sys, shutil, logging, optparse


LOGFILE = "migration.log"

MIGRATION_ORDER = [
    "0.5.2",
    "0.6",
    "0.6.1",
    "0.6.2",
    "0.6.3",
    "0.6.4",
    "0.6.5",
    "0.6.6",
    "0.6.7",    
    "0.7-beta1",
    "0.7-beta2",
    "0.7-beta3",
    "0.7",
    "0.7.1",
    "0.7.2"
]


LOGGING_READY = False

class Migrator(object):

    pass
    # TODO: Port most of bin/migrator.py into this class, and make migrator.py
    # a shallow front-end to it. 