/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (cboulanger)

************************************************************************ */

/**
 * A generic class for representing errors and exceptions that occur during io. The
 * difference to javascript error objects is that a stack trace is
 * unnecessary since the error originates outside of the execution context.
 */
qx.Class.define("qx.io.Exception",
{
  extend : qx.core.Object,
  properties : {
    /**
     * The error code
     */
    code : {
      check : "Number"
    },

    /**
     * The human-readable error message
     */
    message : {
      check : "String"
    },

    /**
     * Optional diagnostic data
     */
    data : {
      nullable: true
    }
  },

  /**
   * Constructor
   * @param code {Number}
   * @param message {String}
   * @param data {*|null}
   */
  construct: function(code, message, data) {
    this.set({
      code: code,
      message : message,
      data : data || null
    });
  }
});
