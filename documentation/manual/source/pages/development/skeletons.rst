.. _pages/development/skeletons#skeletons:

Application Skeletons
=====================

qooxdoo comes with several different application templates or *skeletons*. Each is meant for a specific usage scenario and includes a different subset of the qooxdoo framework (see the :ref:`architecture diagram<pages/architecture#architecture>` for reference).

When creating a new application using :doc:`create-application.py </pages/tool/create_application>`, the *-t* or *--type* parameter specifies the type of skeleton to be used, e.g.

::

  qooxdoo-%{version}-sdk/tool/bin/create-application.py --name=custom --type=mobile

The following skeletons are available (The application types are in fact all lower-case, but are capitalized in the following headings for better readability):

.. _pages/development/skeletons#gui:

Desktop
-------
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

.. _pages/development/skeletons#mobile:

Mobile
------
For a :ref:`mobile application <pages/mobile/mobile_overview#overview>` running in a WebKit-based browser on iOS or Android (and also on desktop machines). Supports the `mobile widget set <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.mobile>`_. 

Inherits from `qx.application.Mobile <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Mobile>`_

Included layers
^^^^^^^^^^^^^^^

* Core
* Runtime Abstraction
* Mobile UI

.. _pages/development/skeletons#native:

Native
------
For applications using custom HTML/CSS-based GUIs instead of qooxdoo's widget layer.

Inherits from `qx.application.Native <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Native>`_

Included layers
^^^^^^^^^^^^^^^

* Core
* Runtime Abstraction
* Low-Level

.. _pages/development/skeletons#bom:

Website
-------

This is an alternative to working with the :doc:`Website </pages/website>` library directly. %{Website} provides a single-file library for download which contains all the code that encompasses its API. You then just go ahead in your own code using this API in a way that suits you, e.g. by adding custom code in an HTML page that also loads the library.

The 'website' skeleton provides you with the exact same scenario, pre-built. It contains the %{Website} library, and an index.html that contains code using it. You can just open the HTML file in a browser and see the default application running. You can then start extending it in the index.html file directly, or create other %{JS} files that use it, and include those in the HTML file.

This all matches pretty much what somebody would do that just downloaded the Website library to his local machine. In both cases you are using a static library file, and take care of organizing your code yourself. But the 'website' skeleton provides you with a few features that go beyond this:

* You can *re-create* the library file (located in *script/*), by running the ``generate.py build`` job. This is interesting if you e.g. upgrade to a new qooxdoo SDK and want to make sure you are working against the latest code.
* You can create a *non-optimized* version of the library, if you want to debug into its code. This is achieved by running the ``generate.py source`` job.
* You can *extend* the set of classes you want to work with, by changing the configuration of the ``build`` job. This is interesting if you want to take your application beyond the low-level layer, e.g. by including GUI elements.
* You can create a custom *Apiviewer*, by running the ``generate.py api`` job. This is interesting if you want to have an offline API reference close-by.


Included layers
^^^^^^^^^^^^^^^

* Runtime Abstraction (partially)
* Low-Level (partially)

.. _pages/development/skeletons#basic:

Server
------
For applications running in "browserless" or server-side environments such as node.js and Rhino. 

Inherits from `qx.application.Basic <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Basic>`_

Included layers
^^^^^^^^^^^^^^^

* Core

Invoking the application
^^^^^^^^^^^^^^^^^^^^^^^^

After you have created the *source* or *build* version of a basic application, you can run it through either Node or Rhino. But as they have different loading primitives, Node allows you to run the app from a remote directory, while Rhino needs to run the application from the current working directory. So e.g. after creating the source version of an application *foo*, you can invoke it like this for Node:

.. code-block:: bash

   $ node source/script/foo.js

or like this for Rhino:

.. code-block:: bash

   $ cd source/script
   $ java -cp path/to/js.jar org.mozilla.javascript.tools.shell.Main foo.js



.. _pages/development/skeletons#contribution:

Contribution
------------

For a `qooxdoo-contrib <http://qooxdoo.org/contrib/>`_ application, component or library. Enables integration with the `Contribution Demo Browser <http://demo.qooxdoo.org/contrib/demobrowser/>`_. 
