.. _pages/widget/splitpane#splitpane:

SplitPane
*********

A SplitPane is used to divide two Widgets. These widgets can be resized by clicking the splitter widget and moving the slider.
The orientation property states if the widgets should be aligned horizontally or vertically.

.. _pages/widget/splitpane#preview_image:

Preview Image
-------------

|widget/splitpane.png|

.. |widget/splitpane.png| image:: /pages/widget/splitpane.png

.. _pages/widget/splitpane#features:

Features
--------
* Orientation

  * vertical
  * horizontal

* Autosizing with static or flex values

.. _pages/widget/splitpane#description:

Description
-----------
The most important class (and the class you will use mainly) inside the ``qx.ui.splitpane`` package is the ``Pane``. One can add two widgets (of any type) to it. Besides these two widgets a ``Pane`` also contains a ``Splitter`` between them. By clicking on it (and holding down the mouse button), a ``Slider`` will appear and follow the mouse to indicate where the ``Splitter``s will be placed when the mouse button is released. Once the mouse button is released the available space inside the ``Pane`` is redivided to both widgets according to the ``Splitter``'s new position.

.. _pages/widget/splitpane#demos:

Demos
-----
Here are some links that demonstrate the usage of the widget:

* `SplitPane that can toggle its orientation and hide/show panes <http://demo.qooxdoo.org/%{version}/demobrowser/index.html#widget-SplitPane.html>`_

.. _pages/widget/splitpane#api:

API
---
| Here is a link to the API of the Widget:
| `qx.ui.splitpane <http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.ui.splitpane>`_

