Overview
========

Widgets
-------

Widgets are the basic building blocks of graphical user interfaces (GUIs) in qooxdoo. Each GUI component, such as a button, label or window, is a widget and can be placed within an existing user interface. Each particular type of widget is provided by a corresponding subclass of [Widget](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.Widget), which is itself a subclass of [LayoutItem](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem).

`Widget` can be subclassed with minimal effort to create custom widgets. The entire layout handling and children handling in this class is only available as "protected". It is possible to add some public API as needed.

Another framework class which extends `LayoutItem` is [Spacer](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.Spacer). A spacer is an empty area, which may be used as a temporary placeholder that is to be replaced later, or explicitly as a flexible part in certain dynamic UI designs.

To structure an interface it is common to insert widgets into each other. Each child is displayed within the screen area occupied by its parent. The hierarchical structure is also used to hide or show specific areas. This means for instance, that hiding a parent hides its children as well. Another example would be when a widget is being disposed, all the child widgets it contains are automatically being disposed as well.

Composites
----------

As mentioned a few sentences above the normal `Widget` does not have public methods to manage the children. This is to allow the normal Widget to be used for inheritance. To allow the creation of structures in applications, the `Composite` was created.

[Composite](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.container.Composite) extends `Widget` and publishes the whole children and layout management of the `Widget` to the public. Typically it is used as a container for other widgets. Children can be managed through the methods `add()`, `remove()`, etc. In application code Composites are used to structure the interface.

Roots
-----

A special category of widgets are the root widgets. These basically do the connection between the classic DOM and the qooxdoo widget system. There are different types of roots, each individually tuned for the requirements in the covered use case.

First of all, every application developer needs to decide if an application should be standalone, e.g. working with a minimal set of classic HTML, or will be integrated into an existing web page. Developers of a standalone application normally have no problem to give control over the page layout to the UI toolkit (maybe even preferring to give away this responsibility), but this would not work for integrating qooxdoo into an existing web page layout.

A standalone application normally only uses a really slimmed down set of HTML (in fact the customary `index.html` file only functions as a wrapper to load the application code). It normally does not include any CSS files and often comes with an empty body element. In fact even simple elements like headers, footers etc. are created using widgets (allowing them to benefit from typical qooxdoo features like internationalisation, theming etc.).

-   [Application](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.root.Application): Build a full-blown stand-alone application from scratch. Application logic and UI are fully implemented using qooxdoo.
-   [Page](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.root.Page): Build applications as isles into existing content. Ideal for the classic web developer. Requires HTML & CSS skills for non-qooxdoo content.

Either root element is attached directly to the document. The `Application` is automatically stretched to the full size of the viewport, allowing elements to be positioned in relation to the right or bottom edge, etc. This is not possible using the `Page` root.

The instantiation of the required root widget is normally nothing the developer has to do manually. This is done by the application class the developer chooses to extend. The next chapter will explain the concept behind applications in detail.

As even the `Page` root is attached to the document it would still be impossible to place children into a specific existing column or box within the existing layout. However, web page developers may use any number of optional isles to insert content into an existing layout (built with classic HTML markup). The isles are named [Inline](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.root.Inline). They require an existing DOM element to attach themselves to (usually retrieved using `getElementById`). While most content is added to these isles, the `Page` root is required so that dynamically floating elements like tooltips, menus, windows etc. can be easily positioned.

Applications
------------

The application is the starting point of every qooxdoo application. Every qooxdoo application should also come with a custom application class. The application is automatically initialized at the boot phase of qooxdoo (to be exact: when all required JavaScript packages are loaded).

The first method each developer needs to get familiar with is the [main](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.IApplication~main) method. It is automatically executed after the initialization of the class. This method is typically used to initialize the GUI and to load any data the application needs.

There are different applications which can be used as a starting point for a custom application:

-   [Standalone](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Standalone): Uses the `Application` root to build full blown standalone qooxdoo applications
-   [Inline](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Inline): Uses the `Page` root to build traditional web page based application which are embedded into isles in the classic HTML page.
-   [Native](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Native): This class is used for applications that do not involve qooxdoo's GUI toolkit. Typically they make only use of the IO ("Ajax") and BOM functionality (e.g. to manipulate the existing DOM).

Communication
-------------

Developing a qooxdoo application does not require a server. Its static application contents (initial HTML file, JavaScript files, images, etc.) can simply be loaded from the local file system. This means that full applications can be developed locally with no server infrastructure - not even an Internet connection is required.

Any practical qooxdoo client application will communicate with a server, for instance to retrieve and store certain application data, to do credit card validation and so on. To this end, qooxdoo includes a sophisticated IO layer featuring high-level abstractions for XMLHTTP requests and REST resources as well as support for cross-domain requests.

Additionally, an advanced RPC mechanism \</pages/communication/rpc\> for direct calls to server-side methods is available. It allows you to write true client/server applications without having to worry about the communication details. qooxdoo offers several *optional* [RPC backends](http://qooxdoo.org/contrib/project#backend) for Java, PHP, Perl and Python. If you are missing your favorite backend language, you can even create your own RPC server by following a generic server writer guide \</pages/communication/rpc\_server\_writer\_guide\>.
