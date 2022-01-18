/**
 * The implementation of a HTTP Transport using the {@link qx.io.request} API,
 * so any special configuration of the HTTP request must be done on the
 * underlying implementation of {@link qx.io.request.AbstractRequest}.
 *
 * The assumption is that the payload will be JSON in both request and response.
 * If that is not what you want, override the {@link #_createTransportImpl()} method.
 *
 */
qx.Class.define("qx.io.transport.Xhr", {
  extend: qx.io.transport.AbstractTransport,
  implement: qx.io.transport.ITransport,

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
     * Internal implementation of the transport
     * @var {qx.io.request.Xhr}
     */
    __tranportImpl: null,

    /**
     * Returns the object which implements the transport on the
     * underlying level, so that transport-specific configuration
     * can be done on it. Note that since in the HTTP transport,
     * this object cannot be reused, it will return a new object
     * each time which will be used in the immediately next request.
     *
     * @return {qx.io.request.Xhr}
     */
    getTransportImpl() {
      this.__tranportImpl = this._createTransportImpl();
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
     */
    async send(message) {
      qx.core.Assert.assertString(message);
      const req = this.__tranportImpl || this.getTransportImpl();
      req.setRequestData(message);
      this.__tranportImpl = null; // free the internal reference for the next request
      try {
        await req.sendWithPromise();
      } catch (e) {
        if (e instanceof qx.type.BaseError) {
          switch (e.getComment()) {
            case "timeout":
              throw new qx.io.exception.Transport(
                e.toString(),
                qx.io.exception.Transport.TIMEOUT,
                { message }
              );

            case "parseError":
              throw new qx.io.exception.Transport(
                e.toString(),
                qx.io.exception.Transport.INVALID_MSG_DATA,
                { message }
              );

            case "abort":
              throw new qx.io.exception.Cancel(e.toString(), { message });

            case "statusError":
              if (req.getStatus() === 400) {
                // "400 Bad Request" is a really a protocol error (syntax error)
                break;
              }
            // fallthrough
            case "error":
              throw new qx.io.exception.Transport(
                e.toString(),
                qx.io.exception.Transport.FAILED,
                {
                  message,
                  response: req.getResponse()
                }
              );

            default:
              // unknown error
              throw new qx.io.exception.Exception(e.toString(), undefined, {
                message,
                error: e
              });
          }
        }
      }
      // notify listeners
      this.fireDataEvent("message", req.getResponse());
      // discard old object
      req.dispose();
    },

    /**
     * Factory method to create a request object. By default, a POST
     * request will be made, and the expected response type will be
     * "application/json", but differently to the standard behavior,
     * the response will not be parsed into a javascript object.
     *
     * Classes extending this one may override this method to obtain
     * a Request object with different parameters and/or different
     * authentication settings. The object must be a subclass of {@link
     * qx.io.request.AbstractRequest} or implement its public API.
     *
     * @return {qx.io.request.Xhr}
     */
    _createTransportImpl() {
      const req = new qx.io.request.Xhr(this.getEndpoint(), "POST");
      req.setAccept("application/json");
      req.setCache(false);
      req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      // disable parsing, we are going to parse the JSON ourselves
      req.setParser(response => response);
      return req;
    }
  },

  defer() {
    qx.io.jsonrpc.Client.registerTransport(/^http/, qx.io.transport.Xhr);
  }
});
