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
 * Image
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// native
var fs = require("fs");
var path = require("path");

// qx
var q = require('qooxdoo');

// third party
var imgsize = require('image-size');

//------------------------------------------------------------------------------
// Class
//------------------------------------------------------------------------------

q.Class.define("qxResource.Image",
{
  extend: qx.core.Object,

  construct: function(relImgPath, namespace)
  {
    this.base(arguments);
    this.__relpath = relImgPath;
    this.__namespace = namespace;
  },

  members:
  {
    __relpath: null,
    __dimensions: null,
    __namespace: null,
    __format: null,

    __getFormat: function(imgPath) {
      var ext = path.extname(imgPath);
      return (ext.indexOf('.') === 0) ? ext.substr(1) : ext;
    },

    __getImageSize: function(absImgPath) {
      return imgsize(absImgPath);
    },

    collectInfoAndPopulate: function(imgBasePath) {
      var absImgPath = path.join(imgBasePath, this.__relpath);
      if (!fs.existsSync(absImgPath)) {
        throw new Error("ENOENT: " + absImgPath);
      }

      this.__dimensions = this.__getImageSize(absImgPath);
      this.__format = this.__getFormat(this.__relpath);
    },

    stringify: function() {
      imgEntry = {};
      imgEntry[this.__relpath] = [
        this.__dimensions.width,
        this.__dimensions.height,
        this.__format,
        this.__namespace,
      ];
      return imgEntry;
    }
  }
});

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = qxResource.Image;
