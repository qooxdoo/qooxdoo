Stack
=====

The stack container is a container widget, which puts its child widgets on top of each other and only the topmost widget is visible.

Features
--------

-   Two size hint modes.
    -   `dynamic:true`: The stack's size is the preferred size of the visible widget
    -   `dynamic:false`: The stack's size height is the to the height of the tallest widget and the stack's width is set to the width of the widest widget

Description
-----------

The stack is used if exactly one out of a collection of many widgets should be visible. This is used e.g. in the tab view widget. Which widget is visible can be controlled by using the `selected` property.

Demos
-----

Here are some links that demonstrate the usage of the widget:

-   [Two stack containers. The first not dynamic, the second dynamic.](http://demo.qooxdoo.org/%{version}/demobrowser/#widget~StackContainer.html)

API
---

Here is a link to the API of the Widget:
[qx.ui.container.Stack](http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.ui.container.Stack)
