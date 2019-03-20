SplitPane
=========

A SplitPane is used to divide two Widgets. These widgets can be resized by tapping the splitter widget and moving the slider. The orientation property states if the widgets should be aligned horizontally or vertically.

Preview Image
-------------

![widget/splitpane.png](/pages/widget/splitpane.png)

Features
--------

-   Orientation
    -   vertical
    -   horizontal
-   Autosizing with static or flex values

Description
-----------

The most important class (and the class you will use mainly) inside the `qx.ui.splitpane` package is the `Pane`. One can add two widgets (of any type) to it. Besides these two widgets a `Pane` also contains a `Splitter` between them. By tapping on it (and holding down the pointer), a `Slider` will appear and follow the pointer to indicate where the `Splitter`'s will be placed when the pointer is released. Once the pointer is released the available space inside the `Pane` is redivided to both widgets according to the `Splitter`'s new position.

Demos
-----

Here are some links that demonstrate the usage of the widget:

-   [SplitPane that can toggle its orientation and hide/show panes](http://demo.qooxdoo.org/%{version}/demobrowser/index.html#widget-SplitPane.html)

API
---

Here is a link to the API of the Widget:
[qx.ui.splitpane](http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.ui.splitpane)
