.. _pages/webite_overview#overview:

%{Website} Overview
===================

This page is an overview of %{Website}'s capabilities. It does collect the existing documentation and tries to show the big picture.


.. _pages/webite_overview#basic:

Basic Concept
*************
The basic concept is simple. %{Website} offers one global object called ``q`` (short for query). This global object's main task is to query the DOM using selectors and offer convenience methods on the returned collection of elements.

::

  q("#test").setStyle("color", "red");

As you can see in the example above, %{Website}'s idea of API design is to have an explicit API with a clear scope and readable names. In most cases, methods come in pairs: a getter and a setter. Another API concept is chaining:

::

  q("#test").setStyle("color", "red").appendTo(document.body);

Unless noted otherwise, methods return the collection for chaining, such as the setStyle method in the example. It returns the collection created with ``q("#test")`` on which the append method is called.

``q`` also offers static utility functions. These functions are usually attached to q in its own sub object. Lets take a look at a sample:

::

  q.type.get(123); // returns "Number"

The sub object, which could also be called a namespace, in the sample is ``type`` and contains a function ``get`` to determinate the type of a give argument.

The code base of ``q`` is build in modules, as you can see in the `API viewer for %{Desktop} <http://demo.qooxdoo.org/%{version}/apiviewer#qx.module>`__. Using the generator, you can build your own library containing only the modules you need. The same way, it is possible to include your own modules into a single, optimized file. Take a look at the :ref:`Documentation of the %{Website} skeleton <pages/development/skeletons#website>`.


.. _pages/webite_overview#api:

API Documentation
*****************
The best documentation is found in the `API viewer <http://demo.qooxdoo.org/%{version}/website-api>`__ for %{Website}. It offers a detailed documentation of all available methods, sorted into modules.


CSS Selector Support
********************
%{Website} uses the same CSS selector engine like jQuery which is called `Sizzle <http://sizzlejs.org>`__. Please check the `Sizzle Documentation <https://github.com/jquery/sizzle/wiki/Sizzle-Home>`__ for more details.

::

  q("#id"); // query for id
  q("div"); // query for all div's


Plugins
*******

%{Website} supports a plugin mechanism. All modules are written as %{Website} plugins. For further details about how to write plugins, take a look at the :doc:`plugins documentation </pages/website/plugins>`

.. _pages/website/overview#included_modules:

Included Modules
****************

Animation
---------
Animations can enhance the user experience and can help to create appealing and natural behaving user interfaces. With modern browsers CSS animations and transforms are opening a new way of realizing this in an efficient way. No need to do it programmatically in JavaScript.

To use animations with %{Website} you can use the animation module. This is a cross-browser wrapper for CSS animations and transforms with the goal to align closely to the spec wherever possible. If no CSS animations are supported, a JavaScript solution will work in place offering the same API and almost the same functionality as the CSS based solution.

For further details, take a look at the :doc:`Animations and Transforms documentation </pages/website/css3animation>`

::

  q("#test").fadeIn();


Attributes
----------
%{Website} offers an easy and elegant way to manipulate attributes and properties of DOM elements. This contains also setting the HTML content of an element.

::

  // sets the HTML content
  q("#test").setHtml("<h2>TEST</h2>");
  // returns the value of the placeholder attribute
  q("#test").getAttribute("placeholder");


CSS
---
Working with CSS can be easy with the right help of %{Website}. The CSS module includes a lot of convenience helper to set styles, classes, or dimensions.

::

  // cross browser setting of the opacity
  q("#test").setStyle("opacity", 0.5);
  // checks if 'myClass' is applied
  q("#test").hasClass("myClass");


Environment
-----------
%{Website} covers most of the cross browser issues. Still, the environment module offers a lot of information about the environment the app is running in. This includes simple checks like browser name to information about the application itself.

::

  // return "webkit" e.g.
  q.env.get("engine.name");
  // can be used to place debugging infomration
  q.env.get("qx.debug");


Manipulating
------------
The manipulating module offers help to change the structure of the DOM. Appending or creating elements is also part of this module as manipulating the scroll position.

::

  q("#test").setScrollTop(100);
  q("#test").empty(); // removes all content


Polyfill
--------
A polyfill is best explained by a quote from an explaining blog post:

  A polyfill, or polyfiller, is a piece of code (or plugin) that provides the technology that you, the developer, expect the browser to provide natively. Flattening the API landscape if you will. `What is a polyfill <http://remysharp.com/2010/10/08/what-is-a-polyfill/>`_

Which polyfills the module adds can be found in the API documentation of the module.


Template
--------
Templating is a powerful tool in web development. %{Website} uses mustache.js as its templating engine. For further information about that, see the documentation of `mustache.js <https://github.com/janl/mustache.js/>`_.

::

  // returns a collection containing the new element
  q.template.get("templateId", {data: "test"});

Traversing
----------
In the traversing module, you'll find helpers to work with the collection. One good sample is the filter method, which reduces the number of elements in the collection. Another big part of the module is go query for children, ancestors or siblings.

::

  // returns the children
  q("#test").getChildren();
  // returns all siblings having the class 'myClass'
  q("#test").getSiblings(".myClass");

Communication
-------------

Pulling data from remote sources is also one of the most common use cases and usually the next logical step when it comes to improving your existing JavaScript powered website / application. However, you expect that the underlying framework is providing you a nice abstracted cross-browser solution you can easily use. %{Website} offers you multiple implementations to pull data.

The first option is to use `XHR <http://en.wikipedia.org/wiki/XHR>`__. This browser API is widely used and %{Website} comes with :ref:`a wrapper of this API <pages/communication#low_level_requests>` which hides away inconsistencies and works around bugs.
The second option is to use `JSONP <http://en.wikipedia.org/wiki/JSONP>`__. With that approach you can overcome the `same orgin policy <http://en.wikipedia.org/wiki/Same_origin_policy>`__ and can talk to any server which is offering a JSON API like e.g `Twitter <https://dev.twitter.com/>`__ does. %{Website} is offering a :doc:`nice and powerful API </pages/communication/request_io>` with the same interface as the XHR transport to let you easily adapt any JSONP API out there.

::

  q.io.xhr(url).on("loadend", function(xhr) {});



Blocker
-------
The blocker module offers a way to block elements. This means that they don't receive any native event during the blocked time.

::

  q("#test").block();


Cookie
------
A convenient way to work with cookies is implemented in the cookie module. Setting, reading and deleting cookies is implemented in a cross browser way.

::

  q.cookie.set("key", "value");


Placement
---------
From time to time, it can be necessary to place an element right beside another one. Think about a popup message or tooltip which should offer some context sensitive help. For that, the placement module offers a method to place one element to another.

::

  q("#test").placeTo(target, "top-right");