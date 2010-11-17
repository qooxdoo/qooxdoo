.. _pages/widget/toolbar#toolbar:

Toolbar
*******
The ToolBar widget is responsible for displaying a toolbar in the application. Therefore it is a container for Buttons, RadioButtons, CheckBoxes and Separators.

.. _pages/widget/toolbar#preview_image:

Preview Image
-------------

|widget/toolbar.jpg|

.. |widget/toolbar.jpg| image:: /pages/widget/toolbar.jpg
                        :width: 500 px
                        :target: ../../_images/toolbar.jpg

.. _pages/widget/toolbar#features:

Features
--------
* Buttons

  * Regular
  * Radio
  * Toggle
  * Menu

* Icons and / or labels for all buttons
* Separation into parts
* Separator handles

.. _pages/widget/toolbar#description:

Description
-----------
The qx.ui.toolbar package, which contains all stuff needed for the toolbar widget, has the main class called ToolBar. The ToolBar class is the main container for the rest of the classes. 
If you want to group your buttons in the toolbar, you can do this with parts. The parts class acts as a subelement of the toolbar with almost the same functionality. To a part you can add buttons. There are some kinds of buttons in the toolbar package:

* Buttons
* Radio buttons
* CheckBox buttons
* MenuButtons
* SplitButtons

These buttons can also be added directly to the toolbar if no parts are needed.
For further structuring in the toolbar, a Separator is available in the package which can be added.

.. _pages/widget/toolbar#diagram:

Diagram
-------

|widget/toolbar_uml.png|

.. |widget/toolbar_uml.png| image:: /pages/widget/toolbar_uml.png

.. _pages/widget/toolbar#demos:

Demos
-----
Here are some links that demonstrate the usage of the widget:

* `Toolbar with all features <http://demo.qooxdoo.org/%{version}/demobrowser/#widget~ToolBar.html>`_
* `Toolbar in a browser demo <http://demo.qooxdoo.org/%{version}/demobrowser/#showcase~Browser.html>`_
* `Toolbar with other menus <http://demo.qooxdoo.org/%{version}/demobrowser/#widget~Menu.html>`_

.. _pages/widget/toolbar#api:

API
---
| Here is a link to the API of the Widget:
| `qx.ui.toolbar <http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.ui.toolbar>`_

