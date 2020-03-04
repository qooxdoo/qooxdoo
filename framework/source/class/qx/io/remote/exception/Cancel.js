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
 *  A class for representing a user-initiated cancellation of a request.
 */
qx.Class.define("qx.io.remote.exception.Cancel",
{
  extend : qx.io.Exception,

  /**
   * Constructor
   * @param message {String}
   * @param data {*|null}
   */
  construct: function( message, data) {
    this.set({
      code: qx.io.remote.RpcError.type.CANCELLED,
      message : message || "Cancelled.",
      data : data || null
    });
  }
});
