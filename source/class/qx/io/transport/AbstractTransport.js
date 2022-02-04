/**
 * Abstract class for JSON-RPC transports
 *
 * For the moment, any special configuration of the transport, such as
 * authentication, must be done on the level of the underlying implementation,
 * an abstract API will be added later.
 */
qx.Class.define("qx.io.transport.AbstractTransport", {
  extend: qx.core.Object,
  type: "abstract",

  properties: {
    /**
     *  A representation of the the endpoint, which is either a uri (a String)
     *  or an object (such as in the case of the PostMessage transport)
     */
    endpoint: {
      check: v => typeof v == "string" || typeof v == "object",
      nullable: true,
      event: "changeEndpoint"
    }
  },

  events: {
    /**
     * Event fired when a message is received from the endpoint. Event data
     * is an UTF-8 encoded string
     */
    message: "qx.event.type.Data"
  },

  /**
   * Constructor
   * @param {String|Object} endpoint
   */
  construct(endpoint) {
    super();
    this.setEndpoint(endpoint);
  }
});
