.. _pages/fromjquery#from_jquery_to_qooxdoo:

From jQuery to qooxdoo
**********************

.. note::

  Please note that the features described here are still experimental, so the API may change in the future.



This article may be a good transition guide for experienced jQuery developers to work with qooxdoo. qooxdoo 0.8.2 and beyond supports a selector engine and an experimental collection handling, which is comparable to the feature set of `jQuery <http://jquery.com>`_ 1.3.2 and after.

For more info also see the following information:

* `Selector demo <http://demo.qooxdoo.org/devel/demobrowser/index.html#bom~Selector.html>`_
* `Selector API <http://demo.qooxdoo.org/devel/apiviewer/#qx.bom.Selector>`_
* `Collection API <http://demo.qooxdoo.org/devel/apiviewer/#qx.bom.Collection>`_



jQuery's $() Method
===================

jQuery's main method ``$()`` behaves different depending on the parameters supplied:

- Converting a DOM node into a collection
- Selecting a set of elements via CSS expression
- Processing HTML code and wrapping it into a collection
- Registering functions for being executed at document load

::

  $(domNode).doSomething();
  $("expression").doSomething();
  $("HTML <b>string</b>");
  $(initFunction);


The resulting jQuery object is an instance of ``qx.bom.Collection`` (or short a "collection") on the qooxdoo side. In general qooxdoo is intentionally a bit more verbose in terms of API, since it often is disadvantageous to use all too much implicit magic (a lesson learned from early qooxdoo).







1. Wrapping DOM Elements
========================

You create a collection in qooxdoo by invoking the static method ``qx.bom.Collection.create`` with an existing DOM node:

::

  var coll = qx.bom.Collection.create(li);   // qooxdoo


This is basically the same as the following jQuery code:

::
  
  var coll = $(li);   // jQuery


Like jQuery, qooxdoo's collection supports an array as first argument, where each element of the array is an existing DOM node:

::

  var coll = qx.bom.Collection.create([li1, li2, li3]);   // qooxdoo



2. CSS Selector Engine
======================

It is also possible to select DOM elements by a CSS selector. qooxdoo uses exactly the same powerful `Sizzle <http://sizzlejs.org>`_ engine as jQuery. So the feature set is almost identical.

In jQuery you may select all ``h2`` and ``h3`` headers by doing this:

::

  var headers = $("h2,h3");   // jQuery


In qooxdoo you use the static method ``qx.bom.Collection.query``, which expects a CSS like selector. This is how the code in qooxdoo to query the document for h2 and h3 headers looks like:

:: 

  var headers = qx.bom.Collection.query("h2,h3");   // qooxdoo






3. HTML Parser
==============

In jQuery it is possible to reuse existing HTML. The result may be further processed by the methods on the jQuery object.

:: 
  
  var obj = $("<b>Some HTML</b>");   // jQuery


In qooxdoo the same is achieved by having the collection parse HTML:

::

  var obj = qx.bom.Collection.create("<b>Some HTML</b>");   // qooxdoo


A more explicit way to parse HTML is to use the static method ``qx.bom.Collection.html``, so you could also say:

::

  var obj = qx.bom.Collection.html("<b>Some HTML</b>");   // qooxdoo


Internally, ``create`` uses ``html`` when the first parameter is a valid HTML string.



4. Load Event Registration
==========================

To attach load events simply use qooxdoo's regular event registration. There is no convenience handling for this on the selector or collection classes. First the code for jQuery:

::

  // jQuery (Variant 1)
  $(function() {
    alert("executed at load");
  });


As this is also a shorthand in jQuery, here the same code when using the classical variant:

::

  // jQuery (Variant 2)
  $(window).ready(function() {
    alert("executed at load");
  });


In qooxdoo you do it the familiar way:

::

  // qooxdoo
  qx.event.Registration.addListener(window, "ready", function() {
    alert("executed at load");
  });






Collection Features
===================

::
  
  // Every listed qooxdoo method is a method of qx.bom.Collection
  // Look below for some short examples
  var allDivElements = qx.bom.Collection.query("div");
  var howMany = allDivElements.length;
  var indexOfElement = allDivElements.indexOf(aDivElement);






Basics
======


.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Detect the length of a collection
      - size() / length
      - length
    * - Get an element by index
      - get(0)
      - [0]
    * - Get elements as array
      - get()
      - toArray()
    * - Iterate over items
      - each(callback)
      - forEach(callback, context)
    * - Get the index of an element
      - index(elem)
      - indexOf(elem)


* qooxdoo uses native methods if possible. Current browsers implement them with a performance superior to the handwritten code. The names ``forEach()``, ``indexOf()`` and others, are also the names of these methods on native Arrays. This reduces the learning curve for new JavaScript developers as only one API has to be understood.
* ``forEach()`` comes with the arguments ``callback`` and ``obj``, where ``callback`` is the method to execute and ``obj`` is the context in which it should be executed. In jQuery the method is called ``each()`` and has only a ``callback`` argument, not allowing to define the context in which the method is executed. Actually it is executed in the context of the current item. So this is always the "current" element, whereas in qooxdoo this is the first argument sent to the callback function.
* get() jquery function can get the last element with a negative argument passed to it: get(-1), while in qooxdoo indexOf() method has a fromIndex as second argument making it more suited in case of large collections.



Attributes
==========

General
^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Read an attribute
      - attr(name)
      - `getAttribute(name) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~getAttribute>`_
    * - Set an attribute
      - attr(name, value)
      - `setAttribute(name, value) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~setAttribute>`_
    * - Set an attribute to a computed value
      - attr(name, function)
      - *Not supported*
    * - Set attributes
      - attr(map)
      - `setAttributes(map) <http://demo.qooxdoo.org/current/apiviewer/#qx.html.Element~setAttributes>`_
    * - Remove an attribute
      - removeAttr(name)
      - `resetAttribute(name) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~resetAttribute>`_

* qooxdoo distinguishes between setters and getters. In jQuery these two variants are usually melted into a single function, which decides about the action from the arguments given. This may be a problem when unintentionally ``undefined`` values are passed to these methods as these do not throw an error in this case.
* Each getter on a qooxdoo collection only returns the value of the first element of the collection. This is the same as in jQuery, except for the ``text()`` method, which concats the text content of all elements in the collection into one large string.

HTML
^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Get the HTML content
      - html()
      - `getAttribute("html") <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~getAttribute>`_
    * - Set the HTML content
      - html(value)
      - `setAttribute("html", value) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~setAttribute>`_

Text
^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Get the textual content
      - text()
      - `getAttribute("text") <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~getAttribute>`_
    * - Set the textual content
      - text(value)
      - `setAttribute("text", value) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~setAttribute>`_

Class
^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Add a class
      - addClass(classname)
      - `addClass(classname) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~addClass>`_
    * - Check for a class
      - hasClass(classname)
      - `hasClass(classname) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~hasClass>`_
    * - Remove class
      - removeClass(classname)
      - `removeClass(classname) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~removeClass>`_
    * - Toggle class
      - toggleClass(classname)
      - `toggleClass(classname) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~toggleClass>`_
    * - Toggle class based on switch
      - toggleClass(classname, toggle)
      - `toggleClass(classname, toggle) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~toggleClass>`_


* jQuery's ``hasClass()`` checks if at least one class in the collection matches the given class name, whereas in qooxdoo (consistent with the way all getters work), only queries the first element. Both return Boolean values. As an alternative to jQuery's method you may call the method ``is()`` instead, which exists in both frameworks with a comparable implementation.

Value
^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Read a value
      - val()
      - `getValue() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~getValue>`_
    * - Set a value
      - val(value)
      - `setValue(value) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~setValue>`_









CSS
===

Style
^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Reading a style
      -  css(name)
      -  `getStyle(name) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~getStyle>`_
    * -  Setting a style
      -  css(name, value)
      -  `setStyle(name, value) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~setStyle>`_
    * -  Setting styles
      -  css(map)
      -  `setStyles(map) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~setStyles>`_


Position
^^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * -  Get absolute position to document
      -  offset()
      - `getOffset() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~getOffset>`_
    * - Get the offset parent
      - offsetParent()
      - `getOffsetParent() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~getOffsetParent>`_
    * - Get position in relation to offset parent
      - position()
      - `getPosition() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.element.Location~getPosition>`_
    * - Get vertical scroll position
      - scrollTop()
      - `getScrollTop() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~getScrollTop>`_
    * - Set vertical scroll position
      - scrollTop(value)
      - `setScrollTop(value) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~setScrollTop>`_
    * - Get horizontal scroll position
      - scrollLeft()
      - `getScrollLeft() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~getScrollLeft>`_
    * - Set horizontal scroll position
      - scrollLeft(value)
      - `setScrollLeft(value) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~setScrollLeft>`_



Dimension
^^^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Returns the rendered width
      - width()
      - `getContentWidth() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.element.Dimension~getContentWidth>`_
    * - Configures the width
      - width(value)
      - `setStyle("width", value+"px") <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~setStyle>`_
    * - Returns the rendered height
      - height()
      - `getContentHeight() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.element.Dimension~getContentHeight>`_
    * - Configures the height
      - height(value)
      - `setStyle("height", value+"px") <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~setStyle>`_
    * - Returns the inner width
      - innerWidth()
      - *see notes*
    * - Returns the inner width
      - innerHeight()
      - *see notes*
    * - Returns the outer width
      - outerWidth()
      - `getWidth() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.element.Dimension~getWidth>`_
    * - Returns the inner width
      - outerHeight()
      - `getHeight() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.element.Dimension~getHeight>`_



* There are a few differences between the APIs of qooxdoo and jQuery here. The ``width()`` method of jQuery returns the content width, qooxdoo's ``getWidth()`` returns the box width instead (think of the "user-visible" width). The content width in qooxdoo is available from the method ``getContentWidth()``. The box width in jQuery is available via ``outerWidth()``.
* jQuery has a few more convenience methods, but they are typically used less often. The inner width in jQuery is basically the content width plus left and right padding. The outer width in jQuery also supports an optional flag to respect the margin as well (margin box). You can calculate both dimensions quite easily using ``qx.bom.element.Style.get()``.





Traversing
==========

Collection modifiers are available to extend or filter the current collection and to create a new collection to be returned. The method ``end()`` exits the last extension or filter and returns the previous collection. This is especially useful when working with chaining.

Filtering
^^^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Filter by index
      - eq(index)
      - `eq(index) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~eq>`_
    * - Filter by selector
      - filter(selector)
      - `filter(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~filter>`_
    * - Filter by function
      - filter(function)
      - `filter(function) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~filter>`_
    * - Whether content matches expression
      - is(selector)
      - `is(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~is>`_
    * - Translate one collection into another
      - map(function)
      - `map(function, context?) <http://demo.qooxdoo.org/current/apiviewer/#qx.type.BaseArray~map>`_
    * - Remove elements matching the expression
      - not(selector)
      - `not(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~not>`_
    * - Select a subset of the collection
      - slice(start, end)
      - `slice(start, end) <http://demo.qooxdoo.org/current/apiviewer/#qx.type.BaseArray~slice>`_

* In qooxdoo the methods ``map()`` and ``slice()`` are implemented by the native ``Array`` methods and this way guarantee an optimal performance. There are a lot more functions available in qooxdoo, as most ``Array`` methods are simply inherited, e.g. ``splice()``, ``sort()``, etc.
* For the method ``hasClass()`` please have a look at the "Attributes" section above. Be aware that the qooxdoo implementation only works on the first element and this way is not equivalent to jQuery's implementation.

Finding
^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Add elements
      - add(selector)
      - `add(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~add>`_
    * - Get children matching the selector
      - children(selector)
      - `children(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~children>`_
    * - Closest parent that matches
      - closest(selector)
      - `closest(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~closest>`_
    * - Get all child nodes (non-recursive)
      - contents()
      - `contents() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~contents>`_
    * - Replace with matched children
      - find(selector)
      - `find(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~find>`_
    * - Replace with matched children
      - find(function)
      - *Not supported*
    * - Get next element
      - next(selector)
      - `next(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~next>`_
    * - Get all next elements
      - nextAll(selector)
      - `nextAll(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~nextAll>`_
    * - Get all next elements up to a limit 
      - nextUntil(selector)
      - *Not supported*
    * - Get parent element
      - parent(selector)
      - `parent(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~parent>`_
    * - Get all parent elements
      - parents(selector)
      - `parents(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~parents>`_
    * - Get all parent elements up to a limit
      - parentsUntil(selector)
      - *Not supported*
    * - Get previous element
      - prev(selector)
      - `prev(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~prev>`_
    * - Get all previous elements
      - prevAll(selector)
      - `prevAll(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~prevAll>`_
    * - Get all previous elements up to a limit
      - prevUntil(selector)
      - *Not supported*
    * - Get siblings
      - siblings(selector)
      - `siblings(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~siblings>`_


Chaining
^^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Goto previous collection
      - end()
      - `end() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~end>`_
    * - Merge current and previous collection
      - andSelf()
      - `andSelf() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~andSelf>`_







Content Manipulation
====================
 
Inserting
^^^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Append content to the inside
      - append(content)
      - `append(content) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~append>`_
    * - Prepend content to the inside
      - prepend(content)
      - `prepend(content) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~prepend>`_
    * - Append collection to given selector
      - appendTo(selector)
      - `appendTo(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~appendTo>`_
    * - Prepend collection to given selector
      - prependTo(selector)
      - `prependTo(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~prependTo>`_

* Please note that qooxdoo does not support adding ``tr`` elements directly to a ``table`` element as jQuery does. This reduces implementation overhead and it can easily be overcome if you use a ``tbody`` element as the parent and then ``append()`` or ``prepend()`` the ``tr`` elements.

Attaching
^^^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Insert content after
      - after(content)
      - `after(content) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~after>`_
    * - Insert content before
      - before(content)
      - `before(content) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~before>`_
    * - Insert collection after selector
      - insertAfter(selector)
      - `insertAfter(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~insertAfter>`_
    * - Insert collection before selector
      - insertBefore(selector)
      - `insertBefore(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~insertBefore>`_

Wrapping
^^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Wrap content around selected elements
      - wrap(content)
      - `wrap(content) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~wrap>`_
    * - Combine and wrap selected elements
      - wrapAll(content)
      - `wrapAll(content) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~wrapAll>`_
    * - Wrap inner of each element
      - wrapInner(content)
      - `wrapInner(content) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~wrapInner>`_
    * - Replace selected elements' parents within the document
      - unwrap()
      - *Not supported*

Replacing
^^^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Replace collection with given content
      - replaceWith(content)
      - `replaceWith(content) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~replaceWith>`_
    * - Replace given selector result with collection
      - replaceAll(selector)
      - `replaceAll(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~replaceAll>`_

Removing
^^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Remove collection from parent node(s)
      - detach(selector)
      - `remove(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~remove>`_
    * - Destroy collection from parent node(s)
      - remove(selector)
      - `destroy(selector) <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~destroy>`_
    * - Clear content of collection
      - empty()
      - `empty() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~empty>`_

Copying
^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Clone collection (and DOM nodes)
      - clone()
      - `clone() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~clone>`_












Effects
=======


The effects module in jQuery and qooxdoo are not so similar, so a comparison method for method is not the best way to describe them. The main function in jQuery to handle effects is animate().  Here are the arguments that you can pass to it:

- a map of properties and their values. ex: ``{width: 100,height: '200%',left: '+=100',opacity: 0.9}``. you can give absolute values ``{width: 100}``, and if the property is already at that value the effect does not run for that property, or you can give a relative value ``{left: '+=100'}``.
- a duration how long the effect will be running
- easing : the name of the function that will tell the effect how it will progress
- complete : the function that will be called when the effect is done
- step : a function that will be called on every step of the transition
- queue : a flag that will indicate if the effect will be added in the effect queue or will start immediately 
- specialEasing : defines special easing function for each property in effect. 

In qooxdoo, we have qx.fx.Base class which all effects extend, and if you want something custom, this is the one to build upon. Both have handy functions/classes for widely used effects:
``hide()``, ``show()``, ``toggle()``, ``fadeIn()``, ``fadeOut()``, ``fadeTo()``

An easy translation between the 2 fx modules is listed below:

- the map of properties in jQuery does not have a similar map in qooxdoo. The properties are specified in each effect class as considered fit for the effect. qx.fx.effect.core.Style works on a single property passed as argument in the constructor, qx.fx.effect.core.Scale works on top,left,width,height and fontSize properties declared internally.
-  duration is a property in qx.fx.Base so it can be set with setDuration() method.
-  easing is transition in qooxdoo and can be set with setTransition() in qx.fx.Base
-  complete is finish in qooxdoo and it is an event. you specify the jquery complete handler function like this: qx.fx.Base.addListener('finish',Func);
- step is update in qooxdoo and it is an event.
- in addition to these 2 events, qooxdoo has setup event, and you can handle it when the effect starts.
- queue. if you want to queue an effect in qooxdoo you would use qx.fx.queue.Queue class, and add the effect there. jQuery has some functions to handle the queue like queue() to get the effects left to run, dequeue() to execute the next effect in the queue, clearqueue() to remove all effects left in the queue. These functions are not found in qooxdoo's Queue class.
- specialEasing. not needed per se, as we define the transition function for each effect we create.

jQuery has a way to terminate all animations by setting jQuery.fx.off = true, also it has a way to specify the speed of the animations by jQuery.fx.interval, which unfortunately is a global one - the corresponding property in qooxdoo is fps and can be set per effect.

``stop()`` is the jQuery function to terminate animation, ``end()`` is the method for qooxdoo.
You can get all elements being animated by using :animated selector in jQuery only. qooxdoo has no such selector, one would have to manually keep a collection of these elements.










Utilities
=========

Both libraries have some useful functions that come in handy.

``jQuery.support`` has some properties to check for the existence of some browser featues/bugs. This was added in 1.3 replacing properties like ``jQuery.boxModel`` with ``jQuery.support.boxModel`` 

- ``qx.core.Environment.get("css.boxmodel")`` in qooxdoo. Many of these properties do not exist in qooxdoo, where each method hides this stuff from the user and takes care of browser inconsistencies on its own, without relying on such global properties. Here are some of them:

* ``jQuery.support.changeBubbles`` - change event bubbles up the DOM tree
* ``jQuery.support.cssFloat`` - name of the property containing the CSS float value is .cssFloat
* ``jQuery.support.hrefNormalized`` - .getAttribute() method retrieves the href attribute of elements unchanged or full URI
* ``jQuery.support.htmlSerialize`` - browser is able to serialize/insert <link> elements using the .innerHTML

There is also a browser property named jQuery.browser which can be replaced by qooydoos environment class.


Type utilities
^^^^^^^^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Checks if the object is Array
      - jQuery.isArray()
      - `qx.lang.Type.isArray() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Type~isArray>`_
    * - Checks if object has no keys
      - jQuery.isEmptyObject()
      - `qx.lang.Object.isEmpty() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Object~isEmpty>`_
    * - Checks if the object is a Function
      - jQuery.isFunction()
      - `qx.lang.Type.isFunction() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Type~isFunction>`_
    * - Cheks if the Object is a pure js object [ex: {}]
      - jQuery.isPlainObject()
      - `qx.lang.Type.isObject() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Type~isObject>`_
    * - Checks to see if the argument is a window
      - jQuery.isWindow()
      - *Not supported*
    * - Checks to see if a DOM node is within an XML document (or is an XML document)
      - jQuery.isXMLDoc()
      - *Not supported*
    * - Checks to see if the object is a Boolean
      - *Not supported*
      - `qx.lang.Type.isBoolean() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Type~isBoolean>`_
    * - Checks to see if the object is a Date
      - *Not supported*
      - `qx.lang.Type.isDate() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Type~isDate>`_
    * - Checks to see if the object is an Error
      - *Not supported*
      - `qx.lang.Type.isError() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Type~isError>`_
    * - Checks to see if the object is a Number
      - *Not supported*
      - `qx.lang.Type.isNumber() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Type~isNumber>`_
    * - Checks to see if the object is a String
      - *Not supported*
      - `qx.lang.Type.isString() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Type~isString>`_
    * - Checks to see if the object is a RegExp
      - *Not supported*
      - `qx.lang.Type.isRegExp() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Type~isRegExp>`_

Other utilities
^^^^^^^^^^^^^^^

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Checks if a node is within another node
      - jQuery.contains()
      - `qx.dom.Hierarchy.contains <http://demo.qooxdoo.org/current/apiviewer/#qx.dom.Hierarchy~contains>`_
    * - Merge 2 objects into the first
      - jQuery.extend()
      - `qx.lang.Object.merge <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Object~merge>`_
    * - Merge 2 arrays into the first
      - jQuery.merge()
      - `qx.lang.Array.append <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Array~append>`_
    * - Execute some JavaScript code globally
      - jQuery.globalEval()
      - *Not supported*
    * - Filters an array
      - jQuery.grep()
      - `qx.type.BaseArray.filter <http://demo.qooxdoo.org/current/apiviewer/#qx.type.BaseArray~filter>`_
    * - Converts an array-like object to a true JS array
      - jQuery.makeArray()
      - `qx.lang.Array.toArray <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Array~toArray>`_
    * - Translate all items of an array to another array of items
      - jQuery.map()
      - `qx.type.BaseArray.map <http://demo.qooxdoo.org/current/apiviewer/#qx.type.BaseArray~map>`_
    * - Serializes an array/object into a query string
      - jQuery.param()
      - `qx.util.Serializer.toUriParameter <http://demo.qooxdoo.org/current/apiviewer/#qx.util.Serializer~toUriParameter>`_
    * - Parses a JSON object
      - jQuery.parseJSON()
      - `qx.lang.Json.parse() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Json~parse>`_
    * - Removes duplicates from array
      - jQuery.unique()
      - `qx.lang.Array.unique() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Array~unique>`_
    * - Trims a string
      - jQuery.trim()
      - `qx.lang.String.trim <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.String~trim>`_
    * - Returns the  internal JavaScript Class of an object
      - jQuery.type()
      - `qx.lang.Type.getClass() <http://demo.qooxdoo.org/current/apiviewer/#qx.lang.Type~getClass>`_


In jQuery there are 2 functions to serialize form data: .serialize(), which makes a string suited for submission out of the elements and their values, and .serializeArray() which makes an array out of them. The equivalent in qooxdoo is the model of the qx.data.controller.Form.

Last 2 functions in utilities are ``noop()`` - the function that does nothing and ``sub()`` which duplicates jQuery global variable in order to extend it without affecting the original jQuery object. No qooxdoo equivalent for these 2.







Events
======



Event module in the 2 libraries are similar, with few differences shown below:
* in jQuery there is a concept of adding an event to a collection in a "live" fashion - that means if the collection adds more elements to itself they automatically get the event handlers, no need for a new call to ``bind()``. this is represented by ``live()``, ``die()`` functions.

* in jQuery you can delegate an event to be caught and handled in a root of a set of elements with ``delegate()``. In qooxdoo this is default for certain events.
* ``jQuery.proxy()`` returns a function that will always have a particular context and this is used as event handlers so that you can be sure what ``this`` stands for. In qooxdoo ``proxy()`` function is not needed as the context is an argument for the addListener method and at that time you pass it.
* jquery has shortcuts for common events: ``blur()``, ``click()`` have ``addListener('blur',handler)`` and ``addListener('click'.handler)`` in qooxdoo as possible counterparts. Also, ``hover()`` and ``toggle()`` shortcuts get 2 handlers as arguments so that they can handle in & out states or hover and alternate clicks for toggle. Just handy shortcuts, nothing more.
* in jQuert there is support for ``stopImmediatePropagation`` with ``event.isImmediatePropagationStopped()`` and ``event.stopImmediatePropagation()``.

.. list-table::
    :header-rows: 1


    * - Description
      - jQuery
      - qooxdoo
    * - Attaches a handler for an event
      - jQuery.bind()
      - `addListener <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~addListener>`_
    * - Fires an event
      - jQuery.trigger()
      - `qx.event.Registration.fireEvent <http://demo.qooxdoo.org/current/apiviewer/#qx.event.Registration~fireEvent>`_
    * - Fires an event without fireing the native event
      - jQuery.triggerlHandler()
      - *Not supported*
    * - Attaches a handler once, then removes itself
      - .one()
      - `addListenerOnce() <http://demo.qooxdoo.org/current/apiviewer/#qx.core.Object~addListenerOnce>`_
    * - Removes a handler
      - .unbind()
      - `removeListener() <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.Collection~removeListener>`_
    * - Namespace of the event when it was fired
      - event.namespace
      - can be obtained through the context(this)
    * - Data to add to an event
      - event.data
      - *Not supported*
    * - Time when the event was fired
      - event.timeStamp
      - `qx.event.type.Event.getTimeStamp() <http://demo.qooxdoo.org/current/apiviewer/#qx.event.type.Event~getTimeStamp>`_
    * - Global error handler
      - .error()
      - `qx.event.GlobalError.setErrorHandler <http://demo.qooxdoo.org/current/apiviewer/#qx.event.GlobalError~setErrorHandler>`_



Data
====


jQuery has 2 method ``data()`` and ``removeData()`` to handle storage of arbitrary data associated with the matched elements. As of jQuery 1.4.3 HTML 5 data - attributes will be automatically pulled in to jQuery's data object that acts as the storage.
no qooxdoo API for it yet.