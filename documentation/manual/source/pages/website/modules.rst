.. _pages/website/module_overview:

Module Overview
===============

This page gives a short introduction into each module with samples attached.
More samples can be found in the `API viewer
<http://demo.qooxdoo.org/%{version}/website-api>`__ for %{Website}.

Note that you always need the core module when you decide to use
the modules separately - which encloses all modules prefixed
with **"Core:"** in the following list.

Core
****
This module contains elementary static functions and furthermore consolidates
several other modules. Some of those elementary functions are:

::

  q("#myId")...

  q.define("MyObject", {
    construct : function() {},
    members : {
      method : function() {}
    }
  });

  q('.desc').map(function(elem) {
    return elem.parentNode;
  })


Core: Attributes
****************
%{Website} offers an easy and elegant way to manipulate attributes and
properties of DOM elements. This also includes setting the HTML content of an
element.

::

  // sets the HTML content
  q("#test").setHtml("<h2>TEST</h2>");
  // returns the value of the placeholder attribute
  q("#test").getAttribute("placeholder");


Core: CSS
*********
Working with CSS can be easy with the help of %{Website}. The CSS module
includes many convenient helpers to set styles, classes, or dimensions.

::

  // cross browser opacity setting
  q("#test").setStyle("opacity", 0.5);
  // checks if 'myClass' is applied
  q("#test").hasClass("myClass");


Core: Environment
*****************
%{Website} covers most cross browser issues. Still, the environment module
offers a lot of information about the environment the app is running in. This
includes simple checks like browser name as well as information about the
application itself.

::

  // returns e.g. "webkit"
  q.env.get("engine.name");
  // can be used to remove debugging code from the deployment version
  q.env.get("qx.debug");


Core: Event
***********
Of course there is also basic event handling available in %{Website}.

::

  q.ready(function() {
    // ready to go
  });

  q('#someElement').on('keyup', handleInput, this);


Core: Manipulating
******************
The manipulating module provides helpers to change the structure of the DOM.
Appending or creating elements is also part of this module, as is manipulating
the scroll position.

::

  q("#test").setScrollTop(100);
  q("#test").empty(); // removes all content


Core: Polyfill
**************
A polyfill is best explained by a quote from an informative blog post:

  *"A polyfill, or polyfiller, is a piece of code (or plugin) that provides the
  technology that you, the developer, expect the browser to provide natively.
  Flattening the API landscape if you will."* [#]_

A list of included polyfills can be found in the API documentation of the module.


Core: Traversing
****************
In the traversing module, you'll find helpers that work with the collection. A
good example is the filter method, which reduces the number of elements in the
collection. Other methods of this module will find children, ancestors or
siblings of the elements in the collection.

::

  // returns the children
  q("#test").getChildren();
  // returns all siblings having the class 'myClass'
  q("#test").getSiblings(".myClass");


Animation
*********
Animations can enhance the user experience and help create appealing and user
interfaces that feel natural. With modern browsers, CSS Animations and
Transforms are emerging as new way of efficiently realizing this goal. No need
to do it programmatically in JavaScript.

To use animations with %{Website}, you can use the animation module. This is a
cross-browser wrapper for CSS Animations and Transforms with the goal to conform
closely to the specifications wherever possible. If no CSS Animations are
supported, a JavaScript solution will work in place offering the same API and
almost the same functionality as the CSS based solution.

For further details, take a look at the :doc:`Animations and Transforms
documentation </pages/website/css3animation>`.

::

  q("#test").fadeIn();


Blocker
*******
The blocker module offers a way to block elements. This means they won't receive
any native events until they are unblocked.

::

  q("#test").block();


Cookie
******
A convenient way to work with cookies is implemented in the cookie module.
Setting, reading and deleting cookies is supported across browsers.

::

  q.cookie.set("key", "value");
  q.cookie.get("key");


Dataset
*******
With this module you can operate on HTML5 ``data-*`` attributes concerning
the elements in your current collection. It's a wrapper and polyfill around
the native HTML5 ``dataset`` property.

::

  q(".info a").setData("key", "value");
  q(".info a").getData("key");

Dev
***
Currently there is only one utility available under the dev namespace and that's
the FakeServer: A wrapper around `Sinon.JS’s FakeXMLHttpRequest and FakeServer
features <http://sinonjs.org/docs/#server>`__ that allows quick and simple
configuration of mock HTTP backends for testing and development. Head over to
the `%{Website} API viewer
<http://demo.qooxdoo.org/%{version}/website-api#dev.FakeServer>`__ to see a sample.


IO
**
Pulling data from remote sources is another one of the most common use cases and
usually the next logical step when it comes to improving your existing
JavaScript powered website / application. Of course, you expect the underlying
framework to provide you with a nice abstracted cross-browser solution that is
easy to use. %{Website} offers multiple implementations to pull data.

The first option is `XHR <http://en.wikipedia.org/wiki/XHR>`__. %{Website} comes
with :ref:`a wrapper around this widely used browser API
<pages/communication#low_level_requests>` which hides inconsistencies and works
around browser bugs.  The second option is to use `JSONP
<http://en.wikipedia.org/wiki/JSONP>`__. This approach enables you to overcome
`same orgin policy <http://en.wikipedia.org/wiki/Same_origin_policy>`__
restrictions and talk to any server which offers a JSON API like e.g `Twitter
<https://dev.twitter.com/>`__. %{Website} provides a :doc:`nice and powerful API
</pages/communication/request_io>` with the same interface as the XHR transport
to let you easily access any JSONP API out there.

::

  q.io.xhr(url).on("loadend", function(xhr) {});


Matchmedia
**********
A module for mediaqueries evaluation. This module is a wrapper for `media.match.js
<https://github.com/paulirish/matchMedia.js/>`__ that implements a polyfill for
``window.matchMedia`` when it's not supported natively.
::

  q.matchMedia("screen and (min-width: 480px)").matches // true or false


Media queries and css classes
*****************************
Adds screen size classes (e.g. small-only or medium-up) by pre-defined media queries using em. The range goes from small to medium, large and xlarge up to xxlarge:

+----------------+-----------------------+
| class name     | size                  |
+================+=======================+
| small          | 0em – 40em            |
+----------------+-----------------------+
| medium         | 40.063em – 64em       |
+----------------+-----------------------+
| large          | 64.063em – 90em       |
+----------------+-----------------------+
| xlarge         | 90.063em – 120em      |
+----------------+-----------------------+
| xxlarge        | 120.063em             |
+----------------+-----------------------+

The suffix of the class name indicates either that the current screen is larger than this size (-up) or in that range (-only).

::

   q.addSizeClasses();
   console.log(q("html").getClass());


Messaging
*********
The messaging module offers a message bus. It offers a separation by channel and
type and also offers a way to react on types for every channel.

::

  q.messaging.on("CHANNEL-X", "test", function() {
    // do something clever
  });
  q.messaging.emit("CHANNEL-X", "test");


Placeholder
***********
The placeholder module offers fallback implementation for placeholders. The
module offers two methods, one for updating all input and textarea elements on
the site and one for updating only the elements in the given collection

::

  // update all elements on the page
  q.placeholder.update();
  // update only the placeholder for the given element
  q("#nameInput").updatePlaceholder();

In case the executing browser supports native placeholders, those two method
calls won't do anything. This is only relevant for browsers not supporting
placeholders like IE < 10.


Placement
*********
Sometimes it can be necessary to place an element right beside another one.
Think about a popup message or tooltip offering some context sensitive help. The
placement module offers a method to place one element relative to another using
one of several algorithms and taking available space into account.

::

  q("#test").placeTo(target, "top-right");


REST
****
The rest module can be used to work against RESTful web-services in an elegant
way. Rather than requesting URLs with a specific HTTP method manually, a
resource representing the remote resource is instantiated and actions are
invoked on this resource.

::

  var resourceDesc = {
    "get": { method: "GET", url: "/photo/{id}" },
    "put": { method: "PUT", url: "/photo/{id}"}
  };
  var resource = q.rest.resource(resourceDesc);

  photo.get({id: 1});
  photo.put({id: 1}, {title: "Monkey"});


Storage
*******
The storage module offers a cross browser way to store data offline. For that,
it uses the `Web Storage API <http://www.w3.org/TR/webstorage/>`_. If That's
not available (i.e. in IE < 8) a fallback is used. If non of the storage API is
available, a non persistent in memory storage is returned which means you can
always use the same API. Check out the separate :doc:`page about storage
</pages/website/storage>` for more details.

::

  var value = q.localStorage.get("my_custom_key");


Template
********
Templating is a powerful tool in web development. %{Website} uses mustache.js as
its templating engine. For further information, see the `mustache.js
documentation <https://github.com/janl/mustache.js/>`_.

::

  // returns a collection containing the new element
  q.template.get("templateId", {data: "test"});


Transform
*********
The transform module offers a cross browser convenience API for CSS transforms.
This includes scaling, skewing, rotating and translating.

::

  q("#myId").rotate("45deg");


Util
****
As the name implies this module provides static utility functions for Strings and Arrays
and generic helpers e.g. for requesting the type of a value.

::

  // Strings
  q.string.startsWith("hamster", "ham"); // true
  q.string.camelCase("i-like-cookies");  // "ILikeCookies"

  // Arrays
  q.array.equals(["a", "b"], ["a", "b"]); // true
  q.array.unique(["a", "b", "b", "c"]);   // ["a", "b", "c"]

  // General
  q.type.get(val); // "String", "Array", "Object", "Function" ...


Widget
******
The Widget module contains a collection of self-contained UI elements. They can be created from pre-existing
HTML or entirely from JavaScript and customized by overwriting default rendering templates.
See the dedicated manual page for more information:

:ref:`%{Website} Widgets <pages/website/widgets#widgets>`

::

  // JS-only widget creation
  q.create('<div></div>').slider().appendTo(document.body);

  // Changing the configuration of an existing widget
  q(".qx-slider").setConfig("step", [2, 4, 8, 16, 32]).render();

  // Modifying an existing widget's rendering template
  q(".qx-slider")
  .setTemplate("knobContent", '<span id="knob-label">{{value}}</span>')
  .render();

  // Events
  q(".qx-slider").on("changeValue", function(value) {
    console.log("New slider value:", value);
  });

  // Disposal (clean up DOM references to prevent memory leaks)
  q(".qx-slider").dispose().remove();

------------

.. [#] `Remy Sharp, "What is a polyfill" <http://remysharp.com/2010/10/08/what-is-a-polyfill/>`__
