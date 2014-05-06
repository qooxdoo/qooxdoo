/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

// qooxdoo code isn't strict-compliant yet
// 'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// native
var fs = require("fs");
var path = require("path");

// qx
var q = require('qooxdoo');

//------------------------------------------------------------------------------
// Class
//------------------------------------------------------------------------------

q.Class.define("qxResource.Resource",
{
  extend: qx.core.Object,

  /**
   * Represents a physical resource file.
   *
   * @constructs qxResource.Resource
   * @param {string} relPath - rel path to resource
   * @param {string} namespace - namespace the resource is associated with
   */
  construct: function(relPath, namespace)
  {
    this.base(arguments);
    this.__relpath = relPath;
    this.__namespace = namespace;
  },

  /** @lends qxResource.Resource.prototype */
  members:
  {
    /** @type {string} */
    __relpath: null,
    /** @type {string} */
    __namespace: null,

    /**
     * Stringifies the resource.
     *
     * @returns {Object} resMap - <code>{myRelPathToRes: 'myNamespace'}</code>
     */
    stringify: function() {
      resEntry = {};
      resEntry[this.__relpath] = this.__namespace;
      return resEntry;
    }
  }
});

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = qxResource.Resource;
