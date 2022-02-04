# Communication

Qooxdoo provides different communication APIs with a rich feature set. 

## HTTP Requests

[`qx.io.request.*`](request_io.md) ([ApiViewer](apps://apiviewer/#qx.io.request)) 
is qooxdoo's standard low-level API aimed at providing the basic building block 
of other APIs, such as the REST interface.

Before version 7, qooxdoo contained an older, now deprecated implementation which 
supports HTTP requests over different transports (Iframe, Script and XHR), and 
provides a JSONRPC v2 client. It has be removed from the framework and put into 
the package [`deprecated.qx.io.remote`](https://github.com/qooxdoo/deprecated.qx.io.remote).
You can reinstall it by executing `npx qx pkg install qooxdoo/deprecated.qx.io.remote`.

## REST interface

[`qx.io.rest.*`](rest.md)([ApiViewer](apps://apiviewer/#qx.io.rest)) provides an
API to handle the specifics of a REST interface. Rather than requesting URLs
with a specific HTTP method manually, a resource representing the remote
resource is instantiated and **actions** are invoked on this resource. 

## Other high-level communication APIs

Based on an [abstracted transport layer](transport.md), qooxdoo provides support
for various high-level communication protocols,  which can use HTTP or other
transport mechanisms available in modern browsers. Note that transport-specific
configuration such as HTTP authentication have to be [configured
in the transport layer](transport.md#customizing-the-transport).

### JSON-RPC

The `qx.io.jsonrpc` namespace provides an API implementing
the [JSON Remote Procedure Call (JSON-RPC) version 2
specification](https://www.jsonrpc.org/specification). 

#### Outgoing requests

Here is an example for making a JSON-RPC request to a server endpoint:

```javascript
(async()=>{
  const client = new qx.io.jsonrpc.Client("https://domain.com/endpoint");
  let result;
  try {
    client.sendNotification("some-method", [1,2,3]); // notifications are "fire & forget"
    result = await client.sendRequest("other-method", [1,2,3]);
  } catch(e) {
    // handle exceptions, which are of type qx.io.exception.*
  }
})();
```

or using a batch:

```javascript
(async()=>{
  const client = new qx.io.jsonrpc.Client("https://domain.com/endpoint");
  const batch = new qx.io.jsonrpc.protocol.Batch()
    .add(new qx.io.jsonrpc.protocol.Request("method3", [1,2,3]))
    .addNotification("method4") // or shorthand method
    .addRequest("method5",["foo", "bar"]) // positional parameters
    .addRequest("method6", {foo:"bar"}); // named parameters
  let results;
  try {
    results = await client.sendBatch(batch);
    // results will be an array with three items, the result of the requests
  } catch(e) {
    // handle exceptions
  }
})();
```

#### Request promises

It is possible to resolve the promises of batched JSON-RPC requests individually,
i.e., the promises can be passed to other parts of the code to be `await`ed
there. This works only with `qx.io.jsonrpc.protocol.Request`.

```javascript
async function doSomethingWithPromise(promise) {
  let result;
  try {
    result = await promise;
  } catch (e) {
    // handle exceptions  
  }
  // do something with the result
}
(async () => {
  const client = new qx.io.jsonrpc.Client("https://domain.com/endpoint");
  const batch = new qx.io.jsonrpc.protocol.Batch();
  const request1 = new qx.io.jsonrpc.protocol.Request("some-method", [1,2,3]);
  const request2 = new qx.io.jsonrpc.protocol.Request("other-method", ["foo"]);
  batch.add(request1).add(request2);
  doSomethingWithPromise(request1.getPromise()); // no await here, the batch needs to be sent first
  doSomethingWithPromise(request2.getPromise());
  try {
    await client.sendBatch(batch);
  } catch(e) {
    // handle exceptions
  }
})();
``` 

#### Incoming requests

The client also supports *incoming* requests as part of the server
response. To receive them, register a listener for the `incomingRequest`
event. For the HTTP transport, notifications can be sent by the server
as part of the response to client requests. Once a WebSocket transport
has been added, the duplex JSON-RPC traffic can be implemented this way.

### GraphQL

The GraphQL implementation is still experimental as it hasn't been used and tested
extensively in a production app. Feedback and improvements are welcome. 

Example:

```javascript
    let client = new qx.io.graphql.Client("https://countries-274616.ew.r.appspot.com/");
    let query = `query($country:String!) {
       Country(name: $country) {
         nativeName
         officialLanguages { name }
       }
     }`;
    let request = new qx.io.graphql.protocol.Request();
    request.setQuery(query);
    request.setVariables({country:"Belgium"});
    let response = await client.send(request);
```

