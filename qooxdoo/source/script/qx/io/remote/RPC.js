/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>
     * Andreas Junghans (lucidcake)
       <andreas dot junghans at stz-ida dot de>

************************************************************************ */

/* ************************************************************************

#use(qx.io.JSON)
#use(qx.io.remote.RemoteRequest)

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
 * @param       serviceName {string}    identifies the service. For the Java
 *                                      implementation, this is the fully
 *                                      qualified name of the class that offers
 *                                      the service methods
 *                                      (e.g. "my.pkg.MyService").
 * @param       instanceId {var}        an identifier for this particular
 *                                      instance. All calls to the same service
 *                                      with the same instance id are routed to
 *                                      the same object instance on the server.
 *                                      The instance id can also be used to
 *                                      provide additional data for the service
 *                                      instantiation on the server.
 */

qx.OO.defineClass("qx.io.remote.RPC", qx.core.Target,
function(serviceName, instanceId)
{
  qx.core.Target.call(this);

  this._serviceName = serviceName;
  this._instanceId = instanceId;
});






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/**
 * The timeout for asynchronous calls in milliseconds.
 */

qx.OO.addProperty({ name : "timeout", type : qx.constant.Type.TYPEOF_NUMBER });






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
  var requestObject = {
    "service": this._serviceName,
    "method": whichMethod,
    "arguments": argsArray
  };
  if (this._instanceId != null) {
    requestObject["instance"] = this._instanceId;
  }

  var req = new qx.io.remote.RemoteRequest(qx.core.ServerSettings.serverPathPrefix + "/.qxrpc" + qx.core.ServerSettings.serverPathSuffix,
                                           qx.constant.Net.METHOD_POST, qx.constant.Mime.JSON);
  req.setTimeout(this.getTimeout());
  var ex = null;
  var result = null;
  var handleRequestFinished = function() {
    if (async) {
      handler(result, ex);
    }
  };
  req.addEventListener("failed", function(evt) {
    ex = "Request failed. Status code: " + evt.getData().getStatusCode().toString();
    handleRequestFinished();
  });
  req.addEventListener("timeout", function(evt) {
    ex = "Request timed out. Status code: " + evt.getData().getStatusCode().toString();
    handleRequestFinished();
  });
  req.addEventListener("aborted", function(evt) {
    ex = "Request aborted. Status code: " + evt.getData().getStatusCode().toString();
    handleRequestFinished();
  });
  req.addEventListener("completed", function(evt) {
    result = evt.getData().getContent();
    var exTest = result["exception"];
    if (exTest != null) {
      result = null;
      ex = exTest;
      ex.toString = function() {
        return this.name + ": " + this.message;
      };
    } else {
      result = result["return"];
    }
    handleRequestFinished();
  });
  req.setData(qx.io.JSON.stringify(requestObject));
  req.setAsynchronous(async);
  req.send();

  if (!async) {
      if (ex != null) {
        throw ex;
      }
      return result;
  } else {
    return req;
  }
};


/**
 * Makes a synchronous server call. The method arguments (if any) follow
 * after the method name (as normal JavaScript arguments, separated by commas,
 * not as an array).
 * <p>
 * If a problem occurs when making the call, an exception is thrown.
 * </p>
 * 
 * @param       methodName {string}   the name of the method to call.
 *
 * @return      {var}                 the result returned by the server.
 */

qx.Proto.callSync = function(methodName) {
  return this._callInternal(arguments, false);
};


/**
 * Makes an asynchronous server call. The method arguments (if any) follow
 * after the method name (as normal JavaScript arguments, separated by commas,
 * not as an array).
 * <p>
 * When an answer from the server arrives, the <code>handler</code> function is
 * called with the result of the call as the first and an exception as the
 * second parameter. If the call was successful, the second parameter is
 * <code>null</code>. If there was a problem, the second parameter contains an
 * exception, and the first one is <code>null</code>.
 * </p>
 * <p>
 * The return value of this method is a call reference that you can store if
 * you want to abort the request later on. This value should be treated as
 * opaque and can change completely in the future! The only thing you can rely
 * on is that the <code>abort</code> method will accept this reference.
 * </p>
 * 
 * @param       handler {Function}    the callback function.
 * @param       methodName {string}   the name of the method to call.
 *
 * @return      {var}                 the method call reference.
 */

qx.Proto.callAsync = function(handler, methodName) {
  return this._callInternal(arguments, true);
};


/**
 * Aborts an asynchronous server call. Consequently, the callback function
 * provided to <code>callAsync</code> will be called with an exception.
 *
 * @param       opaqueCallRef {var}     the call reference as returned by
 *                                      <code>callAsync</code>.
 */

qx.Proto.abort = function(opaqueCallRef) {
  opaqueCallRef.abort();
};


// dummy server settings to avoid confusing error messages
if (!qx.core.ServerSettings) {
  qx.core.ServerSettings = {serverPathPrefix: "", serverPathSuffix: ""};
}
