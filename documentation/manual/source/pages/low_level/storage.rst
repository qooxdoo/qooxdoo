Cross Browser Storage API
*************************

There is a cross browser storage API offering client side key-value pair storage for all browsers offering the `WebStorage API <https://developer.mozilla.org/en/DOM/Storage>`_ which are most of the `modern browsers <http://caniuse.com/#search=web%20storage>`_. But there is a fallback implementation based on `userData <http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx>`_ for IE < 8. For all other runtimes, we do have a fallback for a in memory storage. This of course means that you don't store the data in a persistent way but you can still and always use the same API to access the storage.



API
---
The API is aligned with the native WebStorage API and offers some convenience on top of that API. The main class you should use could be found in ``qx.bom.Storage`` and uses three different implementation classes for the three described implementations. These implementations can be found in the ``qx.bom.storage`` namespace.

Basic
#####
We won't go into much detail here because you can have a look at the `API-Docs <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.bom.Storage>`_, the `MDC page <https://developer.mozilla.org/en/DOM/Storage>`_ and the `W3C specification <http://dev.w3.org/html5/webstorage/>`_ to get an idea of the basic API.

Convenience on top
##################
We added a ``iterate`` method which can be used to execute a function for every stored item.

::

  var storage = qx.bom.Storage.getLocal();
  storage.iterate(function(key, value) {
    // ... do whatever you want
  });

Simple example
--------------
Here is a simple example which is a counter how often you have visited the side.

::

  // get the local storage object
  var storage = qx.bom.Storage.getLocal();
  // load the number and parse it
  var number = parseInt(storage.getItem("my-number-name") || 0);
  // increase the number by 1
  number++;
  // write back the number
  storage.setItem("my-number-name", number);
