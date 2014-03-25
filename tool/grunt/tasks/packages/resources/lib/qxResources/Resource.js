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

/**
 * Resource
 */

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

q.Class.define("qxResources.Resource",
{
  extend: qx.core.Object,

  construct: function(relPath, namespace)
  {
    this.base(arguments);
    this.__relpath = relPath;
    this.__namespace = namespace;
  },

  members:
  {
    __relpath: null,
    __namespace: null,

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

module.exports = qxResources.Resource;
