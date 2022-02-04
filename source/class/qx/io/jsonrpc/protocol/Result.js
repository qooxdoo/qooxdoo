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
 * A JSON-RPC v2.0 result object, which is a response to a {@link qx.io.jsonrpc.protocol.Request},
 * indicating a successfully processed request.
 *
 * @see https://www.jsonrpc.org/specification#response_object
 */
qx.Class.define("qx.io.jsonrpc.protocol.Result", {
  extend: qx.io.jsonrpc.protocol.Message,
  properties: {
    /**
     * The integer id of the request
     */
    id: {
      check: value =>
        qx.lang.Type.isNumber(value) && parseInt(value, 10) === value
    },

    result: {
      nullable: true
    }
  },

  /**
   * The result messsage constructor
   * @param {Number} id^
   * @param {*} result
   */
  construct(id, result) {
    this.set({ id, result });
  }
});
