.. _pages/website/plugins:

Plugins
*******

The %{Website} library is built from separate modules. Each module offers a set of functionality covering a common topic like CSS, (DOM) Traversing or Animations. You can see a listing of all modules in the :ref:`overview <pages/website/overview#included_modules>`. These modules use the same plugin API that %{Website} offers to all developers. This developer API can be found in the `API reference <http://demo.qooxdoo.org/%{version}/website-api>`__ as well but by default, these methods are hidden and can be displayed using the little link in the top right corner.

Common - The Prefix
-------------------
Surely you've noticed that the plugin related methods have one thing in common: They're all prefixed with ``$``. 


Regular Plugins
---------------
The core module offers a plugin API to write common plugins. This is the default case and can be used to extend the static ``q`` object or the collections returned by the ``q`` function call.

Extending the static object is easily accomplished by using the ``$attachStatic`` function, which offers a convenient way to attach static modules with conflict detection.

::

  // attach a new module
  q.$attachStatic({"doSomethingAwesome" : function() {}});
  
  // use the module
  q.doSomethingAwesome();

Extending the returned collection is more interesting but just as easy as the first sample.

::

  // attach a new module
  q.$attach({"doSomethingAwesome" : function() {}});

  // use the module
  q("div").doSomethingAwesome();

In the attached method, you can access the collection using the ``this`` keyword. This means that you have access to all included methods and the items stored in the collection as well.


Event Normalization Plugins
---------------------------
Another kind of plugin is used to normalize events. %{Website} includes normalization for e.g. Keyboard or Mouse events. The plugin API for that use case is included in the events module and offers one important method.

::

  var normalizer = function(event, element) {};
  q.$registerEventNormalization(["click"], normalizer);

After adding these two lines of code, the normalizer will be called on every ``click`` event, giving the plugin author the chance to attach additional information to the event.


HowTo
-----

Check out the :ref:`%{Website} skeleton <pages/development/skeletons#website>` included in the `SDK <http://qooxdoo.org/downloads>`__ to get a starting point. This makes it easy to write unit tests and documentation for your plugin.