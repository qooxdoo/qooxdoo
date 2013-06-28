.. _pages/webite_overview#overview:

%{Website} Overview
===================

This page is an overview of %{Website}'s capabilities. It collects the existing
documentation and tries to show the big picture.


.. _pages/webite_overview#basic:


Basic Concept
*************

The basic concept is simple. %{Website} offers one global object called ``q``
(short for query). This global object's main task is to query the DOM using
selectors and offer convenience methods on the returned collection of elements.

::

  q("#test").setStyle("color", "red");

As you can see in the example above, %{Website}'s idea of API design is to have
an explicit API with a clear scope and readable names. In most cases, methods
come in pairs: a getter and a setter. Another API concept is chaining:

::

  q("#test").setStyle("color", "red").appendTo(document.body);

Unless noted otherwise, methods return the collection for chaining, such as the
setStyle method in the example. It returns the collection created with
``q("#test")`` on which the append method is called.

``q`` also offers static utility functions. These functions are usually attached
to q in their own sub object. Let's take a look at a sample:

::

  q.type.get(123); // returns "Number"

The sub object (which could also be called a namespace) in the sample is
``type`` and contains a function ``get`` which will determine the type of a
given argument.

The code base of ``q`` is organized in modules, as you can see in the `API
viewer for %{Desktop}
<http://demo.qooxdoo.org/%{version}/apiviewer#qx.module>`__. Using the
generator, you can build your own library containing only the modules you need.
Similarly, it is possible to include your own modules into a single, optimized
file. Take a look at the :ref:`Documentation of the %{Website} skeleton
<pages/development/skeletons#website>` to learn more.


.. _pages/webite_overview#api:


API Documentation
*****************

The best documentation is found in the `API viewer
<http://demo.qooxdoo.org/%{version}/website-api>`__ for %{Website}. It offers a
detailed documentation of all available methods, sorted into modules.


CSS Selector Support
********************

%{Website} uses the same CSS selector engine as jQuery, which is called `Sizzle
<http://sizzlejs.org>`__. Please check the `Sizzle Documentation
<https://github.com/jquery/sizzle/wiki/Sizzle-Home>`__ for more details.

::

  q("#id"); // query for id
  q("div"); // query for all div's


Plugins
*******

%{Website} supports a plugin mechanism. All modules are written as %{Website}
plugins. For further details about how to write plugins, take a look at the
:doc:`plugins documentation </pages/website/plugins>`.


Modules
*******

%{Website} is divided into several modules. Besides using a single all-in-one
%{Website} script file (e.g. ``q-%{version}.min.js``), which contains **every
module**, you can also use the modules separately, i.e. only those modules you
need (%{Website} splitted in n files).  Note that you always need the core
module when you decide to use the modules separately. So for example you could
use ``q-core-%{version}.min.js``, ``q-animation-%{version}.min.js`` and
``q-cookie-%{version}.min.js`` together.
