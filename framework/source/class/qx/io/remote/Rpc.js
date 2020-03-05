/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2006 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Andreas Junghans (lucidcake)
     * Derrell Lipman (derrell)
     * Christian Boulanger (cboulanger)

************************************************************************ */

/**
 * Provides a Remote Procedure Call (RPC) version 2 implementation.
 * See https://www.jsonrpc.org/specification
 *
 * Each instance of this class represents a "Service". These services can
 * correspond to various concepts on the server side (depending on the
 * programming language/environment being used).
 *
 * When calling a server-side method, the parameters and return values are
 * converted automatically to and from their JSON representation.
 *
 * Server-initiated calls
 *
 * Because of the client-server architecture of HTTP, which we use here, the
 * bidirectional (peer-to-peer), real-time character of JSONRPC v2 cannot
 * be fully implemented. Instead, any server-initiated remote procedure
 * calls "piggy-back" on the responses to  client-initialed calls. If
 * you want to continually listen to server calls, you must use polling
 * or a different implementation. Server calls are only supported by the
 * following API methods: {@link qx.io.remote.Rpc#addRequest}, {@link
 * qx.io.remote.Rpc#addNotification}, and {@link qx.io.remote.Rpc#send}.
 * When they are received, they dispatch the "request" event.
 *
 * JSONRPC v2 batch mode
 *
 * Batched requests and responses are also only supported by
 * {@link qx.io.remote.Rpc#addRequest},
 * {@link qx.io.remote.Rpc#addNotification}, and {@link qx.io.remote.Rpc#send}.
 *
 * Legacy support
 *
 * {@link qx.io.remote.Rpc#callAsync} and {@link
 * qx.io.remote.Rpc#callAsyncListeners} support the JSONRPC v1
 * standard without batch mode, but with support for cross-domain
 * calls via script transport. Note that you cannot mix the
 * two APIs because the JSONRPC ids are computed differently.
 *
 * The implementation also provides legacy support for a
 * non-standard implementation of JSONRPC v1, which is declared
 * deprecated in v6.0.0 and will be removed in v7.0.0.
 *
 * @ignore(qx.core.ServerSettings.*)
*/

qx.Class.define("qx.io.remote.Rpc",
{
  extend : qx.core.Object,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param url {String}
   *  identifies the url where the service is found.  Note that if the url is
   *   to
   *  a domain (server) other than where the qooxdoo script came from, i.e. it
   *  is cross-domain, then you must also call the setCrossDomain(true) method
   *   to enable the ScriptTransport instead of the XmlHttpTransport, since the
   *   latter can not handle cross-domain requests. Alternatively, configure
   *   your server to support cross-origin requests (see
   *   https://developer.mozilla.org/de/docs/Web/HTTP/CORS)
   *
   * @param serviceName {String}
   *  identifies the service (dependent on the server implementation).
   */
  construct : function(url, serviceName) {
    this.base(arguments);

    if (url !== undefined) {
      this.setUrl(url);
    }

    if (serviceName != null) {
      this.setServiceName(serviceName);
    }

    this.__requestQueue = [];

    if (qx.core.ServerSettings) {
      this.__currentServerSuffix = qx.core.ServerSettings.serverPathSuffix;
    }
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired when call is completed
     */
    "completed" : "qx.event.type.Event",

    /**
     * Fired when call aborted.
     */
    "aborted" : "qx.event.type.Event",

    /**
     * Fired when call failed during transport or on the server
     */
    "failed" : "qx.event.type.Event",

    /**
     * Fired when call timed out.
     */
    "timeout" : "qx.event.type.Event",

    /**
     * Fired with the response when the request completed successfully
     * (addRequest(), addNotification() and send() only)
     */
    "success" : "qx.event.type.Data",

    /**
     * Fired with the error object when the server returns an error object
     * (addRequest(), addNotification() and send() only)
     */
    "error" : "qx.event.type.Data",

    /**
     * Fired for each jsonrpc request or notification received from the peer
     * (JSONRPC v2.0) (addRequest(), addNotification() and send() only)
     */
    "request" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /**
     * id for JSONRPC v2 requests. Not the same as the sequence number of the
     * request!
     * @var Number
     */
    __requestId : 0,


    /**
     * Origins of errors
     * @deprecated since 6.0.0, will be removed in 7.0.0
     */
    origin :
    {
      server      : 1,
      application : 2,
      transport   : 3,
      local       : 4
    },


    /**
     *  Locally-detected errors
     *  @deprecated since 6.0.0, will be removed in 7.0.0
     */
    localError :
    {
      timeout : 1,
      abort   : 2,
      nodata  : 3
    },


    /**
     * Boolean flag which controls the stringification of date objects.
     * <code>null</code> for the default behavior, acts like false
     * <code>true</code> for stringifying dates the old, qooxdoo specific way
     * <code>false</code> using the native toJSON of date objects.
     *
     * When enabled, dates are converted to and parsed from
     * a literal that complies to the format
     *
     * <code>new Date(Date.UTC(year,month,day,hour,min,sec,ms))</code>
     *
     * The server can fairly easily parse this in its JSON
     * implementation by stripping off "new Date(Date.UTC("
     * from the beginning of the string, and "))" from the
     * end of the string. What remains is the set of
     * comma-separated date components, which are also very
     * easy to parse.
     *
     * The work-around compensates for the fact that while the
     * Date object is a primitive type in Javascript, the
     * specification neglects to provide a literal form for it.
     *
     * This only works if the protocol property is set to "qx1".
     * @deprecated since 6.0.0, will be removed in 7.0.0
     */
    CONVERT_DATES : null,


    /**
     * Boolean flag which controls whether to expect and verify a JSON
     * response.
     *
     * Should be <code>true</code> when backend returns valid JSON.
     *
     * Date literals are parsed when CONVERT_DATES is <code>true</code>
     * and comply to the format
     *
     * <code>"new Date(Date.UTC(year,month,day,hour,min,sec,ms))"</code>
     *
     * Note the surrounding quotes that encode the literal as string.
     *
     * Using valid JSON is recommended, because it allows to use
     * {@link qx.lang.Json#parse} for parsing. {@link qx.lang.Json#parse}
     * is preferred over the potentially insecure <code>eval</code>.
     *
     * This only works if the protocol property is set to "qx1"
     * @deprecated since 6.0.0, will be removed in 7.0.0
     */
    RESPONSE_JSON : null,


    /**
     * Creates an URL for talking to a local service. A local service is one
     * that lives in the same application as the page calling the service. For
     * backends that don't support this auto-generation, this method returns
     * null.
     *
     * @param instanceId {String ? null} an optional identifier for the
     *  server side instance that should be used. All calls to the same service
     *  with the same instance id are routed to the same object instance
     *  on the server. The instance id can also be used to provide additional
     *  data for the service instantiation on the server.
     * @return {String} the url.
     * @deprecated since 6.0.0, will be removed in 7.0.0
     */
    makeServerURL : function(instanceId) {
      var retVal = null;

      // legacy support for non-standard implementation
      if (qx.core.ServerSettings) {
        retVal =
          qx.core.ServerSettings.serverPathPrefix +
          "/.qxrpc" +
          qx.core.ServerSettings.serverPathSuffix;

        if (instanceId != null) {
          retVal += "?instanceId=" + instanceId;
        }
      }

      return retVal;
    },

    /**
     * Returns the current jsonrpc request id, which is unique among all
     * instances
     * @return {number}
     */
    getRequestId : function() {
      return qx.io.remote.Rpc.__requestId;
    },

    /**
     * Resets the request id
     */
    reset : function() {
      qx.io.remote.Rpc.__requestId = 0;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** The timeout for asynchronous calls in milliseconds. */
    timeout :
    {
      check : "Integer",
      nullable : true
    },


    /**
     * Indicate that the request is cross domain.
     *
     * A request is cross domain if the request's URL points to a host other
     * than the local host. This switches the concrete implementation that is
     * used for sending the request from qx.io.remote.transport.XmlHttp to
     * qx.io.remote.transport.Script because only the latter can handle cross
     * domain requests.
     * @deprecated since 6.0.0
     */
    crossDomain :
    {
      check : "Boolean",
      init : false
    },


    /** The URL at which the service is located. */
    url :
    {
      check : "String",
      nullable : true
    },


    /** The service name.  */
    serviceName :
    {
      check : "String",
      nullable : true
    },


    /**
     * Data sent as "out of band" data in the request to the server.  The
     * format of the data is opaque to RPC and may be recognized only by
     * particular servers It is up to the server to decide what to do with
     * it: whether to ignore it, handle it locally before calling the
     * specified method, or pass it on to the method.  This server data is
     * not sent to the server if it has been set to 'null'.
     * Part of the non-standard qooxdoo v1 implementation to support legacy
     * applications. Can be ignored in normal circumstances.
     * @deprecated since 6.0.0, will be removed in 7.0.0
     */
    serverData :
    {
      check : "Object",
      nullable : true
    },


    /**
     * Username to use for HTTP authentication. Null if HTTP authentication
     * is not used.
     * @deprecated since 6.0.0 Use {@link qx.io.remote.Rpc#authentication}
     *   instead
     */
    username :
    {
      check : "String",
      nullable : true
    },


    /**
     * Password to use for HTTP authentication. Null if HTTP authentication
     * is not used.
     * @deprecated since 6.0.0 Use {@link qx.io.remote.Rpc#authentication}
     *   instead
     */
    password :
    {
      check : "String",
      nullable : true
    },


    /**
     * Use Basic HTTP Authentication
     * @deprecated since 6.0.0 Use {@link qx.io.remote.Rpc#authentication}
     *   instead
    */
    useBasicHttpAuth :
    {
      check : "Boolean",
      nullable : true
    },

    /**
     * Whether to use the original qooxdoo RPC protocol or the
     * now-standardized Version 2 protocol.  Defaults to v2.0,
     * but the legacy protocol can be activated for legacy applications.
     * Valid values are "qx1" and "2.0".
     */
    protocol :
    {
      init : "2.0",
      check : function(val) {
       return val == "qx1" || val == "2.0";
      }
    },

    /**
     * The authentication method.  Can be any class implementing
     * {@link qx.io.request.authentication.IAuthentication} such as
     * {@qx.io.request.authentication.Basic} or
     * {@link qx.io.request.authentication.Bearer}
     */
    authentication:
    {
      check: "qx.io.request.authentication.IAuthentication",
      nullable: true
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {


    __previousServerSuffix : null,
    __currentServerSuffix : null,

    /**
     * Buffers batched requests until they are sent
     * @var Array
     */
    __requestQueue : null,


    /**
     * Factory method to create a request object. By default, a POST request
     * will be made, and the expected response type will be
     * "application/json". Classes extending this one may override this method
     * to obtain a Request object with different parameters.
     *
     * @return {qx.io.remote.Request}
     */
    createRequest: function() {
      return new qx.io.remote.Request(this.getUrl(),
                                "POST",
                                "application/json");
    },

    /**
     * Factory method to create the object containing the remote procedure
     * call data. By default, a qooxdoo-style RPC request is built, which
     * contains the following members: "service", "method", "id", and
     * "params". If a different style of RPC request is desired, a class
     * extending this one may override this method.
     *
     * @param id {Integer|null|undefined}
     *   The unique sequence number of this request or undefined if the request
     *   is a notification
     *
     * @param method {String}
     *   The name of the method to be called
     *
     * @param parameters {Array|undefined}
     *   An array containing the arguments to the called method.
     *
     * @param serverData {var|undefined}
     *   "Out-of-band" data to be provided to the server. Part of the
     *   non-standard jsonrpc v1 implementation. Deprecated.
     *
     * @return {Object}
     *   The object to be converted to JSON and passed to the JSON-RPC
     *   server.
     */
    createRpcData: function(id, method, parameters, serverData) {
      var requestObject;
      var service;

      // Create a protocol-dependent request object
      if (this.getProtocol() == "qx1") {
        // Create a qooxdoo-modified version 1.0 rpc data object
        requestObject =
          {
            "service" :
              method == "refreshSession" ? null : this.getServiceName(),
            "method"  : method,
            "id"      : id,
            "params"  : parameters
          };

        // Only add the server_data member if there is actually server data
        if (serverData) {
          requestObject.server_data = serverData;
        }
      } else {
        // JSONRPC v2
        // If there's a service name, we'll prepend it to the method name
        service = this.getServiceName();
        if (service && service != "") {
          service += ".";
        } else {
          service = "";
        }

        // Create a standard version 2.0 rpc data object
        // method and jsonrpc are mandatory
        requestObject = {
          "jsonrpc" : "2.0",
          "method"  : service + method
        };
        // parameters are optional according to the spec
        if (parameters) {
          if (qx.lang.Type.isObject(parameters) || qx.lang.Type.isArray(parameters)) {
            requestObject["params"] = parameters
          } else {
            throw new Error("Parameters must be type Array (positional) or Object (named)");
          }
        }
        // id: null is allowed but discouraged
        if (id || id === null) {
          if (typeof id == "string" || typeof id == "number" || id === null) {
            requestObject["id"] = id;
          } else {
            throw new Error("ID must be string or number");
          }
        }
      }
      return requestObject;
    },


    /**
     * Internal RPC call method
     *
     * @lint ignoreDeprecated(eval)
     *
     * @param args {Array}
     *   array of arguments
     *
     * @param callType {Integer}
     *   0 = sync,
     *   1 = async with handler,
     *   2 = async event listeners
     *
     * @param refreshSession {Boolean}
     *   whether a new session should be requested
     *
     * @return {var} the method call reference.
     * @throws {Error} An error.
     */
    _callInternal : function(args, callType, refreshSession) {
      var self = this;
      var offset = (callType == 0 ? 0 : 1);
      var whichMethod = (refreshSession ? "refreshSession" : args[offset]);
      var handler = args[0];
      var argsArray = [];
      var eventTarget = this;
      var protocol = this.getProtocol();

      for (var i=offset+1; i<args.length; ++i) {
        argsArray.push(args[i]);
      }

      var req = this.createRequest();

      // Get any additional out-of-band data to be sent to the server
      var serverData = this.getServerData();

      // Create the request object
      var rpcData = this.createRpcData(req.getSequenceNumber(),
                                       whichMethod,
                                       argsArray,
                                       serverData);

      req.setCrossDomain(this.getCrossDomain());

      // deprecated
      if (this.getUsername()) {
        req.setUseBasicHttpAuth(this.getUseBasicHttpAuth());
        req.setUsername(this.getUsername());
        req.setPassword(this.getPassword());
      }

      // set authentication headers
      if (this.getAuthentication()) {
        this.getAuthentication().getAuthHeaders().forEach(function(header) {
          req.setRequestHeader(header.key, header.value);
        });
      }

      req.setTimeout(this.getTimeout());
      var ex = null;
      var id = null;
      var result = null;
      var response = null;

      var handleRequestFinished = function(eventType, eventTarget) {
        switch (callType) {
          case 0: // sync
            break;

          case 1: // async with handler function
            try {
              handler(result, ex, id);
            } catch (e) {
              eventTarget.error(
                "rpc handler threw an error:" +
                  " id=" + id +
                  " result=" + qx.lang.Json.stringify(result) +
                  " ex=" + qx.lang.Json.stringify(ex),
                e);
            }
            break;

          case 2: // async with event listeners
            // Dispatch the event to our listeners.
            if (!ex) {
              eventTarget.fireDataEvent(eventType, response);
            } else {
              // Add the id to the exception
              ex.id = id;

              if (args[0]) // coalesce
              {
                // They requested that we coalesce all failure types to
                // "failed"
                eventTarget.fireDataEvent("failed", ex);
              } else {
                // No coalesce so use original event type
                eventTarget.fireDataEvent(eventType, ex);
              }
            }
          case 3:
        }
      };

      var addToStringToObject = function(obj) {
        if (protocol == "qx1") {
          obj.toString = function() {
            switch (obj.origin) {
              case qx.io.remote.Rpc.origin.server:
                return "Server error " + obj.code + ": " + obj.message;

              case qx.io.remote.Rpc.origin.application:
                return "Application error " + obj.code + ": " + obj.message;

              case qx.io.remote.Rpc.origin.transport:
                return "Transport error " + obj.code + ": " + obj.message;

              case qx.io.remote.Rpc.origin.local:
                return "Local error " + obj.code + ": " + obj.message;

              default:
                return ("UNEXPECTED origin " + obj.origin +
                        " error " + obj.code + ": " + obj.message);
            }
          };
        } else // protocol == "2.0"
        {
          obj.toString = function() {
            var ret;

            ret = "Error " + obj.code + ": " + obj.message;
            if (obj.data) {
              ret += " (" + obj.data + ")";
            }

            return ret;
          };
        }
      };

      var makeException = function(origin, code, message) {
        var ex = new Object();

        if (protocol == "qx1") {
          ex.origin = origin;
        }
        ex.code = code;
        ex.message = message;
        addToStringToObject(ex);

        return ex;
      };

      req.addListener("failed", function(evt) {
        var code = evt.getStatusCode();
        ex = makeException(qx.io.remote.Rpc.origin.transport,
                           code,
                           qx.io.remote.Exchange.statusCodeToString(code));
        id = this.getSequenceNumber();
        handleRequestFinished("failed", eventTarget);
      });

      req.addListener("timeout", function(evt) {
        this.debug("TIMEOUT OCCURRED");
        ex = makeException(qx.io.remote.Rpc.origin.local,
                           qx.io.remote.Rpc.localError.timeout,
                           "Local time-out expired for "+ whichMethod);
        id = this.getSequenceNumber();
        handleRequestFinished("timeout", eventTarget);
      });

      req.addListener("aborted", function(evt) {
        ex = makeException(qx.io.remote.Rpc.origin.local,
                           qx.io.remote.Rpc.localError.abort,
                           "Aborted " + whichMethod);
        id = this.getSequenceNumber();
        handleRequestFinished("aborted", eventTarget);
      });

      req.addListener("completed", function(evt) {
        response = evt.getContent();

        // server may have reset, giving us no data on our requests
        if (response === null) {
          ex = makeException(qx.io.remote.Rpc.origin.local,
                             qx.io.remote.Rpc.localError.nodata,
                             "No data in response to " + whichMethod);
          id = this.getSequenceNumber();
          handleRequestFinished("failed", eventTarget);
          return;
        }

        // Parse. Skip when response is already an object
        // because the script transport was used.
        if (!qx.lang.Type.isObject(response)) {
          // Handle converted dates. Deprecated.
          if (protocol === "qx1" && self._isConvertDates()) {
            // Parse as JSON and revive date literals
            if (self._isResponseJson()) {
              response = qx.lang.Json.parse(response, function(key, value) {
                if (value && typeof value === "string") {
                  if (value.indexOf("new Date(Date.UTC(") >= 0) {
                    var m = value.match(/new Date\(Date.UTC\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)\)/);
                    return new Date(Date.UTC(m[1], m[2], m[3], m[4], m[5], m[6], m[7]));
                  }
                }
                return value;
              });

            // Eval
            } else {
              response = response && response.length > 0 ? eval("(" + response + ")") : null;
            }

          // No special date handling required, JSON assumed
          } else {
            response = qx.lang.Json.parse(response);
          }
        }

        id = response["id"];

        if (id != this.getSequenceNumber()) {
          this.warn("Received id (" + id + ") does not match requested id " +
                    "(" + this.getSequenceNumber() + ")!");
        }

        // Determine if an error was returned. Assume no error, initially.
        var eventType = "completed";
        var exTest = response["error"];

        if (exTest != null) {
          // There was an error
          result = null;
          addToStringToObject(exTest);
          ex = exTest;

          // Change the event type
          eventType = "failed";
        } else {
          result = response["result"];

          if (refreshSession) {
            result = eval("(" + result + ")");
            var newSuffix = qx.core.ServerSettings.serverPathSuffix;

            if (self.__currentServerSuffix != newSuffix) {
              self.__previousServerSuffix = self.__currentServerSuffix;
              self.__currentServerSuffix = newSuffix;
            }

            self.setUrl(self.fixUrl(self.getUrl()));
          }
        }

        handleRequestFinished(eventType, eventTarget);
      });

      // Provide a replacer when convert dates is enabled
      var replacer = null;
      if (protocol === "qx1" && this._isConvertDates()) {
        replacer = function(key, value) {
          // The value passed in is of type string, because the Date's
          // toJson gets applied before. Get value from containing object.
          value = this[key];

          if (qx.lang.Type.isDate(value)) {
            var dateParams =
              value.getUTCFullYear() + "," +
              value.getUTCMonth() + "," +
              value.getUTCDate() + "," +
              value.getUTCHours() + "," +
              value.getUTCMinutes() + "," +
              value.getUTCSeconds() + "," +
              value.getUTCMilliseconds();
            return "new Date(Date.UTC(" + dateParams + "))";
          }
          return value;
        };
      }

      req.setData(qx.lang.Json.stringify(rpcData, replacer));
      req.setAsynchronous(callType > 0);

      if (req.getCrossDomain()) {
        // Our choice here has no effect anyway.  This is purely informational.
        req.setRequestHeader("Content-Type",
                             "application/x-www-form-urlencoded");
      } else {
        // When not cross-domain, set type to text/json
        req.setRequestHeader("Content-Type", "application/json");
      }

      // Do not parse as JSON. Later done conditionally.
      req.setParseJson(false);

      req.send();

      if (callType == 0) {
        if (ex != null) {
          var error = new Error(ex.toString());
          error.rpcdetails = ex;
          throw error;
        }

        return result;
      }

        return req;
    },


    /**
     * Helper method to rewrite a URL with a stale session id (so that it
     * includes the correct session id afterwards).
     *
     * @param url {String} the URL to examine.
     * @return {String} the (possibly re-written) URL.
     * @deprecated deprecated since v6.0.0, will be removed in 7.0.0
     */
    fixUrl : function(url) {
      if (this.__previousServerSuffix == null ||
          this.__currentServerSuffix == null ||
          this.__previousServerSuffix == "" ||
          this.__previousServerSuffix == this.__currentServerSuffix) {
        return url;
      }

      var index = url.indexOf(this.__previousServerSuffix);

      if (index == -1) {
        return url;
      }

      return (url.substring(0, index) +
              this.__currentServerSuffix +
              url.substring(index + this.__previousServerSuffix.length));
    },


    /**
     * Makes a synchronous server call. The method arguments (if any) follow
     * after the method name (as normal JavaScript arguments, separated by
     * commas, not as an array).
     *
     * If a problem occurs when making the call, an exception is thrown.
     *
     *
     * WARNING.  With some browsers, the synchronous interface
     * causes the browser to hang while awaiting a response!  If the server
     * decides to pause for a minute or two, your browser may do nothing
     * (including refreshing following window changes) until the response is
     * received.  Instead, use the asynchronous interface.
     *
     *
     * YOU HAVE BEEN WARNED.
     *
     *
     * @param methodName {String} the name of the method to call.
     * @param args {Array} an array of values passed through to the backend.
     * @return {var} the result returned by the server.
     * @deprecated deprecated since v6.0.0, will be removed in 7.0.0
     */
    callSync : function(methodName, args) {
      return this._callInternal(arguments, 0);
    },


    /**
     * Makes an asynchronous server call. The method arguments (if any) follow
     * after the method name (as normal JavaScript arguments, separated by
     * commas, not as an array).
     *
     * When an answer from the server arrives, the <code>handler</code>
     * function is called with the result of the call as the first, an
     * exception as the second parameter, and the id (aka sequence number) of
     * the invoking request as the third parameter. If the call was
     * successful, the second parameter is <code>null</code>. If there was a
     * problem, the second parameter contains an exception, and the first one
     * is <code>null</code>.
     *
     *
     * The return value of this method is a call reference that you can store
     * if you want to abort the request later on. This value should be treated
     * as opaque and can change completely in the future! The only thing you
     * can rely on is that the <code>abort</code> method will accept this
     * reference and that you can retrieve the sequence number of the request
     * by invoking the getSequenceNumber() method (see below).
     *
     *
     * If a specific method is being called, asynchronously, a number of times
     * in succession, the getSequenceNumber() method may be used to
     * disambiguate which request a response corresponds to.  The sequence
     * number value is a value which increments with each request.)
     *
     * It is recommended to use {@link qx.io.remote.Rpc#addRequest} and
     *  {@link qx.io.remote.Rpc#addNotification} instead.
     *
     * @param handler {Function} the callback function.
     * @param methodName {String} the name of the method to call.
     * @param args {Array} an array of values passed through to the backend.
     * @return {var} the method call reference.
     */
    callAsync : function(handler, methodName, args) {
      return this._callInternal(arguments, 1);
    },


    /**
     * Makes an asynchronous server call and dispatches an event upon
     * completion
     * or failure. The method arguments (if any) follow after the method name
     * (as normal JavaScript arguments, separated by commas, not as an array).
     *
     * When an answer from the server arrives (or fails to arrive on time), if
     * an exception occurred, a "failed", "timeout" or "aborted" event, as
     * appropriate, is dispatched to any waiting event listeners.  If no
     * exception occurred, a "completed" event is dispatched.
     *
     *
     * When a "failed", "timeout" or "aborted" event is dispatched, the event
     * data contains an object with the properties 'origin', 'code', 'message'
     * and 'id'.  The object has a toString() function which may be called to
     * convert the exception to a string.
     *
     *
     * When a "completed" event is dispatched, the event data contains a
     * map with the JSON-RPC sequence number and result:
     * <p>
     * {
     *   id: rpc_id,
     *   result: json-rpc result
     * }
     *
     *
     * The return value of this method is a call reference that you can store
     * if you want to abort the request later on. This value should be treated
     * as opaque and can change completely in the future! The only thing you
     * can rely on is that the <code>abort</code> method will accept this
     * reference and that you can retrieve the sequence number of the request
     * by invoking the getSequenceNumber() method (see below).
     *
     *
     * If a specific method is being called, asynchronously, a number of times
     * in succession, the getSequenceNumber() method may be used to
     * disambiguate which request a response corresponds to.  The sequence
     * number value is a value which increments with each request.)
     *
     * It is recommended to use {@link qx.io.remote.Rpc#addRequest} and
     *  {@link qx.io.remote.Rpc#addNotification} instead.
     *
     * @param coalesce {Boolean} coalesce all failure types ("failed",
     *   "timeout", and "aborted") to "failed". This is reasonable in many
     *   cases, as the provided exception contains adequate disambiguating
     *   information.
     * @param methodName {String} the name of the method to call.
     * @param args {Array} an array of values passed through to the backend.
     * @return {var} the method call reference.
     */
    callAsyncListeners : function(coalesce, methodName, args) {
      return this._callInternal(arguments, 2);
    },


    /**
     * Refreshes a server session by retrieving the session id again from the
     * server.
     *
     * The specified handler function is called when the refresh is
     * complete. The first parameter can be <code>true</code> (indicating that
     * a refresh either wasn't necessary at this time or it was successful) or
     * <code>false</code> (indicating that a refresh would have been necessary
     * but can't be performed because the server backend doesn't support
     * it). If there is a non-null second parameter, it's an exception
     * indicating that there was an error when refreshing the session.
     *
     *
     * @param handler {Function} a callback function that is called when the
     *                           refresh is complete (or failed).
     *
     * @deprecated since v6.0.0
     */
    refreshSession : function(handler) {
      if (qx.core.ServerSettings &&
          qx.core.ServerSettings.serverPathSuffix) {
        var timeDiff =
          (new Date()).getTime() - qx.core.ServerSettings.lastSessionRefresh;

        if (timeDiff / 1000 >
            (qx.core.ServerSettings.sessionTimeoutInSeconds - 30)) {
          // this.info("refreshing session");
          this._callInternal([ handler ], 1, true);
        } else {
          handler(true); // session refresh was OK (in this case: not needed)
        }
      } else {
        handler(false); // no refresh possible, but would be necessary
      }
    },


    /**
     * Whether to convert date objects to pseudo literals and
     * parse with eval.
     *
     * Controlled by {@link #CONVERT_DATES}.
     *
     * @return {Boolean} Whether to convert.
     */
    _isConvertDates: function() {
      return Boolean(qx.io.remote.Rpc.CONVERT_DATES);
    },


    /**
     * Whether to expect and verify a JSON response.
     *
     * Controlled by {@link #RESPONSE_JSON}.
     *
     * @return {Boolean} Whether to expect JSON.
     */
    _isResponseJson: function() {
      return Boolean(qx.io.remote.Rpc.RESPONSE_JSON);
    },


    /**
     * Aborts an asynchronous server call. Consequently, the callback function
     * provided to <code>callAsync</code> or <code>callAsyncListeners</code>
     * will be called with an exception.
     *
     * @param opaqueCallRef {var} the call reference as returned by
     *                            <code>callAsync</code> or
     *                            <code>callAsyncListeners</code>
     */
    abort : function(opaqueCallRef) {
      opaqueCallRef.abort();
    },

    /**
     * Add a JSONRPC v2.0 compliant request to the request queue. Returns a
     * promise that resolves if the request is successful and rejects with an
     * error that has an "exception" property which is an instance of {@link
     * qx.io.remote.RpcException} or {@link qx.io.remote.exception.Transport}.
     * If the request is a notification, it returns null.
     *
     * The request is sent to the server (together with all other queued
     * requests) using
     * {@link qx.io.remote.Rpc#send}.
     *
     * @param {String} method
     * @param {Array|undefined|null} params
     * @param {Boolean|undefined} isNotification True if the jsonrpc call is a
     *   notification
     * @return {qx.Promise|null}
     */
    addRequest : function(method, params, isNotification) {
      if (isNotification) {
        this.__requestQueue.push({
          data: this.createRpcData(undefined, method, params)
        });
        return null;
      }
      // create externally resolvable promise
      var promise = new qx.Promise();
      var id = ++qx.io.remote.Rpc.__requestId;
      this.__requestQueue.push({
        id : id,
        data : this.createRpcData(id, method, params),
        promise : promise
      });
      return promise;
    },

    /**
     * Make a JSONRPC v2.0 compliant notification. Does not return anything
     * since notifications are "fire & forget"
     *
     * @param {String} method
     * @param {Array|undefined} params
     */
    addNotification : function(method, params) {
      this.addRequest(method, params, true);
    },

    /**
     * Cancels a request by rejecting it with a error with an "exception"
     * property that contains an instance of {@link qx.io.remote.exception.Cancel} .
     * @param {qx.Promise} promise
     * @param {*} reason Optional reason, usually a human-readable error
     *   message or an error object.
     */
    cancel : function(promise, reason) {
      var found = this.__requestQueue.find(function (item) {
        return item.promise === promise;
      });
      if (!found) {
        throw new Error("Invalid promise");
      }
      promise.reject(reason || new qx.io.remote.exception.Cancel());
    },

    /**
     * Sends all requests and notifications that have been added.
     * @return {qx.Promise}
     */
    send : function() {
      if (this.__requestQueue.length === 0) {
        throw new Error("No requests to send.");
      }
      var promise = new qx.Promise(function(resolve, reject) {
        // Create the request object with the (batched) data
        var req = this.createRequest();

        var data = this.__requestQueue.map(function(request) {
          return request.data;
        });
        if (data.length === 1) {
          data = data[0];
        }
        req.setData(qx.lang.Json.stringify(data));

        // set authentication headers
        if (this.getAuthentication()) {
          this.getAuthentication().getAuthHeaders().forEach(function(header) {
            req.setRequestHeader(header.key, header.value);
          });
        }
        req.setTimeout(this.getTimeout());
        req.setRequestHeader("Content-Type", "application/json");
        // Do not parse as JSON. Later done conditionally.
        req.setParseJson(false);

        // http error
        req.addListener("failed", function(evt) {
          var statusCode = evt.getStatusCode();
          var ex = new qx.io.remote.exception.Transport(
            statusCode,
            "HTTP Error " + statusCode + ": " + qx.io.remote.Exchange.statusCodeToString(statusCode),
            {
              request : data
            }
          );
          return reject(ex);
        });

        // timeout
        req.addListener("timeout", function(evt) {
          this.debug("TIMEOUT OCCURRED");
          var statusCode = evt.getStatusCode();
          var ex = new qx.io.remote.exception.Transport(
            qx.io.remote.RpcError.type.TIMEOUT,
            "Local time-out expired. ",
            {
              request : data,
              statusCode : statusCode
            }
          );
          return reject(ex);
        });

        // user abort
        req.addListener("aborted", function(evt) {
          var statusCode = evt.getStatusCode();
          var ex = new qx.io.remote.exception.Transport(
            qx.io.remote.RpcError.type.ABORTED,
            "Aborted.",
            {
              request : data,
              statusCode : statusCode
            }
          );
          return reject(ex);
        });

        // success or jsonrpc error
        req.addListener("completed", function(evt) {
          var response = evt.getContent();
          var ex;

          // server may have reset, giving us no data on our requests
          if (response === null) {
            ex = new qx.io.remote.exception.Transport(
              qx.io.remote.RpcError.type.NO_DATA,
              "No response data.",
              {
                request : data
              }
            );
            return reject(ex);
          }

          // parse response json
          response = qx.lang.Json.parse(response);

          // check for valid jsonrpc v2 response
          if (!qx.lang.Type.isArray(response) && !qx.lang.Type.isObject(response)) {
            ex = new qx.io.remote.exception.Transport(
              qx.io.remote.RpcError.type.INVALID_DATA,
              "Invalid jsonrpc data. ",
              {
                request : data,
                response: evt.getContent()
              }
            );
            return reject(ex);
          }

          // normalize batch and non-batch responses
          var batch = qx.lang.Type.isArray(response) ? response : [response];

          // handle each response
          batch.forEach(function(response) {
            // check for valid jsonrpc v2 response
            if (!qx.lang.Type.isObject(response)) {
              ex = new qx.io.remote.exception.Transport(
                qx.io.remote.RpcError.type.INVALID_DATA,
                "Invalid jsonrpc result data for "+ response.method,
                {
                  request : data,
                  response: evt.getContent()
                }
              );
              return reject(ex);
            }

            var ids = [];
            // analyse individual response
            var result = response.result;
            var id = response.id;
            var method = response.method;
            var error = response.error;

            // we have the response to our request
            if (typeof id != "undefined" && typeof method == "undefined") {
              // we already have a response with the request id
              if (ids.indexOf(id) !== -1) {
                ex = new qx.io.remote.exception.Transport(
                  qx.io.remote.RpcError.type.INVALID_DATA,
                  "Invalid jsonrpc data: multiple responses with same id.",
                  {
                    request : data,
                    response: response
                  }
                );
                return reject(ex);
              }
              ids.push(id);
              // find original request
              var originalRequest = this.__requestQueue.find(function (item) {
                return item.id === id;
              });
              // the result id doesn't match any request id
              if (!originalRequest) {
                ex = new qx.io.remote.exception.Transport(
                  qx.io.remote.RpcError.type.INVALID_DATA,
                  "Invalid jsonrpc data: Unknown request id",
                  {
                    request : data,
                    response: response
                  }
                );
                return reject(ex);
              }
              // remove the entry from the queue
              this.__requestQueue.splice(this.__requestQueue.indexOf(originalRequest), 1);
              // we have an error
              if (typeof error != "undefined") {
                ex = new qx.io.remote.exception.JsonRpc(
                  error.code,
                  error.message,
                  {
                    request : originalRequest.data,
                    response: response
                  }
                );
                // inform listeners
                this.fireDataEvent("error", ex);
                // reject the individual promise
                return originalRequest.promise.reject(ex);
              }
              // we have our result!
              else if (typeof result != "undefined") {
                // inform listeners
                this.fireDataEvent("success", result);
                // resolve the individual promise
                return originalRequest.promise.resolve(result);
              }
              // invalid response
              ex = new qx.io.remote.exception.Transport(
                qx.io.remote.RpcError.type.INVALID_DATA,
                "Invalid jsonrpc data for "+ method + ": result is missing.",
                {
                  request : originalRequest.data,
                  response: response
                }
              );
              return originalRequest.promise.reject(ex);
            }
            // response is a server call or notification
            if (typeof method != "undefined") {
              this.fireDataEvent("request", response);
            }
          }, this);
          // resolve the send() promise
          return resolve(batch.length > 1 ? batch : batch[0]);
        }, this);
        // send the request!
        req.send();
      }, this);
      return promise;
    },

    /**
     * Sends the request immediately without queueing it.
     * See {@link qx.io.remote.Rpc#addRequest} and {@link
     * qx.io.remote.Rpc#send}.
     *
     * @param {String} method
     * @param {Array} params
     * @return {qx.Promise}
     */
    sendRequest : function(method, params) {
      var promise = this.addRequest(method, params);
      this.send().catch(function (err) {
        promise.reject(err);
      });
      return promise;
    },

    /**
     * Sends a notification immediately without queueing it.
     * See {@link qx.io.remote.Rpc#addNotification} and
     * {@link qx.io.remote.Rpc#send}.
     *
     * @param {String} method
     * @param {Array|undefined} params
     */
    sendNotification : function(method, params) {
      this.addNotification(method, params);
      this.send();
    },

    /**
     * resets the request queue
     */
    reset : function() {
      this.__requestQueue = [];
    }

  }
});
