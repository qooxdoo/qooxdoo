/**
 * The implementation of a HTTP Transport using the Fetch API,
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
 */
qx.Class.define("qx.io.transport.Fetch", {
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
     * @type {Object}
     */
    __tranportImpl: null,

    /**
     * Returns the object which implements the transport on the
     * underlying level, so that transport-specific configuration
     * can be done on it. In the case of the Fetch API, the
     * "implementation" is a configuration object which will be
     * passed to the `fetch` method as second parameter.
     *
     * @return {Object}
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
      let init = this.getTransportImpl();
      init.body = message;
      let response;
      try {
        response = await fetch(this.getEndpoint(), init);
      } catch (e) {
        throw new qx.io.exception.Transport(e.message, e.code);
      }
      if (!response.ok) {
        switch (response.status) {
          case 400:
            // "400 Bad Request" is a really a protocol error (syntax error)
            break;
          default:
            throw new qx.io.exception.Transport(
              response.statusText,
              response.status
            );
        }
      }
      let responseData = await response.text();
      // notify listeners
      this.fireDataEvent("message", responseData);
    },

    /**
     * Factory method to create a request object. In this implementation,
     * it returns an object that will be used as the `init` parameter of the
     * fetch method.
     * @return {Object}
     */
    _createTransportImpl() {
      let init = {};
      init.headers = {
        "Content-Type": "application/json",
        Accept: "application/json"
      };

      init.method = "POST";
      return init;
    }
  },

  defer() {
    qx.io.graphql.Client.registerTransport(/^http/, qx.io.transport.Fetch);
  }
});
