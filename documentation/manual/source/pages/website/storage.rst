Client-side Storage
*******************


A universal cross-browser storage API exists that offers client-side key-value pair storage. Most of the `modern browsers <http://caniuse.com/#search=web%20storage>`_ support the `WebStorage API <https://developer.mozilla.org/en/DOM/Storage>`_. There also is a fallback implementation for IEs below version 8 based on `userData <http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx>`_. For all other runtimes, a fallback exists in the form of an in-memory storage. While the latter means you don't store the data in a persistent way, you still have the benefit of using the same API to access the storage.



API
---
The API is closely aligned with the native WebStorage API and offers some convenience on top of that. The main class for you to use is ``qx.bom.Storage`` and comes with three different implementation classes, one for each of the three implementations mentioned. Those implementations can be found in the ``qx.bom.storage`` namespace.

Basic Usage
###########
To get an idea of the basic API please have a look at the `API docs <http://demo.qooxdoo.org/%{version}/website-api/index.html#Storage>`_, the `MDC page <https://developer.mozilla.org/en/DOM/Storage>`_ or the `W3C specification <http://dev.w3.org/html5/webstorage/>`_.

Convenience on top
##################
We added an ``forEach`` method, which can be used to execute a function for every stored item.

::

  q.localStorage.forEach(function(key, value) {
    // ... do whatever you want
  });

API for %{Desktop} and %{Mobile}
################################
There is also an static API which can be used in %{Desktop} and %{Mobile}. Just take a look at the API docs for `qx.bom.Storage <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.bom.Storage>`_ for more details.

Simple example
--------------
Here is a simple example: a counter that keeps track of how often you visited the page.

::

  // load the number and parse it
  var number = parseInt(q.localStorage.getItem("my-number-name"), 10) || 0;
  // increment the number by one
  number++;
  // write back the number
  q.localStorage.setItem("my-number-name", number);
