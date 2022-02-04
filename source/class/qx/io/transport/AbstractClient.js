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
 * This class provides a the base class for all clients that use the
 * transport implementations in this namespace. Since the static method
 * `registerTransport` cannot be inherited by subclasses, they mus proxy it
 * by adding `registerTransport : qx.io.transport.AbstractClient.registerTransport`
 * to their `statics` section.
 *
 */
qx.Class.define("qx.io.transport.AbstractClient", {
  extend: qx.core.Object,
  type: "abstract",

  statics: {
    /**
     * Register a transport class for use with uris that match the given
     * regular expression. The client will use the transport which first
     * matches, starting with the last added transport
     * @param {RegExp} uriRegExp
     *    A regular expression which the URI must match
     * @param {qx.io.transport.ITransport}  transportClass
     *    The qooxdoo class implementing the transport
     */
    registerTransport(uriRegExp, transportClass) {
      if (!this.constructor.__transports) {
        this.constructor.__transports = [];
      }
      if (!qx.lang.Type.isRegExp(uriRegExp)) {
        throw new Error("First argument must be a regular expression!");
      }
      if (
        !qx.Interface.classImplements(
          transportClass,
          qx.io.transport.ITransport
        )
      ) {
        throw new Error(
          "Transport class must implement qx.io.transport.ITransport"
        );
      }
      this.constructor.__transports.push({
        uriRegExp,
        transport: transportClass
      });
    }
  },

  properties: {
    /**
     * The transport object
     */
    transport: {
      check: "qx.io.transport.ITransport"
    }
  },

  members: {
    /**
     * Given a transport object implementing {@link qx.io.transport.ITransport}
     * select that transport; if a string URI is passed, select one that has
     * been registered for that class of URIs.
     * @param {qx.io.transport.ITransport|String} transportOrUri
     * @throws qx.io.exception.Transport
     */
    selectTransport(transportOrUri) {
      let transport;
      let uri;
      if (qx.lang.Type.isString(transportOrUri)) {
        if (!this.constructor.__transports) {
          throw new Error(
            "No transport has been registered. Put @use(qx.io.transport.X) in the doc block of your class, X being the transport class of your choice (such as qx.io.transport.Xhr for http transport)."
          );
        }
        uri = transportOrUri;
        for (let registeredTransport of this.constructor.__transports.reverse()) {
          if (uri.match(registeredTransport.uriRegExp)) {
            // eslint-disable-next-line new-cap
            transport = new registeredTransport.transport(uri);
          }
        }
        if (!transport) {
          throw new qx.io.exception.Transport(
            `No matching transport for URI '${transportOrUri}'`,
            qx.io.exception.Transport.INVALID_URI
          );
        }
      } else {
        if (
          !(transportOrUri instanceof qx.core.Object) ||
          !qx.Interface.classImplements(
            transportOrUri.constructor,
            qx.io.transport.ITransport
          )
        ) {
          throw new Error(
            "Argument must be an qooxdoo object implementing qx.io.transport.ITransport"
          );
        }
        transport = transportOrUri;
      }
      this.setTransport(transport);
    }
  }
});
