.. _pages/website/plugins:

Plugins
*******

%{Website} itself is build in separate modules. Each module offers a set of functionality combined by a common topic like CSS, Traversing or Animations. You can see a listing of all modules in the :ref:`overview <pages/website/overview#included_modules>`. These modules use the same plugin API that %{Website} offers to all its developer. All this API can be found in the `API reference <http://demo.qooxdoo.org/%{version}/website-api>`__ as well but on default, these methods are hidden and can be showed with the help of a little link on the top right corner.

Common - The Prefix
-------------------
You sure have noticed that all the plugin related methods do have one thing in common, all are prefixed with ``$``. 


Regular Plugins
---------------
The core module offers a plugin API to write common plugins. This is the default case and can be used to extend the static ``q`` object or the collections, returned by the ``q`` function call.

Extending the static object is easy by using the ``$attachStatic`` function, which offers a convenient way to attach static modules with conflict detection.

::

  // attach a new module
  q.$attachStatic({"doSomethingAwesome" : function() {}});
  
  // use the module
  q.doSomethingAwesome();

Extending the returned collection is more interesting but as easy as the first sample.

::

  // attach a new module
  q.$attach({"doSomethingAwesome" : function() {}});

  // use the module
  q("div").doSomethingAwesome();

In the attached method, you can access the collection using the ``this`` keyword. This means that you have access to all included methods and the items stored in the collection as well.


Event Normalization Plugins
---------------------------
Another kind of plugins are used to normalize events. %{Website} includes e.g. a normalization for Keyboard or Mouse events. The plugin API in that case is included in the events module and offers one important method.

::

  var normalizer = function(event, element) {};
  q.$registerEventNormalization(["click"], normalizer);

After adding that two lines of code, the normalizer will be called on every click which gives the plugin author the chance to attach additional information to the event.


HowTo
-----

Check out the :ref:`%{Website} skeleton <pages/development/skeletons#website>` included in the `SDK <http://qooxdoo.org/downloads>`__ to get a starting point. This makes it easy to write unit tests and documentation for your plugin.