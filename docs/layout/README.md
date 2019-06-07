Layout Reference
================

qooxdoo comes with some of the most common layout managers. The following layout managers are supported by qooxdoo:

The Basic layout is used to position the children at absolute top/left coordinates.

The Canvas layout is an extended Basic layout. It is possible to position a widget relative to the right or bottom edge of the available space. The Canvas layout furthermore supports dimension and location measures in percent.

The Box layouts arranges their children back-to-back. The horizontal box layout arranges widgets in a horizontal row, from left to right, while the vertical box layout arranges widgets in a vertical column, from top to bottom.

The Flow layout places widget next to each other from left to right. If the available width is not sufficient an automatic line break is inserted.

A Dock layout attaches the children to the edges of the available space.

The Grid layout arranges items in a two dimensional grid. Widgets can be placed into the grid's cells and may span multiple rows and columns.

The Grow layout stretches all children to the full available size but still respects limits configured by min/max values.

There are a few more layouts bundled with the default qooxdoo distribution but those are mostly intended for use by a specific component. For example the widget/atom uses the [Atom Layout](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.layout.Atom), the widget/splitpane uses the two split layouts [HLayout](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.splitpane.HLayout) and [VLayout](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.splitpane.VLayout).

Through the simple API it should be quite easy to write custom layouts if the included ones do not meet demands. Simply derive from the [Abstract](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.layout.Abstract) layout and start with a refined version of the method [renderLayout()](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.layout.Abstract~renderLayout).
