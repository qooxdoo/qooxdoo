.. _pages/development/skeletons#skeletons:

Application Skeletons
=====================

qooxdoo comes with several different application templates or *skeletons*. Each is meant for a specific usage scenario and includes a different subset of the qooxdoo framework (see the :ref:`architecture diagram<pages/architecture#architecture>` for reference).

When creating a new application using :ref:`create-application.py<pages/getting_started/helloworld#hello_world>`, the *-t* or *--type* parameter specifies the type of skeleton to be used, e.g.

::

  qooxdoo-%{version}-sdk/tool/bin/create-application.py --name=custom --type=mobile

The following skeletons are available:

Gui
---
For a GUI application that looks & feels like a native desktop application (often called “RIA” – Rich Internet Application).

Such a stand-alone application typically creates and updates all content dynamically. Often it is called a “single-page application”, since the document itself is never reloaded or changed.

This is the default choice if the *--type* parameter is not specified.

Inherits from `qx.application.Standalone <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Standalone>`_

Included layers
^^^^^^^^^^^^^^^

* Core
* Runtime Abstraction
* Low-Level
* GUI Toolkit

Inline
------
For a GUI application on a traditional, HTML-dominated web page.

The ideal environment for typical portal sites which use just a few qooxdoo widgets, embedded into the page's existing HTML content.

Inherits from `qx.application.Inline <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Inline>`_

Included layers
^^^^^^^^^^^^^^^

* Core
* Runtime Abstraction
* Low-Level
* GUI Toolit

Mobile
------
For a :ref:`mobile application <pages/mobile/mobile_overview#overview>` running in a WebKit-based browser on iOS or Android (and also on desktop machines). Supports the `mobile widget set <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.mobile>`_. 

Inherits from `qx.application.Mobile <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Mobile>`_

Included layers
^^^^^^^^^^^^^^^

* Core
* Runtime Abstraction
* Mobile UI

Native
------
For applications using custom HTML/CSS-based GUIs instead of qooxdoo's widget layer.

Inherits from `qx.application.Native <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Native>`_

Included layers
^^^^^^^^^^^^^^^

* Core
* Runtime Abstraction
* Low-Level

Bom
---

Pre-configured :ref:`low-level library <pages/setup_a_low-level_library#setup_a_low-level_library>`.

Included layers
^^^^^^^^^^^^^^^

* Runtime Abstraction (partially)
* Low-Level (partially)

Basic
-----
For applications running in "browserless" or server-side environments such as node.js and Rhino. 

Inherits from `qx.application.Basic <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Basic>`_

Included layers
^^^^^^^^^^^^^^^

* Core

Contribution
------------

For a `qooxdoo-contrib <http://qooxdoo.org/contrib/>`_ application, component or library. Enables integration with the `Contribution Demo Browser <http://demo.qooxdoo.org/contrib/demobrowser/>`_. 
