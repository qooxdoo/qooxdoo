.. _pages/website/widgets#widgets:

%{Website} Widgets
******************

The Widgets module provides a set of UI components designed to be integrated in existing web pages. This page describes the different ways in which widgets can be created and initialized, and provides an overview of how to customize their behavior and appearance. See the `%{Website} Widget Browser <http://demo.qooxdoo.org/current/websitewidgetbrowser>`_ for demos of all available widgets, and the `%{Website} API Viewer <http://demo.qooxdoo.org/current/website-api>`_ for detailed information on how to work with each widget.

Like in %{Website} Core, the main concept behind %{Website} Widgets is the collection: An array-like object that contains one or more DOM elements and exposes a set of methods to manipulate them. Each available widget extends %{Website} Core, adding its own methods and initialization logic on top.

Creating widgets and working with widget collections
----------------------------------------------------

There are two ways in which widgets can be initialized, supporting different use cases:

Widget factory methods
======================

Any collection of DIV elements can be turned into a widget collection by calling a widget factory method:

::

  q(".foo").slider();

This will turn any elements matching the CSS selector into Slider widgets. Required child elements such as the slider's knob will be created if they're not already present.

Widget collections support all standard collection methods from %{Website} Core:

::

  q(".foo").slider().setStyle("background-color", "blue");

Additionally, the widget's own methods are now available:

::

  q(".foo").slider();
  q(".foo").setValue(100);

As this example demonstrates, once an element has been intialized as a widget, it's not necessary to call the factory method again. A data attribute, `data-qx-class`, is added to each element to store the widget class, making sure new collections containing the widget's DOM element have the right type.

Note that the `data-qx-class` attribute of the *first element matching the selector* determines the type of the collection. Heterogenous collections are not supported.

HTML data attributes
====================

Alternatively, the `data-qx-class` attribute can be used to define a widget's type before it's initialized:

::

  <div id="foo" data-qx-class="qx.ui.website.Slider"></div>

This element can be turned into a Slider by calling the `init` method:

::

  q("#foo").init();

This can be useful in scenarios where the UI is defined by the (server-side) code that generates the HTML: The JavaScript code doesn't need to know about the different types of widgets so client-side logic can be kept to a minimum.

Widget initialization can be even more simple and generic. Multiple widgets of different types can be initialized all at once using the static `initWidgets` method:

::

  q.initWidgets();

This will query the document for any DOM elements with `data-qx-class` attributes and initialize them all.

Existing markup
---------------

Upon initialization, widgets will create the child elements they need. Additional elements will generally not be removed, so if this DIV element is turned into a Slider widget:

::

  <div id="foo">
    <h3>Hi, I'm a heading</h3>
  </div>

the Slider will insert its knob element after the existing H3 element.

Required child elements can also be predefined by using the CSS class names expected by the widget:

::

  <div id="foo">
    <button class="qx-slider-knob">Pre-existing button</button>
  </div>

In this case, the existing button element will be used as the Slider's knob. The `%{Website} API Viewer <http://demo.qooxdoo.org/current/website-api>`_ lists the class names used for the child elements.

Configuring widgets
-------------------

Each widget has its own set of configuration options. See the `%{Website} API Viewer <http://demo.qooxdoo.org/current/website-api>`_ for a list of available options and their default values.

Configuration methods
=====================

Options can be manipulated using the getConfig and setConfig methods:

::

  q(".qx-slider").setConfig("offset", 20);


HTML data attributes
====================

Default settings can also be overridden using HTML data attributes:

::

  <div data-qx-config-offset="20"></div>

If this element is turned into a Slider widget, its offset config setting will be set to 20. Note that
getConfig and setConfig use camelCased names while the data attributes are hyphenated and prefixed with "qx-config", i.e. "hideAnimation" vs. "data-qx-config-hide-animation".

Overriding templates
--------------------

Widgets use templates to render their UI. Much like configuration settings, templates can be overriden.

Template methods
================

::

  q(".qx-slider").setTemplate("knobContent", "<span>{{value}}</span>").render();

This will wrap the content of the Slider's knob in a span element when rendered. The value is a placeholder which will be replaced with the actual numerical value. Note the render() call: This triggers a UI update after a template was changed.

HTML data attributes
====================

Of course, templates can also be defined as HTML attributes, again using hyphenated names prefixed with "qx-template":

::

  <div id="slider1" data-qx-template-knob-content="<span>{{value}}</span>"></div>

Preventing memory leaks
-----------------------

If a widget is no longer needed, it must be disposed:

::

  q(".qx-slider").dispose();

This removes all event listeners and other cross-references between DOM nodes and JavaScript objects, making sure that the runtime's garbage collector can do its job properly.
