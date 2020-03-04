# JSON-RPC (JSON Remote Procedure Call)

qooxdoo includes support for [JSON-RPC v2](https://www.jsonrpc.org
/specification). It allows you to write true client/server applications
without  having to worry about the communication details. The
client is server-agnostic: it should work with any JSONRPC server
that complies with the standard JSON-RPC v2 specification. 

> Note: Previous versions of qooxdoo used a protocol based on JSON-RPC v1 with 
> some custom extensions 
> For compatibility reasons, this mode will be supported
> in qooxdoo v6, by setting the [`protocol` property of `qx.io.remote.Rpc`](apps://apiviewer/#qx.io.remote.Rpc)
> to `"qx1"`. However, it is strongly advised to switch to standard-compliant
> JSON-RPC v2 since this mode is marked deprecated and will be removed in qooxdoo
> v7. Documentation on this protocol can be found [here](http://www.qooxdoo.org/5.0.2/pages/communication.html#remote-procedure-calls-rpc)

## Making remote calls

### Basic call syntax

To make remote calls, you need to create an instance of the [Rpc class](apps://apiviewer#qx.io.remote.Rpc):

````javascript
var client = new qx.io.remote.Rpc(
    "http://localhost:8080/endpoint",
    "qooxdoo.test"
);

````

The JSON-RPC server must live on the domain that the application
code was loaded from, otherwise you must configure is using
[CORS](https://developer.mozilla.org/de/docs/Web/HTTP/CORS).

The first parameter is the URL of the backend (in this example a backend on
localhost). The second is the name of the service you'd like to call. 

To work with the service, the Rpc class provides two different APIs, a newer
one based on Promises, and a legacy one based on callbacks or events. Note that
you cannot mix the two APIs because the JSONRPC ids are computed differently.

## Promise-based API

The Promise-based API fully conforms to the [JSON-RPC v2 specification](https://www.jsonrpc.org/specification),
including batch mode and bi-directional calls. 

### Single call

To call a remote method, use the `sendRequest(method, params)`
method, which takes a method name and an array of parameters
that will be passed to the method. It returns a promise that
resolves with the result of this method or rejects with an error
object. This error object will be an instance of one of the
[`qx.io.remote.exception.*`](http://www.qooxdoo.org/apps/apiviewer/#qx.io.remote.exception)
classes.

- If it is a transport error, the error code will either be a HTTP error code
  or one of the error codes defined in
  [`qx.io.remote.RpcError.type`](http://www.qooxdoo.org/apps/apiviewer/#qx.io.remote.RpcError).
- If the error originated on the server, it will have an error code conformant
  to the [specification](https://www.jsonrpc.org/specification#error_object) or 
  one defined by the application. 
  
### Batched calls

If an application initiates a large number of calls to the server within a
short period of time, it is advisable to use the [batched mode of JSON-RPC
v2](https://www.jsonrpc.org/specification#batch) in order to save HTTP traffic
(This might become obsolete with the widespread adoption of HTTP/2). The
way to do this is to use the `addRequest()` and `send()` methods like so:

```javascript
    var promise1 = client.addRequest("method1", ["foo"]);
    var promise2 = client.addRequest("method2", ["bar"]);
    var promise3 = client.addRequest("method3", ["baz"]);     
    var promise4 = client.send();
```

Promises 1-3 will resolve with the individual results (or errors) and reject
with jsonrpc errors for this specific call. Promise 4 will resolve with the
jsonrpc data for all requests or reject with any transport-related error. This
means you need to handle errors for both the individual request and for `send()`.

### Notifications

JSON-RPC v2 provides for "notifications", which have "fire-and-forget" character,
i.e. there is (at least in the spec) no way to check if they have been received.
To send them, use the `addNotification()` and `sendNotification` methods, which
behave like the `addRequest()` and `sendRequest()` methods except that they do
not return promises. 

### Bi-directional calls

Because of the client-server architecture of HTTP, which is used for
transport, the bidirectional (peer-to-peer), real-time character of
JSONRPC v2 cannot be fully implemented. Instead, any server-initiated
remote procedure calls "piggy-back" on the responses to  client-initialed
calls. If you want to continually listen to server calls, you must use
polling or a different implementation.

When the client receives a request or notification, it dispatches a
`"request"` event with the full rpc object. No further action is initiated,
it is the responsibility of the developer to handle these events.

## Handler/Event-based API (JSON-RPC v1)

The `callAsync()` and `callAsyncListeners()` support the JSONRPC v1 standard 
(no batch mode and bi-directional calls). In contrast to the Promise-based API,
it can do cross-domain calls via script transport. 

When you have the Rpc instance, you can make synchronous and asynchronous calls:

    // asynchronous call
    var handler = function(result, exc) {
        if (exc == null) {
            alert("Result of async call: " + result);
        } else {
            alert("Exception during async call: " + exc);
        }
    };
    rpc.callAsync(handler, "echo", "Test");

For synchronous calls, the first parameter is the method name. After that, one
or more parameters for this method may follow (in this case, a single string).
Please note that synchronous calls typically block the browser UI until the
result arrives, so they should only be used sparingly (if at all)!

Asynchronous calls work similarly. The only difference is an additional first
parameter that specifies a handler function. This function is called when the
result of the method call is available or when an exception occurred.

You can also use qooxdoo event listeners for asynchronous calls - just use
`callAsyncListeners` instead of `callAsync`. More details can be found in the
[API documentation](http://api.qooxdoo.org/#qx.io.remote.Rpc).


### Aborting a call

You can abort an asynchronous call while it's still being performed:

    // Rpc instantiation and handler function left out for brevity

    var callref = rpc.callAsync(handler, "echo", "Test");

    // ...

    rpc.abort(callref);
      // the handler will be called with an abort exception

### Error handling

When you make a synchronous call, you can catch an exception to handle errors.
In its `rpcdetails` property, the exception contains an object that describes
the error in more detail. The same details are also available in the second
parameter in an asynchronous handler function, as well as in the events fired by
`callAsyncListeners`.

The following example shows how errors can be handled:

    // creation of the Rpc instance left out for brevity

    var showDetails = function(details) {
        alert(
            "origin: " + details.origin +
            "; code: " + details.code +
            "; message: " + details.message
        );
    };

    // error handling for sync calls
    try {
        var result = rpc.callSync("echo", "Test");
    } catch (exc) {
        showDetails(exc.rpcdetails);
    }

    // error handling for async calls
    var handler = function(result, exc) {
        if (exc != null) {
            showDetails(exc);
        }
    };
    rpc.callAsync(handler, "echo", "Test");

The following `origin`'s are defined:

The `code` depends on the origin. For the server and application origins, the
possible codes are defined by the backend implementation. For transport errors,
it's the HTTP status code. For local errors, the following codes are defined:

|Constant|Meaning|
|--------|-------|
|qx.io.remote.Rpc.localError.timeout|A timeout occurred.|
|qx.io.remote.Rpc.localError.abort|The call was aborted.|

### Cross-domain calls

Using the qooxdoo RPC implementation, you can also make calls across domain boundaries. On the client side, all you have to do is specify the correct destination URL in the Rpc constructor and set the crossDomain property to `true`:

    var rpc = new qx.io.remote.Rpc("http://targetdomain.com/appname/.qxrpc");
    rpc.setCrossDomain(true);

On the server side, you need to configure the backend to accept cross-domain
calls (see the documentation comments in the various backend implementations).

