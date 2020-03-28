# Communication

qooxdoo provides three different communication APIs with a rich feature set:

## HTTP Requests

The HTTP Request API comes in two flavours:
 
  - [`qx.io.remote.*`](remote_io.md)
  ([ApiViewer](apps://apiviewer/#qx.io.remote)) is the older, but more
  featureful implementation. It supports HTTP requests over different
  transports (Iframe, Script and XHR), and a [JSONRPC v2 client](rpc.md).

  - [`qx.io.request.*`](request_io.md)
  ([ApiViewer](apps://apiviewer/#qx.io.request)) is a more systematic
  redesign aimed at providing the basic building block of other APIs. It is used,
  for example, in the REST API described below.

## REST interface

[`qx.io.rest.*`](rest.md)([ApiViewer](apps://apiviewer/#qx.io.rest)) provides 
an API to handle the specifics of a REST interface. Rather than requesting URLs with
a specific HTTP method manually, a resource representing the remote
resource is instantiated and **actions** are invoked on this resource.

## JSON-RPC

qooxdoo includes support for [JSON-RPC v2](https://www.jsonrpc.org
/specification) via its [Remote Procedure API](rpc.md). JSON-RPC allows you to write true client/server applications
without  having to worry about the communication details. The
client is server-agnostic: it should work with any HTTP-based JSONRPC server
that complies with the standard JSON-RPC v2 specification. 

