.. _pages/widget/menu#menu:

Menu
****
The Menu is a widget that contains different widgets to create a classic menu structure. The menu is used from different widget, that needs a menu structure e.q. MenuBar.

.. _pages/widget/menu#preview_image:

Preview Image
-------------

|:Menu|

.. |:Menu| image:: /pages/widget/menu.png
           :width: 500 px
           :target: ../../_images/menu.png

.. _pages/widget/menu#features:

Features
--------

* On demand scrolling if the menu doesn't fit on the screen
* Menu items with text and/or icon.
* Each menu item can have a command for keyboard support.
* Menu items can have submenus.

The menu can contain different item types:

* Normal buttons
* CheckBox buttons
* RadioButtons
* Separators

.. _pages/widget/menu#description:

Description
-----------
The Menu widget is used in combination with other widgets. The other widgets has an instance from the menu and it's shown by user interactions. Each item in a menu can get an command key, that is used to get keyboard support for the user.

Here a some widgets that use a menu for user interaction:

* :doc:`menubar`
* :doc:`toolbar`
* :doc:`menubutton`
* :doc:`splitbutton`
* :doc:`list`

The package ``qx.ui.menu`` has a collection of needed classes for creating a menu structure. The ``qx.ui.menu.Menu`` class is the container class for the menu structure and has items as child. Here are some item that can be used to create the structure:

* `Button <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.menu.Button>`_
* `CheckBox <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.menu.CheckBox>`_
* `RadioButton <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.menu.RadioButton>`_
* `Separator <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.menu.Separator>`_

To create a submenu structure, each item (but not separator) can contain a menu to realize the submenu structure.

.. _pages/widget/menu#diagram:

Diagram
-------

|Menu_UML|

.. |Menu_UML| image:: /pages/widget/menu_uml.png

.. _pages/widget/menu#demos:

Demos
-----
Here are some links that demonstrate the usage of the widget:

* `Some different widgets that use the menu functionality <http://demo.qooxdoo.org/%{version}/demobrowser/#widget~Menu.html>`_
* `Menus used in a MenuBar <http://demo.qooxdoo.org/%{version}/demobrowser/#widget~MenuBar.html>`_

.. _pages/widget/menu#api:

API
---
| Here is a link to the API of the Widget:
| `qx.ui.menu.Menu <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.menu.Menu>`_

