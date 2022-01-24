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
 * This class provides a simple GraphQl client (https://graphql.org/).
 * For transport, it is based on internally on the fetch API
 * (https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
 * which, if needed, must be directly configured via the `init` parameter of the
 * constructor, until a more generalized qx.io API has been developed.
 * @experimental The API might change. Feedback is appreciated.
 */
qx.Class.define("qx.io.graphql.Client", {
  extend: qx.io.transport.AbstractClient,

  statics: {
    registerTransport: qx.io.transport.AbstractClient.registerTransport
  },

  events: {
    /**
     * Event fired when a request results in an error. Event data is an instance of
     * {@link qx.io.exception.Transport}, {@link qx.io.exception.Protocol},
     * or {@link qx.io.exception.Cancel}.
     */
    error: "qx.event.type.Data"
  },

  /**
   * @param {qx.io.transport.ITransport|String} transportOrUri
   *    Transport object, which must implement {@link qx.io.transport.ITransport}
   *    or a string URI, which will trigger auto-detection of transport, as long as an
   *    appropriate transport has been registered with the static `registerTransport()` function.
   */
  construct(transportOrUri) {
    super();
    this.selectTransport(transportOrUri);
  },

  members: {
    /**
     * Send the given GraphQl query. See https://graphql.org/learn/queries/
     *
     * @param {qx.io.graphql.protocol.Request} request The GraphQl request object.
     * @return {qx.Promise} Promise that resolves with the data
     */
    async send(request) {
      let transport = this.getTransport();
      return new qx.Promise((resolve, reject) => {
        transport.addListenerOnce("message", evt => {
          try {
            if (qx.core.Environment.get("qx.io.graphql.debug")) {
              this.debug("<<< Received: " + evt.getData());
            }
            let responseData = qx.lang.Json.parse(evt.getData());
            let graphQlResponse = new qx.io.graphql.protocol.Response(
              responseData
            );

            if (graphQlResponse.getErrors()) {
              return reject(this._handleErrors(graphQlResponse));
            }
            return resolve(graphQlResponse.getData());
          } catch (e) {
            this.error(e);
            return reject(new qx.io.exception.Transport(e.message));
          }
        });
        if (qx.core.Environment.get("qx.io.graphql.debug")) {
          this.debug(">>>> Sending " + request.toString());
        }
        transport.send(request.toString()).catch(reject);
      });
    },

    /**
     * Handle the errors reported by the GraphQL endpoint. The response
     * can contain several errors, but we can only throw one of them.
     * However, we can fire an event for each error, which might be useful
     * if they are to be logged. The errors that are thrown or fired as
     * event data contain the original response object in the `data` property
     *
     * @param {qx.io.graphql.protocol.Response} response The response object
     * @return {qx.io.exception.Protocol}
     */
    _handleErrors(response) {
      let errors = response.getErrors();
      errors.forEach(error => {
        let exception = new qx.io.exception.Protocol(
          error.message,
          null,
          response.toObject()
        );

        this.fireDataEvent("error", exception);
      });
      return new qx.io.exception.Protocol(
        errors[0].message,
        null,
        response.toObject()
      );
    }
  },

  environment: {
    "qx.io.graphql.debug": false
  }
});
