TabView
*******
The tab view stacks several pages above each other and allows to switch
between them by using a list of buttons.

The buttons are positioned on one of the tab view's edges.

Preview Image
-------------
|pages/widget/tabview.png|

.. |pages/widget/tabview.png| image:: /pages/widget/tabview.png

Features
--------
  * Tab positions:
    * top
    * bottom
    * left
    * right
  * Overflow handling for tabs

Description
-----------

A TabView widgets contains of two parts:
  * a ``qx.ui.container.SlideBar`` which contains a tab for every Page and can be positioned on every side of the TabView.
  * a ``qx.ui.container.Stack`` which contains the Pages which can be added and removed at runtime.

A Page contains widgets to be shown in a TabView and usually has a label and icon to identify it.

Demos
-----
Here are some links that demonstrate the usage of the widget:\\
  * `Horizontal and vertical TabViews with a different amount of pages <http://demo.qooxdoo.org/1.2.x/demobrowser/index.html#widget~TabView.html>`_

API
---
Here is a link to the API of the Widget:\\
`complete package and classname <http://demo.qooxdoo.org/1.2.x/apiviewer/index.html#qx.ui.tabview>`_

