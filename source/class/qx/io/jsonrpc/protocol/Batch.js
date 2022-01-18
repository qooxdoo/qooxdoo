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
 * An object representing a JSON-RPC v2.0 batch message object. You can add
 * one or more of the following message objects to the batch:
 *  - {@link qx.io.jsonrpc.protocol.Request}
 *  - {@link qx.io.jsonrpc.protocol.Notification}
 *  - {@link qx.io.jsonrpc.protocol.Result}
 *  - {@link qx.io.jsonrpc.protocol.Error}
 *  @see https://www.jsonrpc.org/specification#batch
 */
qx.Class.define("qx.io.jsonrpc.protocol.Batch", {
  extend: qx.core.Object,
  properties: {
    batch: {
      check: "qx.data.Array"
    }
  },

  construct() {
    super();
    this.setBatch(new qx.data.Array());
  },
  members: {
    /**
     * Adds a request or notification to the batch
     * @param {qx.io.jsonrpc.protocol.Message} message
     * @return {qx.io.jsonrpc.protocol.Batch}
     */
    add(message) {
      qx.core.Assert.assertInstance(message, qx.io.jsonrpc.protocol.Message);
      this.getBatch().push(message);
      // return the instance for chaining
      return this;
    },

    /**
     * Adds a request to the batch
     * @param method
     * @param params
     */
    addRequest(method, params) {
      this.add(new qx.io.jsonrpc.protocol.Request(method, params));
      return this;
    },

    /**
     * Adds a notification to the batch
     * @param method
     * @param params
     */
    addNotification(method, params) {
      this.add(new qx.io.jsonrpc.protocol.Notification(method, params));
      return this;
    },

    /**
     * Returns an array of the promises of the requests in the batch
     * @return {qx.Promise[]}
     */
    getPromises() {
      return this.getBatch().map(message => message.getPromise());
    },

    /**
     * Returns the message as a native object
     * @return {*}
     */
    toObject() {
      return this.getBatch()
        .toArray()
        .map(message => message.toObject());
    },

    /**
     * Returns the message as a JSON string
     * @return {String}
     */
    toString() {
      return JSON.stringify(
        this.getBatch()
          .toArray()
          .map(message => message.toObject())
      );
    }
  }
});
