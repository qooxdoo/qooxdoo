.. _pages/widget/window#window:

Window
******
The window widget is similar to Windows’ MDI child windows.

.. _pages/widget/window#preview_image:

Preview Image
-------------

|widget/window.png|

.. |widget/window.png| image:: /pages/widget/window.png
                       :width: 500 px
                       :target: ../../_images/window.png

.. _pages/widget/window#features:

Features
--------
* Title support text and/or icon
* Support modal window
* Status bar support 
* Minimize and maximize a window
* Open and close a window
* Resize a window

.. _pages/widget/window#description:

Description
-----------
The window widget can be used to show dialogs or to realize a MDI (Multiple Document Interface) Application.

The widgets implements all known metaphors from a window:

* minimize
* maximize
* open 
* close
* and so on

The package ``qx.ui.window`` contains two other classes that can be used to create a MDI Application:
 
* The `Desktop <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.window.Desktop>`_ can act as container for windows. It can be used to define a clipping region for internal windows.
* The `Manager <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.window.Manager>`_ handle the z-order and modality blocking of windows managed the connected desktop.

.. _pages/widget/window#demos:

Demos
-----
Here are some links that demonstrate the usage of the widget:

* `Demonstrate different window types <http://demo.qooxdoo.org/%{version}/demobrowser/#widget~Window.html>`_
* `Windows with using a Desktop <http://demo.qooxdoo.org/%{version}/demobrowser/#widget~Desktop.html>`_
* `A window containing a table demo <http://demo.qooxdoo.org/%{version}/demobrowser/#table~Table.html>`_
* `A calculator demo <http://demo.qooxdoo.org/%{version}/demobrowser/#showcase~Calculator.html>`_

.. _pages/widget/window#api:

API
---
| Here is a link to the API of the Widget:
| `qx.ui.window.Window <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.window.Window>`_

