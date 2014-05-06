.. _pages/desktop/ui_decorators#decorators:

Decorators
**********

.. _pages/desktop/ui_decorators#introduction:

Introduction
============

Decorations are used to style widgets. The idea is to have an independent layer around the widget content that can be freely styled. This way you can have separate decorators that define all kinds of decoration (colors, background image, corners, ...), and apply them to existing widgets, without interfering with the widget code itself.

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

  "main" : {
    style : {
      width : 1,
      color : "background-selected"
    }
  },

The first thing you see is the name of the decorator, in this case, ``main``. The specified decorator is available using that name in the entire application code, especially in the appearance theme. Then there's the styles map which contains values for decorator properties. You can see all possible style value as properties of the `Decorator class <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.Decorator>`_.

Sometimes it is very handy to change only little details about the decorator. Imagine a special decorator for hovered buttons. Inheritance comes in very handy in such a case.

::

  "scroll-knob-pressed" : {
    include : "scroll-knob",

    style : {
      backgroundColor : "scrollbar-dark"
    }
  },

As you can see here, we include the previously defined decorator and override the backgroundColor property. That's all you need to do!

.. _pages/desktop/ui_decorators#custom_decorators:

Custom Decorators
=================

Custom decorators are created by extending the decorator theme and adding new ones or overwriting existing ones. Each decorator class comes with a set of properties for configuration of the instance. These properties are defined by mixins in the `qx.ui.decoration namespace <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration>`_. Following is a short description of the available mixins:

* **MBackgroundColor**: Renders a background color.
* **MBackgroundImage**: Renders a background image.
* **MSingleBorder**: Renders a single border.
* **MDoubleBorder**: Renders an outer and an inner border, e.g. to achieve a bevel effect.
* **MBorderImage**: Uses an image to create a border.
* **MBorderRadius**: Used to render rounded corners.
* **MBoxShadow**: Renders a shadow.
* **MLinearBackgroundGradient**: Renders a linear color gradient.

As you may have guessed, the last three mixins do not work cross browser due to the fact that they rely on CSS properties not available in all browsers. If you want more details, take a look at the `API documentations of the mixins <http://demo.qooxdoo.org/current/apiviewer/#qx.ui.decoration>`_.

Each entry of the theme is automatically made available using the ``setDecorator`` function of the widget class. The instances needed are automatically created when required initially. This mechanism keeps instance numbers down and basically ignores decorators which are defined but never used.


.. _pages/desktop/ui_decorators#writing_decorator_mixins:

Writing Decorator Mixins
========================

The recommended way is to write a simple decoration mixin and add it to the default decorator qooxdoo delivers. There is only one method your mixin should supply:

* ``_style<yourName>``: This method has a styles map as parameter which should be manipulated directly. That way, you can just append your styles and That's it. But you should make sure you don't manipulate / override any style another mixin could uses.

As you can see, every mixin can define its own methods for ``style``. The theme system combines all the methods given by the separate widgets to one big working method.

Here is a sample text shadow decorator mixin:

::

  qx.Mixin.define("my.MTextShadow", {
    properties : {
      textShadowColor : {
        nullable : true,
        check : "Color"
      }
    },

    members : {
      _styleTextShadow : function(styles) {
        var color = this.getTextShadowColor();
        if (color === null) {
          return;
        }
        color = qx.theme.manager.Color.getInstance().resolve(color);
        styles["text-shadow"] = color + " 1px 1px";
      }
    }
  });

  // patch the original decorator class
  qx.Class.patch(qx.ui.decoration.Decorator, my.MTextShadow);



.. _pages/desktop/ui_decorators#writing_decorators:

Writing Decorators
==================

It is possible to write custom decorators, although they are not usable in the decoration theme. You can only create instances in the application code and assign the instances. For that reason, the recommendation is to write a decorator mixin instead. `The interface <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.IDecorator>`_ is quite trivial to implement. There are only three methods which needs to be implemented:

* ``getInsets``: Returns a map of insets (space the decorator needs) e.g. the border width plus padding
* ``getPadding``: Returns the configured padding minus the border width.
* ``getStyle``: Returns the decorator's CSS styles as a map.

Decorators are regarded as immutable. Once they are used somewhere there is no need to be able to change them anymore.

Each decorator configuration means exactly one decorator instance (created with the first usage). Even when dozens of widgets use the decorator only one instance is used. To cache the styles is a good way to improve the initial time to create new element instances.
