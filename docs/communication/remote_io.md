AJAX
====

> **note**
>
> qx.io.remote.Request will be deprecated in a future release. Use qx.io.request.Xhr instead.

This system is (as everything else in qooxdoo) completely event based. It currently supports communication by **XMLHttp**, **Iframes** or **Script**. The system wraps most of the differences between the implementations and unifies them for the user/developer.

For all your communication needs you need to create a new instance of Request:

    var req = new qx.io.remote.Request(url, "GET", "text/plain");

Constructor arguments of Request:

1.  URL: Any valid http/https/file URL
2.  Method: You can choose between POST and GET.
3.  Response mimetype: What mimetype do you await as response

Mimetypes supported
-------------------

-   application/xml
-   text/plain
-   text/html
-   text/javascript
-   application/json

> **note**
>
> `text/javascript` and `application/json` will be directly evaluated. As content you will get the return value.

If you use the iframe transport implementation the functionality of the type is more dependent on the server side response than for the XMLHttp case. For example the text/html mimetypes really need the response in HTML and can't convert it. This also depends greatly on the mimetype sent out by the server.

Request data
------------

-   `setRequestHeader(key, value)`: Setup a request header to send.
-   `getRequestHeader(key)`: Returns the configured value of the request header.
-   `setParameter(key, value)`: Add a parameter to send with your request.
-   `getParameter(key)`: Returns the value of the given parameter.
-   `setData(value)`: Sets the data which should be sent with the request (only useful for POST)
-   `getData()`: Returns the data currently set for the request

> **note**
>
> Parameters are always sent as part of the URL, even if you select POST. If you select POST, use the setData method to set the data for the request body.

Request configuration (properties)
----------------------------------

-   `asynchronous`: Should the request be asynchronous? This is `true` by default. Otherwise it will stop the script execution until the response was received.
-   `data`: Data to send with the request. Only used for POST requests. This is the actual post data. Generally this is a string of url-encoded key-value pairs.
-   `username`: The user name to authorize for the server. Configure this to enable authentication.
-   `password`: The password to authenticate for the server.
-   `timeout`: Configure the timeout in milliseconds of each request. After this timeout the request will be automatically canceled.
-   `prohibitCaching`: Add a random numeric key-value pair to the url to securely prohibit caching in IE. Enabled by default.
-   `crossDomain`: Enable/disable cross-domain transfers. This is `false` by default. If you need to acquire data from a server of a different domain you would need to setup this as `true`. (**Caution:** this would switch to "script" transport, which is a security risk as you evaluate code from an external source. Please understand the security issues involved.)
-   `fileUpload`: Indicate that the request will be used for a file upload. The request will be used for a file upload. This switches the concrete implementation that is used for sending the request from `qx.io.remote.transport.XmlHttp` to `qx.io.remote.IFrameTransport`, because only the latter can handle file uploads.

Available events
----------------

-   `sending`: Request was configured and is sending data to the server.
-   `receiving`: The client receives the response of the server.
-   `completed`: The request was executed successfully.
-   `failed`: The request failed through some reason.
-   `timeout`: The request has got a timeout event.
-   `aborted`: The request was aborted.

The last four events give you a `qx.event.type.Data` as the first parameter of the event handler. As always for `qx.event.type.Data` you can access the stored data using `getData()`. The return value of this function is an instance of `qx.io.remote.Response`.

Response object
---------------

The response object `qx.io.remote.Response` stores all the returning data of a `qx.io.remote.Request`. This object comes with the following methods:

-   `getContent`: Returns the content data of the response. This should be the type of content you acquired using the request.
-   `getResponseHeader`: Returns the content of the given header entry.
-   `getResponseHeaders`: Return all available response headers. This is a hash-map using typical key-values pairs.
-   `getStatusCode`: Returns the HTTP status code.

> **note**
>
> Response headers and status code information are not supported for iframe based communication!

Simple example
--------------

    // get text from the server
    req = new qx.io.remote.Request(val.getLabel(), "GET", "text/plain");
    // request a javascript file from the server
    // req = new qx.io.remote.Request(val.getLabel(), "GET", "text/javascript");

    // Switching to POST
    // req.setMethod("POST");
    // req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    // Adding parameters - will be added to the URL
    // req.setParameter("test1", "value1");
    // req.setParameter("test2", "value2");

    // Adding data to the request body
    // req.setData("foobar");

    // Force to testing iframe implementation
    // req.setCrossDomain(true);

    req.addListener("completed", function(e) {
      alert(e.getContent());
      // use the following for qooxdoo versions <= 0.6.7:
      // alert(e.getData().getContent());
    });

    // Sending
    req.send();

Please post questions to [our mailinglist](http://lists.sourceforge.net/lists/listinfo/qooxdoo-devel).
