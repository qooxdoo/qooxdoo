/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 by STZ-IDA, Germany, http://www.stz-ida.de
     2006 by Derrell Lipman

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Andreas Junghans (lucidcake)
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(io_remote)

************************************************************************ */


/**
 * Provides a Remote Procedure Call (RPC) implementation.
 * <p>
 * Each instance of this class represents a "Service". These services can
 * correspond to various concepts on the server side (depending on the
 * programming language/environment being used), but usually, a service means
 * a class on the server.
 * </p>
 * <p>
 * In case multiple instances of the same service are needed, they can be
 * distinguished by ids. If such an id is specified, the server routes all
 * calls to a service that have the same id to the same server-side instance.
 * </p>
 * <p>
 * When calling a server-side method, the parameters and return values are
 * converted automatically. Supported types are int (and Integer), double
 * (and Double), String, Date, Map, and JavaBeans. Beans must habe a default
 * constructor on the server side and are represented by simple JavaScript
 * objects on the client side (used as associative arrays with keys matching
 * the server-side properties). Beans can also be nested, but be careful to not
 * create circular references! There are no checks to detect these (which would
 * be expensive), so you as the user are responsible for avoiding them.
 * </p>
 *
 * @param       url {string}            identifies the url where the service
 *                                      is found.  Note that if the url is to
 *                                      a domain (server) other than where the
 *                                      qooxdoo script came from, i.e. it is
 *                                      cross-domain, then you must also call
 *                                      the setCrossDomain(true) method to
 *                                      enable the IframeTrannsport instead of
 *                                      the XmlHttpTransport, since the latter
 *                                      can not handle cross-domain requests.
 *
 * @param       serviceName {string}    identifies the service. For the Java
 *                                      implementation, this is the fully
 *                                      qualified name of the class that offers
 *                                      the service methods
 *                                      (e.g. "my.pkg.MyService").
 */

qx.OO.defineClass("qx.io.remote.Rpc", qx.core.Target,
function(url, serviceName)
{
  qx.core.Target.call(this);

  this.setUrl(url);
  if (serviceName != null) {
    this.setServiceName(serviceName);
  }
});






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/**
  The timeout for asynchronous calls in milliseconds.
 */
qx.OO.addProperty({ name : "timeout", type : qx.constant.Type.NUMBER });

/**
  Indicate that the request is cross domain.

  A request is cross domain if the request's URL points to a host other
  than the local host. This switches the concrete implementation that
  is used for sending the request from qx.io.remote.XmlHttpTransport to
  qx.io.remote.IframeTransport because only the latter can handle cross domain
  requests.
*/
qx.OO.addProperty({ name : "crossDomain", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/**
  The URL at which the service is located.
*/
qx.OO.addProperty({ name : "url", type : qx.constant.Type.STRING, defaultValue : null });

/**
  The service name.
*/
qx.OO.addProperty({ name : "serviceName", type : qx.constant.Type.STRING, defaultValue : null });

/**
  Data sent as "out of band" data in the request to the server.  The format of
  the data is opaque to RPC and may be recognized only by particular servers
  It is up to the server to decide what to do with it: whether to ignore it,
  handle it locally before calling the specified method, or pass it on to the
  method.  This server data is not sent to the server if it has been set to
  'undefined'.
*/
qx.OO.addProperty({ name : "serverData", type : qx.constant.Type.OBJECT, defaultValue : undefined });


/**
   Origins of errors
*/
qx.io.remote.Rpc.origin =
{
  server      : 1,
  application : 2,
  transport   : 3,
  local       : 4
}

/**
   Locally-detected errors
*/
qx.io.remote.Rpc.localError =
{
  timeout     : 1,
  abort       : 2
}


/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

qx.Proto._callInternal = function(args, async) {
  var offset = 0;
  var handler = args[0];
  if (async) {
    offset = 1;
  }
  var whichMethod = args[offset];
  var argsArray = [];
  for (var i = offset + 1; i < args.length; ++i) {
    argsArray.push(args[i]);
  }
  var req = new qx.io.remote.RemoteRequest(this.getUrl(),
                                           qx.constant.Net.METHOD_POST,
                                           qx.constant.Mime.JSON);
  var requestObject = {
    "service": this.getServiceName(),
    "method": whichMethod,
    "id": req.getSequenceNumber(),
    "params": argsArray
    // additional field 'server_data' optionally included, below
  }

  // See if there's any out-of-band data to be sent to the server
  var serverData = this.getServerData();
  if (serverData !== undefined) {
    // There is.  Send it.
    requestObject.server_data = serverData;
  }

  req.setCrossDomain(this.getCrossDomain());

  req.setTimeout(this.getTimeout());
  var ex = null;
  var id = null;
  var result = null;

  var handleRequestFinished = function() {
    if (async) {
      handler(result, ex, id);
    }
  }

  var makeException = function(origin, code, message) {
    var ex = new Object();

    ex.origin = origin;
    ex.code = code;
    ex.message = message;

    ex.toString = function() {
      switch(origin)
      {
      case qx.io.remote.Rpc.origin.server:
        return "Server error " + this.code + ": " + this.message;
      case qx.io.remote.Rpc.origin.application:
        return "Application error " + this.code + ": " + this.message;
      case qx.io.remote.Rpc.origin.transport:
        return "Transport error " + this.code + ": " + this.message;
      case qx.io.remote.Rpc.origin.local:
        return "Local error " + this.code + ": " + this.message;
      default:
        return "UNEXPECTED origin " + this.origin + " error " + this.code + ": " + this.message;
      }
    }

    return ex;
  }

  req.addEventListener("failed", function(evt) {
    var code = evt.getData().getStatusCode();
    ex = makeException(qx.io.remote.Rpc.origin.transport,
                       code,
                       qx.io.remote.RemoteExchange.statusCodeToString(code));
    id = this.getSequenceNumber();
    handleRequestFinished();
  });
  req.addEventListener("timeout", function(evt) {
    ex = makeException(qx.io.remote.Rpc.origin.local,
                       qx.io.remote.Rpc.localError.timeout,
                       "Local time-out expired");
    id = this.getSequenceNumber();
    handleRequestFinished();
  });
  req.addEventListener("aborted", function(evt) {
    ex = makeException(qx.io.remote.Rpc.origin.local,
                       qx.io.remote.Rpc.localError.abort,
                       "Aborted");
    id = this.getSequenceNumber();
    handleRequestFinished();
  });
  req.addEventListener("completed", function(evt) {
    result = evt.getData().getContent();
    id = result["id"];
    if (id != this.getSequenceNumber()) {
      this.warn("Received id (" + id + ") does not match requested id (" + this.getSequenceNumber + ")!");
    }
    var exTest = result["error"];
    if (exTest != null) {
      result = null;
      ex = makeException(exTest.origin, exTest.code, exTest.message);
    } else {
      result = result["result"];
    }
    handleRequestFinished();
  });
  req.setData(qx.io.Json.stringify(requestObject));
  req.setAsynchronous(async);

  if (req.getCrossDomain()) {
    // Our choice here has no effect anyway.  This is purely informational.
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  } else {
    // When not cross-domain, set type to text/json
    req.setRequestHeader("Content-Type", "text/json");
  }

  req.send();

  if (!async) {
      if (ex != null) {
        throw ex;
      }
      return result;
  } else {
    return req;
  }
}


/**
 * Makes a synchronous server call. The method arguments (if any) follow
 * after the method name (as normal JavaScript arguments, separated by commas,
 * not as an array).
 * <p>
 * If a problem occurs when making the call, an exception is thrown.
 * </p>
 * <p>
 * WARNING.  With some browsers, the synchronous interface
 * causes the browser to hang while awaiting a response!  If the server
 * decides to pause for a minute or two, your browser may do nothing
 * (including refreshing following window changes) until the response is
 * received.  Instead, use the asynchronous interface.
 * </p>
 * <p>
 * YOU HAVE BEEN WARNED.
 * </p>
 *
 * @param       methodName {string}   the name of the method to call.
 *
 * @return      {var}                 the result returned by the server.
 */

qx.Proto.callSync = function(methodName) {
  return this._callInternal(arguments, false);
}


/**
 * Makes an asynchronous server call. The method arguments (if any) follow
 * after the method name (as normal JavaScript arguments, separated by commas,
 * not as an array).
 * <p>
 * When an answer from the server arrives, the <code>handler</code> function
 * is called with the result of the call as the first,  an exception as the
 * second parameter, and the id (aka sequence number) of the invoking request
 * as the third parameter. If the call was successful, the second parameter is
 * <code>null</code>. If there was a problem, the second parameter contains an
 * exception, and the first one is <code>null</code>.
 * </p>
 * <p>
 * The return value of this method is a call reference that you can store if
 * you want to abort the request later on. This value should be treated as
 * opaque and can change completely in the future! The only thing you can rely
 * on is that the <code>abort</code> method will accept this reference and
 * that you can retrieve the sequence number of the request by invoking the
 * getSequenceNumber() method (see below).
 * </p>
 * <p>
 * If a specific method is being called, asynchronously, a number of times in
 * succession, the getSequenceNumber() method may be used to disambiguate
 * which request a response corresponds to.  The sequence number value is a
 * value which increments with each request.)
 * </p>
 *
 * @param       handler {Function}    the callback function.
 *
 * @param       methodName {string}   the name of the method to call.
 *
 * @return      {var}                 the method call reference.
 */

qx.Proto.callAsync = function(handler, methodName) {
  return this._callInternal(arguments, true);
}


/**
 * Aborts an asynchronous server call. Consequently, the callback function
 * provided to <code>callAsync</code> will be called with an exception.
 *
 * @param       opaqueCallRef {var}     the call reference as returned by
 *                                      <code>callAsync</code>.
 */

qx.Proto.abort = function(opaqueCallRef) {
  opaqueCallRef.abort();
}


/**
 * Creates an URL for talking to a local service. A local service is one that
 * lives in the same application as the page calling the service. For backends
 * that don't support this auto-generation, this method returns null.
 *
 * @param       instanceId {string,null}    an optional identifier for the
 *                                          server side instance that should be
 *                                          used. All calls to the same service
 *                                          with the same instance id are
 *                                          routed to the same object instance
 *                                          on the server. The instance id can
 *                                          also be used to provide additional
 *                                          data for the service instantiation
 *                                          on the server.
 *
 * @return      {string}                    the url.
 */

qx.Class.makeServerURL = function(instanceId) {
  var retVal = null;
  if (qx.core.ServerSettings) {
    retVal = qx.core.ServerSettings.serverPathPrefix + "/.qxrpc" +
             qx.core.ServerSettings.serverPathSuffix;
    if (instanceId != null) {
      retVal += "?instanceId=" + instanceId;
    }
  }
  return retVal;
}
