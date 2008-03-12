/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2006 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Andreas Junghans (lucidcake)
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(io_remote)

************************************************************************ */

/**
 * Provides a Remote Procedure Call (RPC) implementation.
 *
 * Each instance of this class represents a "Service". These services can
 * correspond to various concepts on the server side (depending on the
 * programming language/environment being used), but usually, a service means
 * a class on the server.
 *
 * In case multiple instances of the same service are needed, they can be
 * distinguished by ids. If such an id is specified, the server routes all
 * calls to a service that have the same id to the same server-side instance.
 *
 * When calling a server-side method, the parameters and return values are
 * converted automatically. Supported types are int (and Integer), double
 * (and Double), String, Date, Map, and JavaBeans. Beans must have a default
 * constructor on the server side and are represented by simple JavaScript
 * objects on the client side (used as associative arrays with keys matching
 * the server-side properties). Beans can also be nested, but be careful not to
 * create circular references! There are no checks to detect these (which would
 * be expensive), so you as the user are responsible for avoiding them.
 *
 * A simple example:
 * <pre class='javascript'>
 *   function callRpcServer ()
 *   {
 *     var rpc = new qx.io.remote.Rpc();
 *     rpc.setTimeout(10000);
 *     rpc.setUrl("http://127.0.0.1:8007");
 *     rpc.setServiceName("qooxdoo.admin");
 *
 *     // call a remote procedure -- takes no arguments, returns a string
 *     var that = this;
 *     this.RpcRunning = rpc.callAsync(
 *       function(result, ex, id)
 *       {
 *         that.RpcRunning = null;
 *         if (ex == null) {
 *             alert(result);
 *         } else {
 *             alert("Async(" + id + ") exception: " + ex);
 *         }
 *       },
 *       "fss.getBaseDir");
 *   }
 * </pre>
 * __fss.getBaseDir__ is the remote procedure in this case, potential arguments
 * would be listed after the procedure name.
 */
qx.Class.define("qx.io.remote.Rpc",
{
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param url {String}            identifies the url where the service
   *                                is found.  Note that if the url is to
   *                                a domain (server) other than where the
   *                                qooxdoo script came from, i.e. it is
   *                                cross-domain, then you must also call
   *                                the setCrossDomain(true) method to
   *                                enable the ScriptTransport instead of
   *                                the XmlHttpTransport, since the latter
   *                                can not handle cross-domain requests.
   *
   * @param serviceName {String}    identifies the service. For the Java
   *                                implementation, this is the fully
   *                                qualified name of the class that offers
   *                                the service methods
   *                                (e.g. "my.pkg.MyService").
   */
  construct : function(url, serviceName)
  {
    this.base(arguments);

    if (url !== undefined)
    {
      this.setUrl(url);
    }

    if (serviceName != null)
    {
      this.setServiceName(serviceName);
    }

    this._previousServerSuffix = null;
    this._currentServerSuffix = null;

    if (qx.core.ServerSettings)
    {
      this._currentServerSuffix = qx.core.ServerSettings.serverPathSuffix;
    }
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    "completed" : "qx.event.type.Event",
    "aborted" : "qx.event.type.Event",
    "failed" : "qx.event.type.Event",
    "timeout" : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Origins of errors
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
     */
    localError :
    {
      timeout : 1,
      abort   : 2
    },


    /**
     * Creates an URL for talking to a local service. A local service is one that
     * lives in the same application as the page calling the service. For backends
     * that don't support this auto-generation, this method returns null.
     *
     * @type static
     * @param instanceId {String ? null} an optional identifier for the
     *                                   server side instance that should be
     *                                   used. All calls to the same service
     *                                   with the same instance id are
     *                                   routed to the same object instance
     *                                   on the server. The instance id can
     *                                   also be used to provide additional
     *                                   data for the service instantiation
     *                                   on the server.
     * @return {String} the url.
     */
    makeServerURL : function(instanceId)
    {
      var retVal = null;

      if (qx.core.ServerSettings)
      {
        retVal =
          qx.core.ServerSettings.serverPathPrefix +
          "/.qxrpc" +
          qx.core.ServerSettings.serverPathSuffix;

        if (instanceId != null)
        {
          retVal += "?instanceId=" + instanceId;
        }
      }

      return retVal;
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
     * used for sending the request from qx.io.remote.XmlHttpTransport to
     * qx.io.remote.ScriptTransport because only the latter can handle cross
     * domain requests.
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
     * not sent to the server if it has been set to 'undefined'.
     *
     * TODO: undefined is not supported by the new properties, alternative
     * ways to implement this? Maybe use null instead?
     */
    serverData :
    {
      check : "Object",
      nullable : true
    },


    /**
     * Username to use for HTTP authentication. Null if HTTP authentication
     * is not used.
     */
    username :
    {
      check : "String",
      nullable : true
    },


    /**
     * Password to use for HTTP authentication. Null if HTTP authentication
     * is not used.
     */
    password :
    {
      check : "String",
      nullable : true
    },


    /**
      Use Basic HTTP Authentication
    */
    useBasicHttpAuth :
    {
      check : "Boolean",
      nullable : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      CORE METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Internal RPC call method
     *
     * @type member
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
     * @return {var} TODOC
     * @throws TODOC
     */
    _callInternal : function(args, callType, refreshSession)
    {
      var self = this;
      var offset = (callType == 0 ? 0 : 1);
      var whichMethod = (refreshSession ? "refreshSession" : args[offset]);
      var handler = args[0];
      var argsArray = [];
      var eventTarget = this;

      for (var i=offset+1; i<args.length; ++i)
      {
        argsArray.push(args[i]);
      }

      var req = new qx.io.remote.Request(this.getUrl(),
                                         qx.net.Http.METHOD_POST,
                                         qx.util.Mime.JSON);

      var requestObject =
      {
        "service" : (refreshSession ? null : this.getServiceName()),
        "method"  : whichMethod,
        "id"      : req.getSequenceNumber(),
        "params"  : argsArray
      };

      // additional field 'server_data' optionally included, below
      // See if there's any out-of-band data to be sent to the server
      var serverData = this.getServerData();

      if (serverData !== undefined)
      {
        // There is.  Send it.
        requestObject.server_data = serverData;
      }

      req.setCrossDomain(this.getCrossDomain());

      if (this.getUsername())
      {
        req.setUseBasicHttpAuth(this.getUseBasicHttpAuth());
        req.setUsername(this.getUsername());
        req.setPassword(this.getPassword());
      }

      req.setTimeout(this.getTimeout());
      var ex = null;
      var id = null;
      var result = null;
      var response = null;

      var handleRequestFinished = function(eventType, eventTarget)
      {
        switch(callType)
        {
          case 0: // sync
            break;

          case 1: // async with handler function
            handler(result, ex, id);
            break;

          case 2: // async with event listeners
            // Dispatch the event to our listeners.
            if (!ex)
            {
              eventTarget.createDispatchDataEvent(eventType, response);
            }
            else
            {
              // Add the id to the exception
              ex.id = id;

              if (args[0])      // coalesce
              {
                // They requested that we coalesce all failure types to
                // "failed"
                eventTarget.createDispatchDataEvent("failed", ex);
              }
              else
              {
                // No coalese so use original event type
                eventTarget.createDispatchDataEvent(eventType, ex);
              }
            }
        }
      };

      var addToStringToObject = function(obj)
      {
        obj.toString = function()
        {
          switch(obj.origin)
          {
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
      };

      var makeException = function(origin, code, message)
      {
        var ex = new Object();

        ex.origin = origin;
        ex.code = code;
        ex.message = message;
        addToStringToObject(ex);

        return ex;
      };

      req.addEventListener("failed", function(evt)
      {
        var code = evt.getStatusCode();
        ex = makeException(qx.io.remote.Rpc.origin.transport,
                           code,
                           qx.io.remote.Exchange.statusCodeToString(code));
        id = this.getSequenceNumber();
        handleRequestFinished("failed", eventTarget);
      });

      req.addEventListener("timeout", function(evt)
      {
        this.debug("TIMEOUT OCCURRED");
        ex = makeException(qx.io.remote.Rpc.origin.local,
                           qx.io.remote.Rpc.localError.timeout,
                           "Local time-out expired");
        id = this.getSequenceNumber();
        handleRequestFinished("timeout", eventTarget);
      });

      req.addEventListener("aborted", function(evt)
      {
        ex = makeException(qx.io.remote.Rpc.origin.local,
                           qx.io.remote.Rpc.localError.abort,
                           "Aborted");
        id = this.getSequenceNumber();
        handleRequestFinished("aborted", eventTarget);
      });

      req.addEventListener("completed", function(evt)
      {
        response = evt.getContent();
        id = response["id"];

        if (id != this.getSequenceNumber())
        {
          this.warn("Received id (" + id + ") does not match requested id " +
                    "(" + this.getSequenceNumber() + ")!");
        }

        var exTest = response["error"];

        if (exTest != null)
        {
          result = null;
          addToStringToObject(exTest);
          ex = exTest;
        }
        else
        {
          result = response["result"];

          if (refreshSession)
          {
            result = eval("(" + result + ")");
            var newSuffix = qx.core.ServerSettings.serverPathSuffix;

            if (self._currentServerSuffix != newSuffix)
            {
              self._previousServerSuffix = self._currentServerSuffix;
              self._currentServerSuffix = newSuffix;
            }

            self.setUrl(self.fixUrl(self.getUrl()));
          }
        }

        handleRequestFinished("completed", eventTarget);
      });

      req.setData(qx.io.Json.stringify(requestObject));
      req.setAsynchronous(callType > 0);

      if (req.getCrossDomain())
      {
        // Our choice here has no effect anyway.  This is purely informational.
        req.setRequestHeader("Content-Type",
                             "application/x-www-form-urlencoded");
      }
      else
      {
        // When not cross-domain, set type to text/json
        req.setRequestHeader("Content-Type", qx.util.Mime.JSON);
      }

      req.send();

      if (callType == 0)
      {
        if (ex != null)
        {
          var error = new Error(ex.toString());
          error.rpcdetails = ex;
          throw error;
        }

        return result;
      }
      else
      {
        return req;
      }
    },


    /**
     * Helper method to rewrite a URL with a stale session id (so that it includes
     * the correct session id afterwards).
     *
     * @type member
     * @param url {String} the URL to examine.
     * @return {String} the (possibly re-written) URL.
     */
    fixUrl : function(url)
    {
      if (this._previousServerSuffix == null ||
          this._currentServerSuffix == null ||
          this._previousServerSuffix == "" ||
          this._previousServerSuffix == this._currentServerSuffix)
      {
        return url;
      }

      var index = url.indexOf(this._previousServerSuffix);

      if (index == -1)
      {
        return url;
      }

      return (url.substring(0, index) +
              this._currentServerSuffix +
              url.substring(index + this._previousServerSuffix.length));
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
     * @type member
     * @param methodName {String} the name of the method to call.
     * @return {var} the result returned by the server.
     */
    callSync : function(methodName)
    {
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
     *
     * @type member
     * @param handler {Function} the callback function.
     * @param methodName {String} the name of the method to call.
     * @return {var} the method call reference.
     */
    callAsync : function(handler, methodName)
    {
      return this._callInternal(arguments, 1);
    },


    /**
     * Makes an asynchronous server call and dispatch an event upon completion
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
     * When a "completed" event is dispatched, the event data contains the
     * JSON-RPC result.
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
     *
     * @type member
     * @param coalesce {Boolean} coalesce all failure types ("failed",
     *                           "timeout", and "aborted") to "failed".
     *                           This is reasonable in many cases, as
     *                           the provided exception contains adequate
     *                           disambiguating information.
     * @param methodName {String} the name of the method to call.
     * @return {var} the method call reference.
     */
    callAsyncListeners : function(coalesce, methodName)
    {
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
     * @type member
     * @param handler {Function} a callback function that is called when the
     *                           refresh is complete (or failed).
     * @return {void}
     */
    refreshSession : function(handler)
    {
      if (this.getCrossDomain())
      {
        if (qx.core.ServerSettings &&
            qx.core.ServerSettings.serverPathSuffix)
        {
          var timeDiff =
            (new Date()).getTime() - qx.core.ServerSettings.lastSessionRefresh;

          if (timeDiff / 1000 >
              (qx.core.ServerSettings.sessionTimeoutInSeconds - 30))
          {
            // this.info("refreshing session");
            this._callInternal([ handler ], 1, true);
          }
          else
          {
            handler(true); // session refresh was OK (in this case: not needed)
          }
        }
        else
        {
          handler(false); // no refresh possible, but would be necessary
        }
      }
      else
      {
        handler(true); // session refresh was OK (in this case: not needed)
      }
    },


    /**
     * Aborts an asynchronous server call. Consequently, the callback function
     * provided to <code>callAsync</code> or <code>callAsyncListeners</code>
     * will be called with an exception.
     *
     * @type member
     * @param opaqueCallRef {var} the call reference as returned by
     *                            <code>callAsync</code> or
     *                            <code>callAsyncListeners</code>
     * @return {void}
     */
    abort : function(opaqueCallRef)
    {
      opaqueCallRef.abort();
    }
  }
});
