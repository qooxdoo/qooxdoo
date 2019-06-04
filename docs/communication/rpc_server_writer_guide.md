RPC Server Writer Guide
=======================

Writing a new JSON-RPC server for use with qooxdoo is fairly easy. If you follow these rules, you should end up with a compliant implementation. See also the other [available qooxdoo RPC servers](http://qooxdoo.org/contrib/project#backend).

JSON
----

With the exception of the formatting of JavaScript `Date` objects, all communication between client and server is formatted as JSON, as described and documented at <http://json.org>.

### Date Objects

Date objects are a problem in standard JSON encoding, because there is no "literal" syntax for a date in JavaScript. In JavaScript, nearly everything can be represented in literal form: objects by `{ ... }`; arrays by `[ ... ]`; etc. The only native type which can not be represented as a literal is a Date. For this reason, a format for passing Dates in JSON is defined here so that all conforming servers can parse the data received from clients.

Date objects are sent as the following 'tokens'.

-   The string `new Date(Date.UTC(`
-   The **year**, integer, e.g. `2006`
-   A comma
-   The **month**, 0-relative integer, e.g. `5` is June
-   A comma
-   The **day** of the month, integer, range: `1-31`
-   A comma
-   The **hour** of the day on a 24-hour clock, integer, range: `0-23`
-   A comma
-   The **minute** of the hour, integer, range: `0-59`
-   A comma
-   The **second** within the minute, integer, range: `0-59`
-   A comma
-   The **milliseconds** within the second, integer, range: `0-999`
-   The string `))`

A resulting Date representation might therefore be:

    new Date(Date.UTC(2006,5,20,22,18,42,223))

#### Whitespace

-   when generating these date strings, implementations SHOULD NOT add white space before/after/between any of the fields within the date string
-   when parsing these date strings, implementations SHOULD allow white space before/after/between any of the fields within the date string

#### Numbers

-   when generating these date strings, implementations MUST NOT add leading zeros to the numeric values in the date string. Doing so will cause them to be parsed as octal values. Numbers MUST be passed in decimal (base 10) notation without leading zeros.
-   when parsing these date strings, implementations MUST take the integer value of numeric portions of the string as base 10 values, even if leading zeros appear in the string representation of the numbers..

Within the JSON protocol and in JSON messages between peers, `Date` objects are always passed as UTC.

RPC
---

Remote procedure calls are issued using JSON seralization. The basis for the objects used to send requests and responses are described and defined at <http://json-rpc.org>, specifically <http://json-rpc.org/wiki/specification>. This document introduces a number of differences to that specification, based on real-life implementation discoveries and needs. This portion of this document is an edited version of the JSON-RPC specification.

### request (method invocation)

A remote method is invoked by sending a request to a remote service. The request is a single object serialized using JSON.

It has four properties:

-   `service` - A String containing the name of the service. The server may use this to locate a set of related methods, all contained within the specified service. The format of the supported service strings is up to the server implementation.
-   `method` - A String containing the name of the method to be invoked. The method must exist within the specified service. The format of the method string is up to the server implementation.
-   `params` - An Array of objects to pass as arguments to the method.
-   `id` - The request id. This can be of any type. It is used to match the response with the request that it is replying to. (qooxdoo always sends an integer value for id.)

### response

When the method invocation completes, the service must reply with a response. The response is a single object serialized using JSON.

It has three properties:

-   `result` - The Object that was returned by the invoked method. This must be `null` in case there was an error invoking the method.
-   `error` - An Error Object \<pages/rpc\_server\_writer\_guide\#the\_error\_object\> if there was an error invoking the method. It must be `null` if there was no error. Note that determination of whether an error occurred is based on this property being `null`, not on result being `null`. It is perfectly legal for both to be `null`, indicating a valid result with value `null`.
-   `id` - This must be the same id as the request it is responding to.

The Error Object
----------------

An error object contains two properties, `origin` and `code`:

### origin

`origin` - An error can be originated in four locations, during the process of initiating and processing a remote procedure call. Each possible origin is assigned an integer value, assigned to this property, as follows:

-   `1` = the server can return errors to the client
-   `2` = methods invoked by the server can return errors
-   `3` = Transport (e.g. HTTP) errors can occur
-   `4` = the client determined that an error occurred, e.g. timeout

A conforming server implementation MUST send value `1` or `2` and MAY NOT send any other value, for origin. A client may detect Transport or locally-ascertained errors, but a server will never return those.

### code

`code` - An integer error code. The value of code is hierarchically linked to origin; e.g. the same code represents different errors depending on the value of origin.

One of these values of code SHALL be sent if origin = `1`, i.e. if the server detected the error.

-   Error code, value `1`: Illegal Service The service name contains illegal characters or is otherwise deemed unacceptable to the JSON-RPC server.
-   Error code, value `2`: Service Not Found The requested service does not exist at the JSON-RPC server.
-   Error code, value `3`: Class Not Found If the JSON-RPC server divides service methods into subsets (classes), this indicates that the specified class was not found. This is slightly more detailed than "Method Not Found", but that error would always also be legal (and true) whenever this one is returned.
-   Error code, value `4`: Method Not Found The method specified in the request is not found in the requested service.
-   Error code, value `5`: Parameter Mismatch If a method discovers that the parameters (arguments) provided to it do not match the requisite types for the method's parameters, it should return this error code to indicate so to the caller.
-   Error code, value `6`: Permission Denied A JSON-RPC service provider can require authentication, and that authentication can be implemented such the method takes authentication parameters, or such that a method or class of methods requires prior authentication. If the caller has not properly authenticated to use the requested method, this error code is returned.

If origin = `2`, i.e. the application (invoked method) detected the error, the value of the code property is entirely by agreement between the invoking client and the and invoked method.

### message

`message` - A free-form textual message describing the error.

Other Errors
------------

Errors detected by the server which indicate that the received data is not a JSON-RPC request SHOULD be simple text strings returned to the invoker, describing the error. A web browser user who accidentally hits the URL of a JSON-RPC server should receive a textual, not Error Object, response, indicating that the server is expecting a JSON-RPC request.

Transport
---------

There are exactly two standard transport facilities potentially used by qooxdoo's qx.io.remote.Rpc class:

-   XmlHTTPRequest : The parameters of the remote procedure call are passed to the server using XmlHTTPRequest. The request will be issued using the `POST` method with `Content Type: application/json`. The data provided by the client will be the JSON-serialized request object. The JSON-serialized result object MUST be returned with `Content Type: application/json`. This transport will be used unless the request is issued as cross-domain.
-   Script : If the client application invokes a cross-domain request, the request will be issued by URL-encoding the request object and wrapping it in a `<script>` tag. The request uses the `GET` method with `Content Type: text/javascript`. The response to a request received via this method MUST be a call to the static method `qx.io.remote.transport.Script._requestFinished` with parameters of the script id (a copy of the value of the incoming parameter `_ScriptTransport_id`) and the JSON-serialized result object.

A server SHOULD issue an `Other Error` (textual reply) if it detects a method / content type pair other than the two supported ones.

Testing A New Server
--------------------

To validate that your new server is operating properly, the following test methods may be created at your server:

-   `echo` - Echo the one and only parameter back to the client, in the form: `Client said: [ <parameter> ]` where all text is literal except for `<parameter>`.
-   `sink` - Sink all data and never return. ("Never" is a long time, so it may be simulated by sleeping for 240 seconds.
-   `sleep` - Sleep for the number of seconds provided as the first parameter, and then return that parameter.
-   `getInteger` - Return the integer value `1`
-   `getFloat` - Return the floating point value `1/3`
-   `getString` - Return the string `"Hello world"`
-   `getArrayInteger` - Return an array containing the four integers `[ 1, 2, 3, 4 ]` in that order.
-   `getArrayString` - Return an array containing the four strings `[ "one", "two", "three", "four" ]` in that order
-   `getObject` - Return some arbitrary object
-   `getTrue` - Return the binary value `true`
-   `getFalse` - Return the binary value `false`
-   `getNull` - Return the value `null`
-   `isInteger` - Return `true` if the first parameter is an integer; `false` otherwise
-   `isFloat` - Return `true` if the first parameter is a float; `false` otherwise
-   `isString` - Return `true` if the first parameter is a string; `false` otherwise
-   `isBoolean` - Return `true` if the first parameter is either one of the boolean values `true` or `false`; return `false` otherwise.
-   `isArray` - Return `true` if the first parameter is an array; `false` otherwise
-   `isObject` - Return `true` if the first parameter is an object; `false` otherwise
-   `isNull` - Return `true` if the first parameter is the value `null`; `false` otherwise.
-   `getParams` - Echo all parameters back to the client, in received order
-   `getParam` - Echo the first parameter back to the client. This is a synonym for the `echo` method.
-   `getCurrentTimestamp` - Return an object which has two properties:
    -   `now`: An integer representing the current time in a native format, e.g. as a number of seconds or milliseconds since midnight on 1 Jan 1970.
    -   `json`: A Date \<pages/rpc\_server\_writer\_guide\#date\_objects\> object representing that same point in time

A test of all of the primitive RPC operations is available in the qooxdoo-contrib project RpcExample. The third tab provides a test of the operations using synchronous requests, and the fourth tab tests the operations using asynchronous requests. Note that the results are displayed in the debug log (in Firebug or in the debug console enabled by pressing `F7`). You can look for `true` as a result of each request.

A future test will validate that all returned values are as expected, and display a single "passed/fail" indication.
