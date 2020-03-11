# Communication

qooxdoo provides tree different communication APIs with a rich feature set:

- [`qx.io.remote.*`](/communication/remote_io.md)
([ApiViewer](apps://apiviewer/#qx.io.remote)) is the older, but
more featureful implementation. It supports HTTP requests over
different transports (Iframe, Script and XHR), and a [JSONRPC v2 client](jsonrpc.md).

- [`qx.io.request.*`](/communication/request_io.md)
([ApiViewer](apps://apiviewer/#qx.io.request)) is a more systematic
redesign which is, however, still limited to the basic request object
on which extended functionality will be based. If you need a request
object to build your own communication system, it is recommended to use this API.

- [`qx.io.rest.*`](/communication/rest.md)
([ApiViewer](apps://apiviewer/#qx.io.rest)) provides an API to handle
the specifics of a REST interface. Rather than requesting URLs with
a specific HTTP method manually, a resource representing the remote
resource is instantiated and **actions** are invoked on this resource.

