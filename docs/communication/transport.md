# Transport layer

The transport layer supports any transport that can send and receive UTF-8
encoded strings over the network. Typically, this will be transports with a
request/response model such as HTTP, for which we supply two implementations:
`qx.io.transport.Xhr` is based on `qx.io.request`; `qx.io.tranport.Fetch` on the
[Fetch
API](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch).
On the other hand, transports can implement a fully duplex communication channel
such as those based on the [WebSocket
API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
(`qx.ui.transport.Websocket`) or the [PostMessage
API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
(`qx.io.tranport.PostMessage`).

Any transport must implement `qx.io.transport.ITransport`. For more information
for the currently provided transports, see the [class documentation in the API
Viewer](https://qooxdoo.org/apiviewer/#qx.io.transport).

## Selecting a transport

All applications that use the transport layer need to select a transport explicitly.
The easiest way to do this is to use a compiler hint in the docblock of your
application class or any class that uses the protocol. For the http transport which
uses XHR, this would be

```javascript
/**
 * @use(qx.io.transport.Xhr)
 */
qx.Class.define("...
```

This way, this transport will be used for any HTTP(S)-URL. Alternatively,
you can also select the transport for each client instance individually,
for example, using

```javascript
const client = new qx.io.jsonrpc.Client(new qx.io.transport.Xhr("https://domain.com/endpoint"));
```

## Customizing the transport

Transport-specific issues like authentication need to be handled in the transport
layer. For example, to use HTTP Bearer authentication for JSON-RPC, using a XHR
transport, do this:

```javascript
const client = new qx.io.jsonrpc.Client(new qx.io.transport.Xhr("https://domain.com/endpoint"));
client.addListener("outgoingRequest", () => {
  const auth = new qx.io.request.authentication.Bearer("TOKEN");
  client.getTransport().getTransportImpl().setAuthentication(auth);  
});
client.sendRequest("method-needing-authentication", [1,2,3]);
```

Instead, you can also create a class that inherits from `qx.io.transport.Xhr`
and overrides `qx.io.transport.Xhr#_createTransportImpl`. To make
the client use this transport, provide a `defer` section which registers the
behavior for your particular class of URIs:

```javascript
  defer() {
    qx.io.jsonrpc.Client.registerTransport(/^http/, my.custom.Transport); 
  } 
```

`qx.io.jsonrpc.Client` will always use the transport that was last
registered for a certain endpoint pattern, i.e. from then on, all clients
created with urls that start with "http" will use that custom behavior.
