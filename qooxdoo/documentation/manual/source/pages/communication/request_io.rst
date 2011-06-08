Higher-level requests
*********************

Choosing an appropriate transport
=================================

qooxdoo offers two transport methods, interfaced by ``qx.io.request.Xhr`` and ``qx.io.request.Jsonp``.

* Choose ``Xhr`` whenever you can. ``Xhr`` offers true HTTP client functionality and exposes metadata associated with HTTP requests. It is agnostic of the data interchange format and does not make any specific demands on the backend.

* If you are making cross-origin requests and need to support all popular browsers and/or the target server is not configured to accept cross-origin request (``Access-Control-Allow-Origin`` header), you will need to use ``Jsonp``. Only JSON is supported as data interchange format and the backend needs to to wrap responses in a JavaScript function call.

``Xhr`` and ``Jsonp`` share a common interface. ``AbstractRequest`` defines the lowest common denominator of both transport methods.

Basic Setup
===========

Before a request can be send, it must be configured. Configuration is accomplished by setting properties. The most commonly used properties include:

* **url** (mandatory): The HTTP resource to request
* **method**: The HTTP method, sometimes also referred to as HTTP verb. ``Script`` only accepts the ``GET`` method.
* **requestData**: Data to be send as part of the request.

For a complete list of properties, please refer to the API Documentation of `qx.io.request <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.io.request>`_:

Events and states
=================

Once a request is sent using the ``send()`` method, it traverses various states. There are two ways to query the current state of the request.

* **readyState**: An integer (0-4) representing UNSENT, OPENED, HEADERS_RECEIVED, LOADING and DONE.

* **phase**: Symbolic state mapping to deterministic events (success, abort, timeout, statusError) and intermediate readyStates (unsent, configured, loading)

Events are fired when the request is progressing from one state to the other. The most important events include:

* **load**: Request completed successfully.
* **success**: Request completed successfully (like ``load``) *and* the response can be expected to contain the kind of data requested. For ``Xhr`` this means the HTTP status of the response indicates success (e.g. ``200``). For ``Jsonp``, the script received executed the expected callback.
* **statusError**: Request completed successfully (like ``load``) *but* the additional requirements for ``success`` are not met. For ``Xhr`` this event is typically fired when the server reports that an invalid or unknown resource was requested. For ``Jsonp``, this event is associated with an invalid response for whatever reasons.
* **fail**: Any kind of error occured. Catches distinct events ``error``, ``statusError`` and ``timeout``.

For a complete list of events, please refer to the API Documentation of `qx.io.request <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.io.request>`_:

Querying the response
=====================

Once the request completed, a range of properties (accessible with a getter) are populated.

* **response** Response processed according to content type (``Xhr``) or as JSON (``Jsonp``).
* **responseText** Raw, unprocessed response (``Xhr`` only).
* **status**: The numerical status of the response. For ``Xhr`` the status is the HTTP status. ``Jsonp`` only knows ``200`` (when callback was executed) and ``500`` (when it was not).

Additionally, when working with an instance of ``Xhr``, the following methods are available.

* **getResponseHeader(header)**
* **getAllResponseHeaders()**

