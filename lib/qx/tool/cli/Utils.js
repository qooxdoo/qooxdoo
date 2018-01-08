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
qx.Class.define("qxcli.Utils", {
  extend: qx.core.Object,
  
  statics: {
    /**
     * Creates a Promise which can be resolved/rejected externally - it has
     * the resolve/reject methods as properties
     * 
     * @return {Promise}
     */
    newExternalPromise: function() {
      var resolve, reject;
      var promise = new Promise((resolve_, reject_) => {
        resolve = resolve_;
        reject = reject_;
      });
      promise.resolve = resolve;
      promise.reject = reject;
      return promise;
    },

    /**
     * Error that can be thrown to indicate wrong user input  and which doesn't 
     * need a stack trace
     * @param {string} message
     * @return {Error}
     */
    UserError : function(message) {
      var error = new Error(message);
      error.name = 'UserError';
      error.stack = null;
      return error;
    }
  }
});
