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
 * This class provides a JSON-RPC client object with auto-configuration of the
 * transport used (based on the URI passed).
 */
qx.Class.define("qx.io.jsonrpc.Client", {
  extend: qx.io.transport.AbstractClient,

  statics: {
    // statics are not inherited from parent class
    registerTransport: qx.io.transport.AbstractClient.registerTransport
  },

  events: {
    /**
     * Event fired before a request message is sent to the server.
     * Event data is the {@link qx.io.jsonrpc.protocol.Message} to
     * be sent. This also allows listeners to configure the transport
     * object beforehand.
     */
    outgoingRequest: "qx.event.type.Data",

    /**
     * Event fired when a request results in an error. Event data is an instance of
     * {@link qx.io.exception.Transport}, {@link qx.io.exception.Protocol},
     * or {@link qx.io.exception.Cancel}.
     * Event fired when a message is received from the endpoint. Event data
     * is an UTF-8 encoded string
     */
    error: "qx.event.type.Data",

    /**
     * Event fired when a peer-originated JSON-RPC message has been
     * received from the peer endpoint. Event data is an instance of {@link
     * qx.io.jsonrpc.message.Batch}, {@link qx.io.jsonrpc.message.Request}
     * or {@link qx.io.jsonrpc.protocol.Notification}.
     */
    incomingRequest: "qx.event.type.Data"
  },

  /**
   * @param {qx.io.transport.ITransport|String} transportOrUri
   *    Transport object, which must implement {@link qx.io.transport.ITransport}
   *    or a string URI, which will trigger auto-detection of transport, as long as an
   *    appropriate transport has been registered with the static `registerTransport()` function.
   * @param {String?} methodPrefix
   *    Optional service name which will be prepended to the method
   * @param {qx.io.jsonrpc.protocol.Parser?} parser
   *    Optional parser object, which needs to be an instance of a subclass of {@link qx.io.jsonrpc.protocol.Parser}
   */
  construct(transportOrUri, methodPrefix, parser) {
    super();
    this.selectTransport(transportOrUri);
    // listen for incoming messages
    this.getTransport().addListener("message", evt =>
      this.handleIncoming(evt.getData())
    );

    if (!methodPrefix) {
      methodPrefix = "";
    }
    this.setMethodPrefix(methodPrefix);
    if (!parser) {
      parser = new qx.io.jsonrpc.protocol.Parser();
    }
    this.setParser(parser);
    this.__requests = [];
  },

  properties: {
    /**
     * An optional string which is prepended to the method name by the {@link #sendRequest}
     * and {@link #sendNotification} methods
     */
    methodPrefix: {
      check: "String",
      nullable: true
    },

    /**
     * The parser object, which must be a subclass of {@link qx.io.jsonrpc.protocol.Parser}
     */
    parser: {
      check: "qx.io.jsonrpc.protocol.Parser"
    }
  },

  members: {
    /**
     * A cache of the requests which have been sent out and are still pending
     */
    __requests: null,

    /**
     * If a service name has been configured, prepend it to the method name,
     * unless it has already been prefixed
     * @param {String} method
     * @return {String}
     * @private
     */
    _prependMethodPrefix(method) {
      qx.core.Assert.assertString(method);
      let methodPrefix = this.getMethodPrefix();
      if (methodPrefix && !method.startsWith(methodPrefix)) {
        return `${methodPrefix}${method}`;
      }
      return method;
    },

    /**
     * Fires "error" event and throws the error after informing pending requests
     * about the error.
     * @param exception
     * @private
     */
    _throwTransportException(exception) {
      this.fireDataEvent("error", exception);
      this.__requests.forEach(request => {
        if (request instanceof qx.io.jsonrpc.protocol.Request) {
          request.handleTransportException(exception);
        }
      });
      throw exception;
    },

    /**
     * Send the given JSON-RPC message object using the configured transport
     *
     * @param {qx.io.jsonrpc.protocol.Message|qx.io.jsonrpc.protocol.Batch} message
     * @return {qx.Promise} Promise that resolves (with no data)
     * when the message has been successfully sent out, and rejects
     * when there is an error or a cancellation up to that point.
     */
    async send(message) {
      if (
        !(
          message instanceof qx.io.jsonrpc.protocol.Message ||
          message instanceof qx.io.jsonrpc.protocol.Batch
        )
      ) {
        throw new Error(
          "Argument must be instanceof qx.io.jsonrpc.protocol.Message or qx.io.jsonrpc.protocol.Batch"
        );
      }

      // filter by type
      let messages =
        message instanceof qx.io.jsonrpc.protocol.Batch
          ? message.getBatch().toArray()
          : [message];
      let requests = messages.filter(
        message => message instanceof qx.io.jsonrpc.protocol.Request
      );

      // store requests
      requests.forEach(request => {
        let id = request.getId();
        if (this.__requests[id] !== undefined) {
          throw new qx.io.exception.Transport(
            `Request ID ${id} is already in use`,
            qx.io.exception.Transport.INVALID_ID,
            { request: message.toObject() }
          );
        }
        this.__requests[id] = request;
      });

      // inform listeners
      this.fireDataEvent("outgoingRequest", message);

      // debugging
      if (qx.core.Environment.get("qx.io.jsonrpc.debug")) {
        this.debug(">>> Outgoing json-rpc message: " + message);
      }

      // send it async, using transport-specific implementation
      return this.getTransport().send(message.toString());
    },

    /**
     * Sends a single JSON-RPC request. If a method prefix name has been configured,
     * it will be prepended to the method name.
     * @param {String} method
     * @param {Array|Object?} params
     * @return {qx.Promise} Promise that resolves with the result to that request,
     * and rejects with an exception in the {@link qx.io.jsonrpc.exception} namespace.
     */
    async sendRequest(method, params) {
      const request = new qx.io.jsonrpc.protocol.Request(
        this._prependMethodPrefix(method),
        params
      );

      await this.send(request);
      return await request.getPromise();
    },

    /**
     * Sends a single JSON-RPC notification. Will use the method prefix
     * @param {String} method
     * @param {Array|Object?} params
     * @return {qx.Promise} Promise that resolves immediately, (i.e. when the
     * notification has been sent out (which is synchronous)
     */
    async sendNotification(method, params) {
      const notification = new qx.io.jsonrpc.protocol.Notification(
        this._prependMethodPrefix(method),
        params
      );

      await this.send(notification);
    },

    /**
     * Send the given message batch. Will use the method prefix.
     * @param {qx.io.jsonrpc.protocol.Batch} batch
     * @return {qx.Promise} Promise that resolves with an array of the responses
     * to all requests in the batch, or rejects with any error that occurs.
     */
    async sendBatch(batch) {
      qx.core.Assert.assertInstance(batch, qx.io.jsonrpc.protocol.Batch);
      if (this.getMethodPrefix()) {
        batch
          .getBatch()
          .forEach(message =>
            message.setMethod(this._prependMethodPrefix(message.getMethod()))
          );
      }
      await this.send(batch);
      return await qx.Promise.all(batch.getPromises());
    },

    /**
     * Receives and handles an incoming JSON-RPC compliant message data
     * @param {String} json JSON data
     */
    handleIncoming(json) {
      if (qx.core.Environment.get("qx.io.jsonrpc.debug")) {
        this.debug("<<< Incoming json-rpc message: " + json);
      }
      let message;
      try {
        message = this.getParser().parse(json);
        // act on each message
        this.handleMessage(message);
      } catch (e) {
        this._throwTransportException(e);
      } finally {
        // cleanup
        if (message instanceof qx.io.jsonrpc.protocol.Batch) {
          message.getBatch().forEach(msg => this._cleanup(msg));
        } else if (message instanceof qx.io.jsonrpc.protocol.Message) {
          this._cleanup(message);
        }
      }
    },

    /**
     * Clean up after a message has been received
     * @param {qx.io.jsonrpc.protocol.Message} message
     * @private
     */
    _cleanup(message) {
      message.dispose();
    },

    /**
     * Handle an incoming message or batch of messages
     * @param {qx.io.jsonrpc.protocol.Message|qx.io.jsonrpc.protocol.Batch} message Message or Batch
     */
    handleMessage(message) {
      // handle batches
      if (message instanceof qx.io.jsonrpc.protocol.Batch) {
        message.getBatch().forEach(msg => this.handleMessage(msg));
        return;
      }
      // handle individual message
      qx.core.Assert.assertInstance(message, qx.io.jsonrpc.protocol.Message);
      let request;
      let id;
      if (
        message instanceof qx.io.jsonrpc.protocol.Result ||
        message instanceof qx.io.jsonrpc.protocol.Error
      ) {
        // handle results and errors, which are responses to sent requests
        id = message.getId();
        request = this.__requests[id];
        if (request === undefined) {
          // no request with this id exists
          throw new qx.io.exception.Transport(
            `Invalid jsonrpc response data: Unknown id ${id}.`,
            qx.io.exception.Transport.UNKNOWN_ID,
            message.toObject()
          );
        }
        if (request === true) {
          // the request has already been responded to
          throw new qx.io.exception.Transport(
            `Invalid jsonrpc response data: multiple responses with same id ${id}.`,
            qx.io.exception.Transport.DUPLICATE_ID,
            message.toObject()
          );
        }
      }
      // handle the different message types
      if (message instanceof qx.io.jsonrpc.protocol.Result) {
        // resolve the individual promise
        request.getPromise().resolve(message.getResult());
      } else if (message instanceof qx.io.jsonrpc.protocol.Error) {
        let error = message.getError();
        let ex = new qx.io.exception.Protocol(
          error.message,
          error.code,
          message.toObject()
        );

        // inform listeners
        this.fireDataEvent("error", ex);
        // reject the individual promise
        request.getPromise().reject(ex);
      } else if (
        message instanceof qx.io.jsonrpc.protocol.Request ||
        message instanceof qx.io.jsonrpc.protocol.Notification
      ) {
        // handle peer-originated requests and notifications
        this.fireDataEvent("incomingRequest", message);
      } else {
        throw new Error("Unhandled message:" + message.toString());
      }
      // mark request as handled (and remove reference so it can be gc'ed)
      this.__requests[id] = true;
    }
  },

  environment: {
    "qx.io.jsonrpc.debug": false
  }
});
