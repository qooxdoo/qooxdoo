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
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# NAME
#  Manifest  -- class that represents a Manifest.json file, with operations
#
##

import os, sys, re, types, string, copy, codecs
from collections import defaultdict
from misc import json
from generator.config.ConfigurationError import ConfigurationError


class Manifest(object):
    def __init__(self, path):
        self.path = path
        try:
            mf = codecs.open(path, "r", "utf-8")
            manifest = json.loads(mf.read())
            mf.close()
        except Exception, e:
            msg = "Reading of manifest file failed: '%s'" % path + (
                "\n%s" % e.args[0] if e.args else "")
            e.args = (msg,) + e.args[1:]
            raise
        self._manifest = manifest
        self.libinfo     = self._manifest['info']
        self.libprovides = self._manifest['provides']

        self.namespace   = self.libprovides['namespace']
        self.encoding    = self.libprovides['encoding']
        # make the others optional
        self.classpath   = self.libprovides['class'] if 'class' in self.libprovides else None
        self.translation = self.libprovides['translation'] if 'translation' in self.libprovides else None
        self.resource    = self.libprovides['resource'] if 'resource' in self.libprovides else None
        self.type        = self.libprovides['type'] if 'type' in self.libprovides else None


    def patchLibEntry(self, libentry):
        '''Patches a "library" entry with the information from Manifest'''
        libinfo       = self._manifest['info']
        libprovides   = self._manifest['provides']
        #uriprefix = libentry['uri']
        uriprefix = ""
        libentry['class']         = os.path.join(uriprefix,libprovides['class'])
        libentry['resource']      = os.path.join(uriprefix,libprovides['resource'])
        libentry['translation']   = os.path.join(uriprefix,libprovides['translation'])
        if 'translation' in libprovides:
            libentry['translation']   = os.path.join(uriprefix,libprovides['translation'])
        libentry['encoding']    = libprovides['encoding']
        if 'namespace' in libentry:
            if libentry['namespace'] != libprovides['namespace']:
                raise ConfigurationError("Mismatch between Manifest namespace and directory namespaces")
        else:
            libentry['namespace']   = libprovides['namespace']
        libentry['type']        = libprovides['type']
        libentry['path']        = os.path.dirname(libentry['manifest']) or '.'

        # from the 'info' section
        if 'version' in libinfo:
            libentry['version'] = libinfo['version']
        if 'qooxdoo-versions' in libinfo:
            libentry['qooxdoo-versions'] = libinfo['qooxdoo-versions']
        if 'sourceViewUri' in libinfo:
            libentry['sourceViewUri'] = libinfo['sourceViewUri']

        return libentry

    def validateAgainst(self, schema):
        """Validates catalog entry via JSON Schema. The expected_author param
        will prevent entry overrides from others than the original author.

        .. seealso:: http://json-schema.org/
        .. seealso:: http://tools.ietf.org/html/draft-zyp-json-schema-03
        .. seealso:: https://github.com/json-schema/json-schema
        """
        from jsonschema.jsonschema import Draft3Validator

        errors = []
        validator = Draft3Validator(schema)

        for e in validator.iter_errors(self._manifest):
            e.path.reverse()
            errors.append({"msg": e.message[1:], "path": e.path})

        return errors

    @classmethod
    def schema_v1_0(self):
        """Catalog entry schema for catalog v1.0.
        """
        patterns = {
            "semver": r"^latest$|^\d+\.\d+(\.\d+)?(?:-[0-9]+-?)?(?:[-a-zA-Z+][-a-zA-Z0-9\.:-]*)?$",
            "url": r"^https?://?([\da-z\.-]+)\.([a-z\.]{2,6})[\/\w \.-]*\/?$",
            "archive_url": r"^(https?|ftp)://.*(tar.(gz|bz2)|zip)$",
            "name_and_github_uid": r"^.*\([A-Za-z0-9]+\)$",
        }

        return {
            "$schema": "http://json-schema.org/draft-03/schema#",
            "name": "contribCatalog entry",
            "type": "object",
            "properties": {
                "info": {
                    "type": "object",
                    "required": True,
                    "properties": {
                        "name": {
                            "type": "string",
                            "required": True
                        },
                        "summary": {
                            "type": "string"
                        },
                        "description": {
                            "type": "string",
                            "required": True
                        },
                        "category": {
                            "type": "string",
                            "required": True,
                            "enum": ["Themes", "Widgets", "Drawing", "Misc", "Tool", "Backend"]
                        },
                        "keywords": {
                            "type": "array",
                            "uniqueItems": True,
                            "items": {
                                "type": "string"
                            },
                        },
                        "homepage": {
                            "type": "string",
                            "required": True,
                            "pattern": patterns["url"]
                        },
                        "license": {
                            "type": "string",
                            "required": True,
                        },
                        "authors": {
                            "type": "array",
                            "required": True,
                            "minItems": 1,
                            "uniqueItems": True,
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string",
                                        "pattern": patterns["name_and_github_uid"]
                                    },
                                    "email": {
                                        "type": "string",
                                        "required": True
                                    }
                                }
                            }
                        },
                        "download": {
                            "type": "string",
                            "required": True,
                            "pattern": patterns["archive_url"]
                        },
                        "version": {
                            "type": "string",
                            "required": True,
                            "pattern": patterns["semver"]
                        },
                        "qooxdoo-versions": {
                            "type": "array",
                            "required": True,
                            "minItems": 1,
                            "uniqueItems": True,
                            "items": {
                                "type": "string",
                                "minItems": 1,
                                "pattern": patterns["semver"],
                            },
                        },
                        "sourceViewUri": {
                            "type": "string",
                            "pattern": patterns["url"]
                        }
                    }
                },
                "provides": {
                    "type": "object",
                    "required": True,
                    "properties": {
                        "namespace": {
                            "type": "string",
                            "required": True,
                        },
                        "encoding": {
                            "type": "string",
                            "required": True,
                        },
                        "class": {
                            "type": "string",
                            "required": True,
                        },
                        "resource": {
                            "type": "string",
                            "required": True,
                        },
                        "translation": {
                            "type": "string",
                            "required": True,
                        },
                        "type": {
                            "type": "string",
                            "required": True,
                            "enum": ["library", "application"]
                        }
                    }
                }
            }
        }
