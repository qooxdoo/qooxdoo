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
 * A generic class for representing exceptions that occur during io operations.
 * If you need a real error object, use the createError() method to create one,
 * which has the instance in the "exception" property, and the class name in the
 * "name" property.
 */
qx.Class.define("qx.io.Exception",
{
  extend : qx.core.Object,
  properties : {
    /**
     * The error code
     */
    code : {
      check : "Number",
      nullable : true
    },

    /**
     * The human-readable error message
     */
    message : {
      check : "String",
      nullable: true

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
      code: code || null,
      message : message || null,
      data : data || null
    });
  },

  members: {
    createError : function() {
      var err = new Error(this.getMessage());
      err.code = this.getCode();
      err.name = this.classname;
      err.exception = this;
      return err;
    }
  }
});
