/**
 * An implementation of a WebSocket transport
 * @see https://developer.mozilla.org/de/docs/Web/API/WebSocket
 * @ignore(WebSocket)
 */
qx.Class.define("qx.io.transport.Websocket", {
  extend: qx.io.transport.AbstractTransport,
  implement: [qx.io.transport.ITransport],

  /**
   * Constructor.
   *
   * @param {String} url The URL of the http endpoint
   */
  construct(url) {
    super(url);
  },

  members: {
    /**
     * @type {WebSocket}
     */
    __tranportImpl: null,

    /**
     * Returns the object which implements the transport on the
     * underlying level, so that transport-specific configuration
     * can be done on it.
     *
     * @return {WebSocket}
     */
    getTransportImpl() {
      if (!this.__tranportImpl) {
        this.__tranportImpl = this._createTransportImpl();
      }
      return this.__tranportImpl;
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
      let ws = this.getTransportImpl();
      if (ws.readyState !== WebSocket.OPEN) {
        await new Promise(resolve => ws.addEventListener("open", resolve));
      }
      ws.send(message);
    },

    /**
     * Factory method to create a websocket object.
     * @return {WebSocket}
     */
    _createTransportImpl() {
      let ws = new WebSocket(this.getEndpoint());
      ws.addEventListener("message", msgevt => {
        this.fireDataEvent("message", msgevt.data);
      });
      ws.addEventListener("close", event => {
        let error_message;
        let error_code;
        switch (event.code) {
          case 1000:
            // everything ok
            break;
          default:
            // todo translate websocket error codes into qx.io.exception.Transport error codes
            // see https://github.com/Luka967/websocket-close-codes
            error_message = "Error " + event.code;
            error_code = qx.io.exception.Transport.FAILED;
        }

        if (error_message) {
          throw new qx.io.exception.Transport(error_message, error_code, event);
        }
      });
      return ws;
    }
  },

  destruct() {
    this.__tranportImpl.close();
    this.__tranportImpl = null;
  },

  defer() {
    qx.io.graphql.Client.registerTransport(/^ws/, qx.io.transport.Websocket);
  }
});
