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
     * Which Promise constructor to use. Defaults to `qx.Promise
     * Will switch to the native `Promise` for qooxdoo 8.0
     */
    __Promise_constructor: qx.Promise,

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
    },

    /**
     * The default Promise constructor used in qx 7 is qx.Promise. Unfortunately,
     * it has a bug/incompatibiity that leads to uncaught promise rejection errors
     * Use call this static method to use the native Promise object instead. This
     * will be the default in qooxdoo 8.0, when this function will we deprecated.
     */
    useNativePromise() {
      qx.io.jsonrpc.protocol.Request.__Promise_constructor = Promise;
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
    const PromiseConstructor =
      qx.io.jsonrpc.protocol.Request.__Promise_constructor;
    this.__promise = new PromiseConstructor((resolve, reject) => {
      this.__promiseResolver = resolve;
      this.__promiseRejector = reject;
    });
  },

  members: {
    __promise: null,
    __promiseResolver: null,
    __promiseRejector: null,

    /**
     * Getter for promise which resolves with the result to the request, if successful
     * @return {qx.Promise}
     */
    getPromise() {
      return this.__promise;
    },

    /**
     * Resolves this request's Promise externally with a value
     * @param {*} value
     */
    resolve(value) {
      this.__promiseResolver(value);
    },

    /**
     * Rejects this request's Promise externally with an error object
     * @param {*} error
     */
    reject(error) {
      this.__promiseRejector(error);
    },

    /**
     * Determines how an exception during transport is handled. Standard
     * behavior is to reject the request's promise with that exception.
     * Classes inheriting from this class might handle it differently, i.e.
     * by allowing the transport to retry after a timeout occurred.
     * @param {qx.io.exception.Transport} exception
     */
    handleTransportException(exception) {
      this.__promiseRejector(exception);
    }
  }
});
