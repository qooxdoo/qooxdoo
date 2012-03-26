.. _pages/ui_overview#overview:

Overview
********

.. _pages/ui_overview#widgets:

Widgets
=======

Widgets are the basic building blocks of graphical user interfaces (GUIs) in qooxdoo. Each GUI component, such as a button, label or window, is a widget and can be placed within an existing user interface. Each particular type of widget is provided by a corresponding subclass of `Widget <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.Widget>`_, which is itself a subclass of `LayoutItem <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem>`_.

``Widget`` can be subclassed with minimal effort to create custom widgets. The entire layout handling and children handling in this class is only available as "protected". It is possible to add some public API as needed.

Another framework class which extends ``LayoutItem`` is `Spacer <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.Spacer>`_. A spacer is an empty area, which may be used as a temporary placeholder that is to be replaced later, or explicitly as a flexible part in certain dynamic UI designs.

To structure an interface it is common to insert widgets into each other. Each child is displayed within the screen area occupied by its parent. The hierarchical structure is also used to hide or show specific areas. This means for instance, that hiding a parent hides its children as well. Another example would be when a widget is being disposed, all the child widgets it contains are automatically being disposed as well.

.. _pages/ui_overview#composites:

Composites
==========

As mentioned a few sentences above the normal ``Widget`` does not have public methods to manage the children. This is to allow the normal Widget to be used for inheritance. To allow the creation of structures in applications, the ``Composite`` was created.

`Composite <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.container.Composite>`_ extends ``Widget`` and publishes the whole children and layout management of the ``Widget`` to the public. Typically it is used as a container for other widgets. Children can be managed through the methods ``add()``, ``remove()``, etc. In application code Composites are used to structure the interface. 

.. _pages/ui_overview#roots:

Roots
=====

A special category of widgets are the root widgets. These basically do the connection between the classic DOM and the qooxdoo widget system. There are different types of roots, each individually tuned for the requirements in the covered use case.

First of all every application developer needs to decide if an application should be standalone e.g. working with a minimal set of classic HTML or will be integrated into an maybe full-blown web page. Developers of an standalone application normally have no problem to give the control to the toolkit (maybe even enjoy it to give away this responsibility), but this would not work for integrating qooxdoo into an existing web page layout.

A standalone application normally only uses a really slimmed down set of HTML (in fact the file only functions as a wrapper to load the application code). It normally does not include any CSS files and often comes with an empty body element. In fact even simpler elements like headers, footers etc. are created using widgets (so they may benefit from typical qooxdoo features like internationalisation, theming etc.).

* `Application <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.root.Application>`_: Build full-blown application from scratch. Target audience are developers of a completely qooxdoo based application.
* `Page <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.root.Page>`_: Build applications as isles into existing content. Ideal for the more classic web developer. Needs to bring in know how of HTML & CSS for non-qooxdoo content.

Both roots are attached directly to the document. The ``Application`` is automatically stretched to the full size of the window and this way allows to position elements in relation to the right or bottom edge etc. This is not possible using the ``Page`` root.

The instantiation of the required root widget is normally nothing the developer has to do. It is done by the application class the developer chooses to extend. The next chapter will explain the concept behind applications in detail.

As even the ``Page`` root is attached to the document it would be still not possible to place children into a specific existing column or box into the existing layout. However the developer of the web page may use any number of optional isles to insert content into an existing layout (built with classic HTML markup). The isles are named `Inline <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.root.Inline>`__. They need an existing DOM element to do their work (maybe using some type of ``getElementById``).  The reason for the overall need, even when working with these isles, for the ``Page`` root is that all dynamically floating elements like tooltips, menus, windows etc. are automatically placed into this root. This makes positioning of such elements a lot easier.

.. _pages/ui_overview#applications:

Applications
============

The application is the starting point of every qooxdoo application. Every qooxdoo application should also come with a custom application class. The application is automatically initialized at the boot phase of qooxdoo (to be exact: when all required JavaScript packages are loaded).

The first method each developer needs to get used to is the `main <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.IApplication~main>`_ method. It is automatically executed after the initialization of the class. Normally the method is used to initialize the GUI and to load the data the application needs.

There are different applications which could be used as a starting point for a custom application:

* `Standalone <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Standalone>`_: Uses the ``Application`` root to build full blown standalone qooxdoo applications
* `Inline <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Inline>`__: Uses the ``Page`` root to build traditional web page based application which are embedded into isles in the classic HTML page.
* `Native <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Native>`_: This class is for applications that do not involve qooxdoo's GUI toolkit. Typically they make only use of the IO ("Ajax") and BOM functionality (e.g. to manipulate the existing DOM).

.. _pages/ui_overview#communication:

Communication
=============

Developing a qooxdoo application does not require a server. Its static application contents (initial html file, JavaScript files, images, etc.) may just be loaded from your local file system.

Of course, for the actual deployment of your final app you would use a web server to deliver the (static) contents. For developing a qooxdoo app it is not a prerequisite to setup a web server, so you can start right away on your local computer. 

Any practical qooxdoo client application will communicate with a server, for instance to retrieve and store certain application data, to do credit card validation and so on. qooxdoo includes an advanced :doc:`RPC mechanism </pages/communication/rpc>` for direct calls to server-side methods. It allows you to write true client/server applications without having to worry about the communication details. qooxdoo offers such *optional* `RPC backends <http://qooxdoo.org/contrib/project#backend>`_ for Java, PHP, Perl and Python. If you are missing your favorite backend language, you can even create your own RPC server by following a generic :doc:`server writer guide </pages/communication/rpc_server_writer_guide>`.

If you already have an existing backend that serves HTTP (or HTTPS) requests and you do not want to use those optional RPC implementations, that's fine. It should be easy to integrate your qooxdoo app with your existing backend using traditional AJAX calls.

