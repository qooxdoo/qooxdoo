.. _pages/layout/box#hbox/vbox:

HBox/VBox
*********

The box layouts lay out their children one after the other. The horizontal box layout lays out widgets in a horizontal row, from left to right, while the vertical box layout lays out widgets in a vertical column, from top to bottom.

.. _pages/layout/box#preview_image:

Preview Image
-------------

|layout/hbox.png|

.. |layout/hbox.png| image:: /pages/layout/hbox.png

.. _pages/layout/box#features:

Features
--------
* Respects Minimum and maximum dimensions
* Priorized growing/shrinking (flex)
* Margins with horizontal (HBox) resp. vertical (VBox) collapsing)
* Auto sizing (ignoring percent values)
* Percent widths (not size hint relevant)
* Alignment (Children property {\@link qx.ui.core.LayoutItem#alignX} is ignored)
* Horizontal (HBox) resp. vertical (VBox) spacing (collapsed with margins)
* Property to reverse children ordering (starting from last to first)
* Vertical (HBox) resp. horizontal (VBox) children stretching (respecting size hints)

.. _pages/layout/box#description:

Description
-----------

Both box layouts lay out their children one after the other. This description will discuss the horizontal box layout. Everything said about the horizontal box layout applies equally to the vertical box layout just with a vertical orientation.

In addition to the child widget's own preferred width the width of a child can also be defined as :ref:`percent <pages/ui_layouting#percent>` values. The percent value is relative to the inner width of the parent widget without any spacings. This means a horizontal box layout with two children of width ``50%`` and with a spacing will fit exactly in the parent.

The horizontal box layout tries to stretch all children vertically to the height of the box layout. This can be supressed by setting the child property `allowGrowY <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem~setAllowGrowY>`_ to false. If a child is smaller than the layout and cannot be stretched it will be aligned according to its `alignY <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem~setAlignY>`_ value. The `alignX <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.layout.HBox~setAlignX>`_ property of the layout itself defines the horizontal alignment of all the children as a whole.

The horizontal spacing can be defined using the property `spacing <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.layout.HBox~setSpacing>`_. In addition to the spacing property each widget can define left and a right ``margin``. Margins and the spacing are always collapsed to the largest single value. It for example the layout has a spacing of ``10`` pixel and two consecutive child widgets A and B - A with a right margin of ``15`` and B with a left margin of ``5`` - than the spacing between these widgets would be ``15``, the maximum of these values.

The preferred height of an horizontal box layout is determined by the highest child widged. The preferred with is the sum of the widths of each child plus the spacing resulting from margins and the ``spacing`` property.

.. _pages/layout/box#layout_properties:

Layout properties
-----------------
* **flex** *(Integer)*: Defines the flexibility (stretching factor) of the child (defaults to ``0``)
* **width** *(String)*: Defines a percent width for the item. The percent width,  when specified, is used instead of the width defined by the size hint. The minimum and maximum width still takes care of the elements limitations.  It has no influence on the layout's size hint. Percents are mainly useful for widgets which are sized by the outer hierarchy.

.. _pages/layout/box#alternative_names:

Alternative Names
-----------------
* QVBoxLayout (Qt)
* StackPanel (XAML)
* RowLayout (SWT)

.. _pages/layout/box#demos:

Demos
-----
Here are some links that demonstrate the usage of the layout:

* `Simple HBox usage <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~HBox.html>`_
* `HBox with flex widths <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~HBox_Flex.html>`_
* `HBox with child margins <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~HBox_Margin.html>`_
* `HBox with percent widths <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~HBox_Percent.html>`_
* `HBox with switchable ''reversed'' property <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~HBox_Reversed.html>`_
* `HBox with separators <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~HBox_Separator.html>`_
* `HBox with vertical shrinking <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~HBox_ShrinkY.html>`_

* `Simple VBox usage <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~VBox.html>`_
* `VBox with flex heights <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~VBox_Flex.html>`_
* `VBox with child margins <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~VBox_Margin.html>`_
* `VBox with percent heights <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~VBox_Percent.html>`_
* `VBox with switchable ''reversed'' property <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~VBox_Reversed.html>`_
* `VBox with separators <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~VBox_Separator.html>`_
* `VBox with horizontal shrinking <http://demo.qooxdoo.org/%{version}/demobrowser/#layout~VBox_ShrinkX.html>`_

.. _pages/layout/box#api:

API
---
Here is a link to the API of the layout manager:

| `qx.ui.layout.HBox <http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.ui.layout.HBox>`_
| `qx.ui.layout.VBox <http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.ui.layout.VBox>`_

