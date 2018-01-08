/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */
const qx = require("qooxdoo"); 
/**
 * Utility methods
 */
qx.Class.define("qxcli.Version", {
  extend: qx.core.Object,
  
  statics: {
    VERSION: null
  },
  
  defer: function(statics) {
    var pkg = require("../../package.json");
    statics.VERSION = pkg.version;
  }
});
