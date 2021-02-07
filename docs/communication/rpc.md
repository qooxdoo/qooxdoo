# JSON-RPC (JSON Remote Procedure Call)

Qooxdoo includes support for [JSON-RPC v2
specification](https://www.jsonrpc.org). The implementation allows you to write
true client/server applications without having to worry about the communication
details. The client is server-agnostic: it should work with any HTTP-based
JSONRPC server that complies with the standard JSON-RPC v2 specification.

- See the `qx.io.remote.Rpc` API

Previous versions of Qooxdoo used a custom protocol ("qx1") which is
incompatible with standard JSON-RPC. For reasons of backwards-compatibility,
this mode will be supported in Qooxdoo v6. However, since it is marked
deprecated and will be removed in Qooxdoo v7, it is strongly advised to switch
to standard-compliant JSON-RPC v2. Documentation on the old protocol can be
found
[here](http://archive.qooxdoo.org/5.0.2/pages/communication.html#remote-procedure-calls-rpc)
.

A new transport-agnostic implementation that will implement the complete
feature-set of JSON-RPC is
[being developed](https://github.com/qooxdoo/incubator.qx.io.jsonrpc) and will
be available in Qooxdoo version 7.

## Making remote calls

### Basic call syntax

To make remote calls, you need to create an instance of the
[Rpc class](apps://apiviewer#qx.io.remote.Rpc) :

```javascript
const client = new qx.io.remote.Rpc(
  "http://localhost:8080/endpoint",
  "Qooxdoo.test"
);
```

The JSON-RPC server must live on the domain that the application code was loaded
from, otherwise you must configure is using
[CORS](https://developer.mozilla.org/de/docs/Web/HTTP/CORS) .

The first parameter is the URL of the backend (in this example a backend on
localhost). The second is the name of the service you'd like to call.

When you have the Rpc instance, you can make asynchronous calls (Synchronous
calls are also possible, but are marked as deprecated).

```javascript
const handler = function (result, exc) {
  if (exc == null) {
    alert("Result of async call: " + result);
  } else {
    alert("Exception during async call: " + exc);
  }
};
rpc.callAsync(handler, "echo", "Test");
```

You can also use Qooxdoo event listeners for asynchronous calls - just use
`callAsyncListeners` instead of `callAsync`. More details can be found in the
[API documentation](apps://apiviewer/#qx.io.remote.Rpc) .

### Aborting a call

You can abort an asynchronous call while it's still being performed:

```javascript
// Rpc instantiation and handler function left out for brevity

const callref = rpc.callAsync(handler, "echo", "Test");

// ...

rpc.abort(callref);
// the handler will be called with an abort exception
```

### Error handling

When an error is thrown, it will be passes as the second parameter in an
asynchronous handler function, as well as in the events fired by
`callAsyncListeners`. In its `rpcdetails` property, the exception contains an
object that describes the error in more detail.

The following example shows how errors can be handled:

```javascript
// creation of the Rpc instance left out for brevity

const showDetails = function (details) {
  alert(
    "origin: " + details.origin + "; code: " + details.code + "; message: " +
      details.message
  );
};

// error handling for sync calls
try {
  var result = rpc.callSync("echo", "Test");
} catch (exc) {
  showDetails(exc.rpcdetails);
}

// error handling for async calls
var handler = function (result, exc) {
  if (exc != null) {
    showDetails(exc);
  }
};
rpc.callAsync(handler, "echo", "Test");
```

The following `origin`s are defined:

The `code` depends on the origin. For the server and application origins, the
possible codes are defined by the backend implementation. For transport errors,
it's the HTTP status code. For local errors, the following codes are defined:

| Constant                            | Meaning               |
| ----------------------------------- | --------------------- |
| qx.io.remote.Rpc.localError.timeout | A timeout occurred.   |
| qx.io.remote.Rpc.localError.abort   | The call was aborted. |

### Cross-domain calls

Using the Qooxdoo RPC implementation, you can also make calls across domain
boundaries. On the client side, all you have to do is specify the correct
destination URL in the Rpc constructor and set the crossDomain property to
`true`:

```javascript
const rpc = new qx.io.remote.Rpc("http://targetdomain.com/appname/.qxrpc");
rpc.setCrossDomain(true);
```

On the server side, you need to configure the backend to accept cross-domain
calls (see the documentation comments in the various backend implementations).
