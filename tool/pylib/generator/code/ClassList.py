#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2012 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# A class representing a list of qooxdoo classes.
#

class ClassList(object):

    @staticmethod
    def namespaces_from_classnames(classNames):
        res = []
        for cls in classNames:
            name_parts = cls.split(".")
            if len(name_parts) > 1:
                res.append(".".join(name_parts[:-1]))
        return res
