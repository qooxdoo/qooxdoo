Higher-level requests
*********************

Choosing an appropriate transport
=================================

qooxdoo ships with two transport methods, interfaced by ``qx.io.request.Xhr`` and ``qx.io.request.Jsonp``.

* Choose ``Xhr`` whenever you can. ``Xhr`` offers true HTTP client functionality and exposes metadata associated with HTTP requests. It is agnostic of the data interchange format and does not make any specific demands on the backend.

* If you are making cross-origin requests and need to support all popular browsers and/or the target server is not configured to accept cross-origin request (``Access-Control-Allow-Origin`` header), you will need to use ``Jsonp``. Only JSON is supported as data interchange format and the backend needs to to wrap responses in a JavaScript function call.

``Xhr`` and ``Jsonp`` share a common interface. ``AbstractRequest`` defines the lowest common denominator of both transport methods.

Basic Setup
===========

Before a request can be send, it must be configured. Configuration is accomplished by setting properties. The most commonly used properties include:

* **url** (mandatory): The HTTP resource to request
* **method**: The HTTP method, sometimes also referred to as HTTP verb. ``Script`` only accepts the ``GET`` method.
* **requestData**: Data to be send as part of the request.
* **requestHeaders**: Headers to send with the request

For a complete list of properties, please refer to the API Documentation of `qx.io.request <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.io.request>`_:

::

  // Instantiate request
  var req = new qx.io.request.Xhr();

  // Set URL (mandatory)
  req.setUrl("/books");

  // Set method (defaults to GET)
  req.setMethod("POST");

  // Alternative notation
  // var req = new qx.io.request.Xhr("/books", "POST");

  // Set request data. Accepts String, Map
  // or qooxdoo Object.
  req.setRequestData({"title": "The title"});

  // Send request
  req.send();

Events and states
=================

Once a request is sent using the ``send()`` method, it traverses various states. There are two ways to query the current state of the request.

* **readyState**: An integer (0-4) representing UNSENT, OPENED, HEADERS_RECEIVED, LOADING and DONE.

* **phase**: Symbolic state mapping to deterministic events (success, abort, timeout, statusError) and intermediate readyStates (unsent, configured, loading)

Events are fired when the request is progressing from one state to the other. The most important events include:

* **load**: Request completed successfully.
* **success**: Request completed successfully (like ``load``) *and* the response can be expected to contain the kind of data requested. For ``Xhr`` this means the HTTP status of the response indicates success (e.g. ``200``). For ``Jsonp``, the script received executed the expected callback.
* **statusError**: Request completed successfully (like ``load``) *but* the additional requirements for ``success`` are not met. For ``Xhr`` this event is typically fired when the server reports that an erroneous or unknown resource was requested (e.g. ``500`` or ``404``). For ``Jsonp``, this event is associated with an invalid response for whatever reasons.
* **fail**: Any kind of error occurred. Catches distinct events ``error``, ``statusError`` and ``timeout``.

For a complete list of events, please refer to the API Documentation of `qx.io.request <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.io.request>`_:

::

  req.addListener("success", function(e) {
    var req = e.getTarget();
    var response = req.getResponse();
    this.doSomething(response);
  }, this);

  // Send request
  req.send();

Response
========

Once the request completed, a range of properties (accessible via a getter) are populated.

* **response**: Response processed according to content type (``Xhr``) or as JSON (``Jsonp``).
* **responseText**: Raw, unprocessed response (``Xhr`` only).
* **status**: The numerical status of the response. For ``Xhr`` the status is the HTTP status. ``Jsonp`` only knows ``200`` (when callback was executed) and ``500`` (when it was not).

Additionally, when working with an instance of ``Xhr``, the following methods are available.

* **getResponseHeader(header)**
* **getAllResponseHeaders()**

Parsing
=======

.. note::
   This section applies to ``Xhr`` only. For ``Jsonp``, the JSON data interchange format is always assumed.

By default, ``response`` is populated with the response parsed according to the response content type. For the built-in parsers, parsing results in a JavaScript object.

The content type is read from ``Content-Type`` response header. If the response content type is unrecognized, no parsing is done and ``response`` equals ``responseText``. Parsers associated to a content type are:

* **JSON**: application/json
* **XML**: application/xml

The parser can be explicitly set with ``setParser()``. This can be useful if the content type returned from the backend is wrong or the response needs special parsing. The setter accepts either a symbolic string (``"json"`` or ``"xml"``) or a function. If a function is given, this function is called once the request completes. It receives the raw response as first argument. The return value determines the ``response``.

Some backends send distinct *representations* of the same resource depending on the content type accepted. For instance, a backend may respond with either a JSON, XML or a HTML representation while requesting the *same* URL. By default, requests accept every content type. In effect, the backend will respond with it's default representation. If the backend has no default representation, it may respond with the status code ``406`` (Not Acceptable). In order to choose a representation, set the accepted response content type with ``setAccept()``. It is a good practice to always set the preferred representation to guard against possible changes of the backend’s default behavior.
