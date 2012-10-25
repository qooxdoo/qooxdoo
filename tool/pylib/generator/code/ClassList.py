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
# One application is to represent the list of all known library classes, and
# for that implements both a local storage and a library lookup in case of
# key misses.
#

class ClassList(object):

    def __init__(self, libraries, init_map=None):
        self._libraries = libraries  # [generator.code.Library()]
        self._classes = init_map or {}
    
    # 'foo' in ClassList
    def __contains__(self, key):
        try:
            self[key]
        except KeyError:
            return False
        return True
   
    # ClassList['foo']
    def __getitem__(self, key):
        if key in self._classes:
            return self._classes[key]
        else:
            clsId, clsPath, library = '', '', ''
            for lib in self._libraries:
                clsId, clsPath = lib.findClass(key)
                if clsId:
                    library = lib
                    break
            if not clsId:
                raise KeyError("Class Id '%s' not found in libraries" % key)
            else:
                clsProps = library.getFileProps(clsId, clsPath)
                clazz, _ = library.makeClassObj(clsId, clsPath, clsProps)
                self._classes[key] = clazz
                return clazz

    # for foo in ClassList
    # - only iterates the current keys of self._classes!
    def __iter__(self):
        for el in self._classes:
            yield el


    def data(self):
        return self._classes

    ##
    # This is a wrapper around Library.findClass around the known libs.
    #
    def findClassInLibs(self, dottedExpr):
        classId = u''
        for lib in self._libraries:
            classId, _ = lib.findClass(dottedExpr)
            if classId:
                break
        return classId


    ##
    # Provide all files in all libs' class paths.
    def classPathIterator(self):
        for lib in self._libraries:
            for fileId in lib.classPathIterator():
                yield fileId
    @staticmethod
    def namespaces_from_classnames(classNames):
        res = []
        for cls in classNames:
            name_parts = cls.split(".")
            if len(name_parts) > 1:
                res.append(".".join(name_parts[:-1]))
        return res
