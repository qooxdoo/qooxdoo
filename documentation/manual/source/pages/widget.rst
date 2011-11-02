.. _pages/widget/widget#widget:

Widget
******

This is the base class for all widgets.

.. _pages/widget/widget#features:

Features
--------
* Integration with event system
* Focus handling
* Drag and drop
* Auto sizing
* Theming
* Tool tips
* Context menus
* Visibility handling
* Sub widget management

.. _pages/widget/widget#description:

Description
-----------

The widget is the base class for all qooxdoo widgets. It contains the widget system's core functionality.

.. _pages/widget/widget#diagram:

Diagram
-------

|widget/widget.png|

.. |widget/widget.png| image:: /pages/widget/widget.png

A widget consists of at least three HTML elements. The container element, which is added to the parent widget, has two child Elements: The "decoration" element and the "content" element. The decoration element has a lower z-Index and contains markup to render the widget's background and border using an implementation of ``qx.ui.decoration.IDecorator``. The content element is positioned inside the "container" element to respect paddings and contains the "real" widget element.

.. _pages/widget/widget#demos:

Demos
-----
There are no explicit widget demos since the widget is typically sub classed.

.. _pages/widget/widget#api:

API
---
| Here is a link to the API of the Widget:
| `qx.ui.core.Widget <http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.ui.core.Widget>`_
