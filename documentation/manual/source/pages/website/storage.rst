Client-side Storage
*******************


.. note::

  This document is outdated and does not reflect the proposed way of working with %{Website}. The storage module is still under development. As soon as the module is ready, this document will be updated as well.




A universal cross-browser storage API exists that offers client-side key-value pair storage. Most of the `modern browsers <http://caniuse.com/#search=web%20storage>`_ support the `WebStorage API <https://developer.mozilla.org/en/DOM/Storage>`_. There also is a fallback implementation for IEs below version 8 based on `userData <http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx>`_. For all other runtimes, a fallback exists in the form of an in-memory storage. While the latter means you don't store the data in a persistent way, you still have the benefit of using the same API to access the storage.



API
---
The API is closely aligned with the native WebStorage API and offers some convenience on top of that. The main class for you to use is ``qx.bom.Storage`` and comes with three different implementation classes, one for each of the three implementations mentioned. Those implementations can be found in the ``qx.bom.storage`` namespace.

Basic Usage
###########
To get an idea of the basic API please have a look at the `API docs <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.bom.Storage>`_, the `MDC page <https://developer.mozilla.org/en/DOM/Storage>`_ or the `W3C specification <http://dev.w3.org/html5/webstorage/>`_.

Convenience on top
##################
We added an ``forEach`` method, which can be used to execute a function for every stored item.

::

  var storage = qx.bom.Storage.getLocal();
  storage.forEach(function(key, value) {
    // ... do whatever you want
  });

Simple example
--------------
Here is a simple example: a counter that keeps track of how often you visited the page.

::

  // get the local storage object
  var storage = qx.bom.Storage.getLocal();
  // load the number and parse it
  var number = parseInt(storage.getItem("my-number-name"), 10) || 0;
  // increment the number by one
  number++;
  // write back the number
  storage.setItem("my-number-name", number);
