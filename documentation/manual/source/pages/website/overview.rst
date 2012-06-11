.. _pages/webite_overview#overview:

%{Website} Overview
===================

This page is an overview of %{Website}'s capabilities. It collects the existing documentation and tries to show the big picture.


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

``q`` also offers static utility functions. These functions are usually attached to q in their own sub object. Let's take a look at a sample:

::

  q.type.get(123); // returns "Number"

The sub object (which could also be called a namespace) in the sample is ``type`` and contains a function ``get`` which will determine the type of a given argument.

The code base of ``q`` is organized in modules, as you can see in the `API viewer for %{Desktop} <http://demo.qooxdoo.org/%{version}/apiviewer#qx.module>`__. Using the generator, you can build your own library containing only the modules you need. Similarly, it is possible to include your own modules into a single, optimized file. Take a look at the :ref:`Documentation of the %{Website} skeleton <pages/development/skeletons#website>` to learn more.


.. _pages/webite_overview#api:

API Documentation
*****************
The best documentation is found in the `API viewer <http://demo.qooxdoo.org/%{version}/website-api>`__ for %{Website}. It offers a detailed documentation of all available methods, sorted into modules.


CSS Selector Support
********************
%{Website} uses the same CSS selector engine as jQuery, which is called `Sizzle <http://sizzlejs.org>`__. Please check the `Sizzle Documentation <https://github.com/jquery/sizzle/wiki/Sizzle-Home>`__ for more details.

::

  q("#id"); // query for id
  q("div"); // query for all div's


Plugins
*******

%{Website} supports a plugin mechanism. All modules are written as %{Website} plugins. For further details about how to write plugins, take a look at the :doc:`plugins documentation </pages/website/plugins>`.

.. _pages/website/overview#included_modules:

Included Modules
****************

Animation
---------
Animations can enhance the user experience and help create appealing and user interfaces that feel natural. With modern browsers, CSS Animations and Transforms are emerging as new way of efficiently realizing this goal. No need to do it programmatically in JavaScript.

To use animations with %{Website}, you can use the animation module. This is a cross-browser wrapper for CSS Animations and Transforms with the goal to conform closely to the specifications wherever possible. If no CSS Animations are supported, a JavaScript solution will work in place offering the same API and almost the same functionality as the CSS based solution.

For further details, take a look at the :doc:`Animations and Transforms documentation </pages/website/css3animation>`.

::

  q("#test").fadeIn();


Attributes
----------
%{Website} offers an easy and elegant way to manipulate attributes and properties of DOM elements. This also includes setting the HTML content of an element.

::

  // sets the HTML content
  q("#test").setHtml("<h2>TEST</h2>");
  // returns the value of the placeholder attribute
  q("#test").getAttribute("placeholder");


CSS
---
Working with CSS can be easy with the help of %{Website}. The CSS module includes many convenient helpers to set styles, classes, or dimensions.

::

  // cross browser opacity setting
  q("#test").setStyle("opacity", 0.5);
  // checks if 'myClass' is applied
  q("#test").hasClass("myClass");


Environment
-----------
%{Website} covers most cross browser issues. Still, the environment module offers a lot of information about the environment the app is running in. This includes simple checks like browser name as well as information about the application itself.

::

  // returns e.g. "webkit"
  q.env.get("engine.name");
  // can be used to remove debugging code from the deployment version
  q.env.get("qx.debug");


Manipulating
------------
The manipulating module provides helpers to change the structure of the DOM. Appending or creating elements is also part of this module, as is manipulating the scroll position.

::

  q("#test").setScrollTop(100);
  q("#test").empty(); // removes all content


Polyfill
--------
A polyfill is best explained by a quote from an informative blog post:

  A polyfill, or polyfiller, is a piece of code (or plugin) that provides the technology that you, the developer, expect the browser to provide natively. Flattening the API landscape if you will. `What is a polyfill <http://remysharp.com/2010/10/08/what-is-a-polyfill/>`_

A list of included polyfills can be found in the API documentation of the module.


Template
--------
Templating is a powerful tool in web development. %{Website} uses mustache.js as its templating engine. For further information, see the `mustache.js documentation <https://github.com/janl/mustache.js/>`_.

::

  // returns a collection containing the new element
  q.template.get("templateId", {data: "test"});

Traversing
----------
In the traversing module, you'll find helpers that work with the collection. A good example is the filter method, which reduces the number of elements in the collection. Other methods of this module will find children, ancestors or siblings of the elements in the collection.

::

  // returns the children
  q("#test").getChildren();
  // returns all siblings having the class 'myClass'
  q("#test").getSiblings(".myClass");

Communication
-------------

Pulling data from remote sources is another one of the most common use cases and usually the next logical step when it comes to improving your existing JavaScript powered website / application. Of course, you expect the underlying framework to provide you with a nice abstracted cross-browser solution that is easy to use. %{Website} offers multiple implementations to pull data.

The first option is `XHR <http://en.wikipedia.org/wiki/XHR>`__. %{Website} comes with :ref:`a wrapper around this widely used browser API <pages/communication#low_level_requests>` which hides inconsistencies and works around browser bugs.
The second option is to use `JSONP <http://en.wikipedia.org/wiki/JSONP>`__. This approach enables you to overcome `same orgin policy <http://en.wikipedia.org/wiki/Same_origin_policy>`__ restrictions and talk to any server which offers a JSON API like e.g `Twitter <https://dev.twitter.com/>`__. %{Website} provides a :doc:`nice and powerful API </pages/communication/request_io>` with the same interface as the XHR transport to let you easily access any JSONP API out there.

::

  q.io.xhr(url).on("loadend", function(xhr) {});



Blocker
-------
The blocker module offers a way to block elements. This means they won't receive any native events until they are unblocked.

::

  q("#test").block();


Cookie
------
A convenient way to work with cookies is implemented in the cookie module. Setting, reading and deleting cookies is supported across browsers.

::

  q.cookie.set("key", "value");


Placement
---------
Sometimes it can be necessary to place an element right beside another one. Think about a popup message or tooltip offering some context sensitive help. The placement module offers a method to place one element relative to another using one of several algorithms and taking available space into account.

::

  q("#test").placeTo(target, "top-right");