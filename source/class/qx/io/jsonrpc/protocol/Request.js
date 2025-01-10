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
 * A JSON-RPC v2.0 request object
 *
 * @see https://www.jsonrpc.org/specification#request_object
 */
qx.Class.define("qx.io.jsonrpc.protocol.Request", {
  extend: qx.io.jsonrpc.protocol.Notification,
  statics: {
    /**
     * Static counter for all request ids
     */
    __current_request_id: 0,

    /**
     * Returns the current request id
     * @returns {Number}
     */
    getCurrentId() {
      return qx.io.jsonrpc.protocol.Request.__current_request_id;
    },

    /**
     * Resets the request id to zero
     */
    resetId() {
      qx.io.jsonrpc.protocol.Request.__current_request_id = 0;
    }
  },

  properties: {
    /**
     * The integer id of the request
     */
    id: {
      check: value =>
        qx.lang.Type.isNumber(value) && parseInt(value, 10) === value
    }
  },

  /**
   * JSON-RPC request constructor
   * @param {String} method
   * @param {Array|Object?} params
   * @param {Number?} id
   *    Optional integer id. If not provided, an auto-incremented id will be
   *    used.
   */
  construct(method, params, id) {
    super(method, params);
    if (id === undefined) {
      id = ++qx.io.jsonrpc.protocol.Request.__current_request_id;
    }
    this.set({ id });
    this.__promise = new qx.Promise();
  },

  members: {
    __promise: null,

    /**
     * Getter for promise which resolves with the result to the request, if successful
     * @return {qx.Promise}
     */
    getPromise() {
      return this.__promise;
    },


    /**
     * Determines how an exception during transport is handled. Standard
     * behavior is to reject the request's promise with that exception.
     * Classes inheriting from this class might handle it differently, i.e.
     * by allowing the transport to retry after a timeout occurred.
     * @param {qx.io.exception.Transport} exception
     */
    handleTransportException(exception) {
      this.__promise.reject(exception);
    }
  }
});
