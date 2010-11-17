.. _pages/gui_toolkit/ui_decorators#decorators:

Decorators
**********

.. _pages/gui_toolkit/ui_decorators#introduction:

Introduction
============

Decorations are used to style widgets. The idea is to have an independent layer around the widget content that can be freely styled. This way you can have separate decorators that define all kinds of decoration (colors, background image, corners, ...), and apply them to existing widgets, without interfering with the widget code itself.

Decorations are used for both, the ``shadow`` and the ``decorator`` property. They could be applied separately or together. There is no dependency between them.

.. _pages/gui_toolkit/ui_decorators#using_decorators:

Using Decorators
================

Generally all decorators used should be part of the selected decorator theme. The convention is that each decorator instance is stored under a semantic name. To use names which describe the appearance of the decorator is bad because it may make themes less compatible to each other.

It is also regarded as bad style to make use of so-named inline decorators which are created by hand as part of a function call. The reason for this is that generally decorators defined by the theme may be used in multiple places. This means that widgets and application code should not directly deal with decorator instances.

.. _pages/gui_toolkit/ui_decorators#custom_decorators:

Custom Decorators
=================

Custom decorators are created by extending the decorator theme and adding new ones or overwriting existing ones. Each decorator class comes with a set of properties for configuration of the instance. Following a short description of the available decorators:

* **Background**: Renders a background image or color
* **Uniform**: Like ``Background``, but adds support for a uniform border which is identical for all edges.
* **Single**: Like ``Background``, but adds support for separate borders for each edge.
* **Double**: Like ``Single`` but with the option to add two separate border to each edge.
* **Beveled**: Pseudo (lightweight) rounded border with support for inner glow. May contain a background image / gradient.
* **Grid**: Complex decorator based on nine images. Allows very customized styles (rounded borders, alpha transparency, gradients, ...). Optionally make use of image sprites to reduce image number.

Each entry of the theme is automatically made available using the ``setDecorator``/``setShadow`` functions of the widget class. The instances needed are automatically created when required initially. This mechanism keeps instance numbers down and basically ignores decorators which are defined but never used.

.. _pages/gui_toolkit/ui_decorators#writing_decorators:

Writing Decorators
==================

It is easily possible to write custom decorators. `The interface <hhttp://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.IDecorator>`_ is quite trivial to implement. There are only five methods which needs to be implemented:

* ``getInsets``: Returns a map of insets (space the decorator needs) e.g. the border width
* ``getMarkup``: Returns the initial markup needed to build the decorator. This is executed by each widget using the decorator. This method may not be used by some decorators and this way is defined as an empty method.
* ``init``: Normally used to initialize the given element using ``getMarkup``. Only executed once per element (read per widget).
* ``resize``: Resizes the given element to the given dimensions. Directly works on the DOM to manipulate the content of the element.
* ``tint``: Applies the given background color or resets it to the (optionally) locally defined background color. This method may not be used by some decorators and this way is defined as an empty method.

One thing to additionally respect is that ``resize`` and ``tint`` should be as fast as possible. They should be as minimal as possible as they are executed on every switch to the decorator (e.g. hover effects). All things which are possible to do once, in ``getMarkup`` or ``init`` methods, should be done there for performance reasons. Decorators are regarded as imutable. Once they are used somewhere there is no need to be able to change them anymore.

Each decorator configuration means exactly one decorator instance (created with the first usage). Even when dozens of widgets use the decorator only one instance is used. To cache the markup is a good way to improve the initial time to create new element instances. These configured elements are reused e.g. a hover effect which moves from "Button 1" to "Button 2" uses the same DOM element when reaching "Button 2" as it has used in "Button 1". This way the number of DOM elements needed is reduced dramatically. Generally each decorator instance may be used to create dozens of these elements, but after some time enough elements may have been created to fulfill all further needs for the same styling.