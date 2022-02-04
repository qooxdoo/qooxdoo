/**
 * An implementation of a PostMessage transport
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 * The transport is special isasmuch it is not used with an URI, but with the
 * target Window or Worker object with acts as the endpoint of the message.
 */
qx.Class.define("qx.io.transport.PostMessage", {
  extend: qx.io.transport.AbstractTransport,
  implement: [qx.io.transport.ITransport],

  /**
   * Constructor.
   *
   * @param {Window|Worker} windowOrWorker The target Window or Worker instance
   * which is the endpoint for the request
   */
  construct(windowOrWorker) {
    windowOrWorker.addEventListener("message", evt => {
      this.fireDataEvent("message", evt.data);
    });
    super(windowOrWorker);
  },

  members: {
    /**
     * PostMessage is a very simple protocol without configuration options.
     * No transport implementation is needed.
     * @return {null}
     */
    getTransportImpl() {
      return null;
    },

    /**
     * Transport the given message to the endpoint
     *
     * @param {String} message
     *
     * @return {qx.Promise} Promise that resolves (with no data)
     * when the message has been successfully sent out, and rejects
     * when there is an error or a cancellation up to that point.
     * @ignore(fetch)
     */
    async send(message) {
      qx.core.Assert.assertString(message);
      this.getEndpoint().postMessage(message);
    },

    /**
     * Empty stub since no transport implementation is needed.
     */
    _createTransportImpl() {}
  }
});
