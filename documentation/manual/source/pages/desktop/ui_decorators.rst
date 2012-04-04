.. _pages/desktop/ui_decorators#decorators:

Decorators
**********

.. _pages/desktop/ui_decorators#introduction:

Introduction
============

Decorations are used to style widgets. The idea is to have an independent layer around the widget content that can be freely styled. This way you can have separate decorators that define all kinds of decoration (colors, background image, corners, ...), and apply them to existing widgets, without interfering with the widget code itself.

Decorations are used for both, the ``shadow`` and the ``decorator`` property. They could be applied separately or together. There is no dependency between them.

.. _pages/desktop/ui_decorators#using_decorators:

Using Decorators
================

Generally all decorators used should be part of the selected decorator theme. The convention is that each decorator instance is stored under a semantic name. To use names which describe the appearance of the decorator is bad because it may make themes less compatible to each other.

It is also regarded as bad style to make use of so-named inline decorators which are created by hand as part of a function call. The reason for this is that generally decorators defined by the theme may be used in multiple places. This means that widgets and application code should not directly deal with decorator instances.


.. _pages/desktop/ui_decorators#decoration_theme:

Decoration Theme
================

As mentioned above, it is common to define the decorators in a decorator theme. This is really easy because you have to specify only a few details about the decorator.

::

  "main" :
  {
    decorator: qx.ui.decoration.Uniform,
  
    style :
    {
      width : 1,
      color : "background-selected"
    }
  },
  
The first thing you see is the name of the decorator, in this case, ``main``. The specified decorator is available using that name in the whole application code, especially in the appearance theme. The next thing you see in the map is the ``decorator`` key, that defines the decorator to use. The last thing is the styles map which contains values for the properties of the given decorator.

This is the way using prebuild decorators. You can also use the decorator mixins in the theme:

::

  "scroll-knob" : 
  {
    decorator : [
      qx.ui.decoration.MBorderRadius,
      qx.ui.decoration.MSingleBorder,
      qx.ui.decoration.MBackgroundColor
    ],
    
    style : 
    {
      radius : 3,
      width : 1,
      color : "button-border",
      backgroundColor : "scrollbar-bright"
    }
  },
  
The main difference here is that not a reference to a prebuild decorator is given. Instead, an array containing mixins implementing single features are used. The theming system combines those mixins in a decorator. The styles map should now containg values for properties defined by the mixins.

Sometimes it is very handy to change change only little details about the decorator. Imagine a special decorator for hovered buttons. Inheritance comes in very handy in such a case.

::

  "scroll-knob-pressed" : 
  {
    include : "scroll-knob",
    
    style : 
    {
      backgroundColor : "scrollbar-dark"
    }
  },

As you can see here, we include the previously defined decorator and override the backgroundColor property. Thats all you need to do!

.. _pages/desktop/ui_decorators#custom_decorators:

Custom Decorators
=================

Custom decorators are created by extending the decorator theme and adding new ones or overwriting existing ones. Each decorator class comes with a set of properties for configuration of the instance. Following a short description of the available decorators:

* **Background**: Renders a background image or color
* **Uniform**: Like ``Background``, but adds support for a uniform border which is identical for all edges.
* **Single**: Like ``Background``, but adds support for separate borders for each edge.
* **Double**: Like ``Single`` but with the option to add two separate border to each edge.
* **Beveled**: Pseudo (lightweight) rounded border with support for inner glow. May contain a background image / gradient.
* **HBox**: Uses three images in a row with a center image which is stretched horizontally. Useful for widgets with a fixed height, which can be stretched horizontally.
* **VBox**: Uses three images in a column with a center image which is stretched vertically. Useful for widgets with a fixed width, which can be stretched vertically.
* **Grid**: Complex decorator based on nine images. Allows very customized styles (rounded borders, alpha transparency, gradients, ...). Optionally make use of image sprites to reduce image number.

Each entry of the theme is automatically made available using the ``setDecorator``/``setShadow`` functions of the widget class. The instances needed are automatically created when required initially. This mechanism keeps instance numbers down and basically ignores decorators which are defined but never used.

Additionall to these explicit decorators, qooxdoo supplies a set of Mixins which supply separate features for decorators. These mixins can be used to build a decorator on runtime by the theming system. All feature mixins can be used in combination to get an individual decorator. The mixins also include some features not available in the standalone decorators.

* **MBackgroundColor**: for drawing a background color
* **MBackgroundImage**: for drawing a background image
* **MDoubleBorder**: for drawing two borders around a widget
* **MSingleBorder**: for drawing a single border

* **MBorderRadius**: for adding a CSS radius to the corners
* **MBoxShadow**: for adding a CSS box shado to the widget (does not use the shadow property)
* **MLinearBackgroundGradient**: for drawing a linear gradient in the background

As you may have guessed, the last three mixins do not work cross browser due to the fact that they rely on CSS propertes not available in all browsers. If you want more details, take a look at the `API documentations of the mixins <http://demo.qooxdoo.org/current/apiviewer/#qx.ui.decoration>`_.

.. _pages/desktop/ui_decorators#writing_decorators:

Writing Decorators
==================

It is easily possible to write custom decorators. `The interface <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.IDecorator>`_ is quite trivial to implement. There are only five methods which needs to be implemented:

* ``getInsets``: Returns a map of insets (space the decorator needs) e.g. the border width
* ``getMarkup``: Returns the initial markup needed to build the decorator. This is executed by each widget using the decorator. This method may not be used by some decorators and this way is defined as an empty method.
* ``init``: Normally used to initialize the given element using ``getMarkup``. Only executed once per element (read per widget).
* ``resize``: Resizes the given element to the given dimensions. Directly works on the DOM to manipulate the content of the element.
* ``tint``: Applies the given background color or resets it to the (optionally) locally defined background color. This method may not be used by some decorators and this way is defined as an empty method.

One thing to additionally respect is that ``resize`` and ``tint`` should be as fast as possible. They should be as minimal as possible as they are executed on every switch to the decorator (e.g. hover effects). All things which are possible to do once, in ``getMarkup`` or ``init`` methods, should be done there for performance reasons. Decorators are regarded as imutable. Once they are used somewhere there is no need to be able to change them anymore.

Each decorator configuration means exactly one decorator instance (created with the first usage). Even when dozens of widgets use the decorator only one instance is used. To cache the markup is a good way to improve the initial time to create new element instances. These configured elements are reused e.g. a hover effect which moves from "Button 1" to "Button 2" uses the same DOM element when reaching "Button 2" as it has used in "Button 1". This way the number of DOM elements needed is reduced dramatically. Generally each decorator instance may be used to create dozens of these elements, but after some time enough elements may have been created to fulfill all further needs for the same styling.


.. _pages/desktop/ui_decorators#writing_decorator_mixins:

Writing Decorator Mixins
========================

If you want to use your custom decorator with some build in decorator mixins, you can write you decorator as mixin and use it in combination with all the other mixins. Its comparable to writing a standalone decorator. You are able to implement the following methods:

* ``_style<yourName>``: This method has a styles map as parameter which should be manipulated directly. That way, you can just append your styles and thats it.

* ``_resize<yourName>``: The resize method is a bit differnet than the resize of the standalone decorators. It should return a map containing the desired position and dimension after the resize. The theme system then calculates the new position for the combination of the mixins and appies it to the element.

* ``_tint<yourName>``: The tint method is an easy one which will be called if available. It could be the same as in the standalone case.

* ``_getDefaultInsetsFor<yourName>``: This method should return the desired insets for this feaure. Again, the system takes care of calculating the propper insets for the combination of the mixins.

* ``_generateMarkup``: Is used to crate the markup as HTML string.

As you can see, every mixin can define its own methods for ``getMarkup``, ``resize``, ``tint`` and the ``insets``. The theme system combines all the methods given by the separate widgets to one big working method.
A single special cas is the ``_generateMarkup`` method, which can only be there once for the whole decorator. For example, the double border Mixin already implements that because it needs to handle the generation itself.