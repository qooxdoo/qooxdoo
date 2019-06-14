Grow
====

The grow layout stretches all children to the full available size but still respects limits configured by min/max values.

Features
--------

-   Auto-sizing
-   Respects minimum and maximum child dimensions

Description
-----------

The Grow layout is the simplest layout in qooxdoo. It scales every child to the full available width and height (still respecting limitations of each child). It will place all children over each other with the top and left coordinates set to `0`. This layout is usually used with only one child in scenarios where exactly one child should fill the whole content (e.g. adding a TabView to a Window). This layout performs a lot better in these cases than for example a canvas layout with `edge=0`.

Layout properties
-----------------

The Grow layout does not have any layout properties.

Alternative Names
-----------------

-   FitLayout (ExtJS)

API
---

Here is a link to the API of the layout manager:
[qx.ui.layout.Grow](http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.ui.layout.Grow)
