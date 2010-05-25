.. _pages/development_platforms#development_platforms:

Development Platforms
*********************

.. _pages/development_platforms#built-in_development_platform:

Built-in Development Platform
=============================

A typical qooxdoo-based web application is created by leveraging the power of the built-in tools in combination with a client-side programming model based on object-oriented JavaScript. For more information please see the `introdcution <http://qooxdoo.org/about>`_ or consult the :doc:`manual <>`.

.. _pages/development_platforms#alternative_development_platforms:

Alternative Development Platforms
=================================

Besides the built-in development platform and programming model, there are several other platforms for creating qooxdoo-based applications. Mostly they have a stronger server-side focus and support a wide range of languages and technologies, e.g. Java / Eclipse, ASP .NET / mono, PHP, Rails, ...

.. _pages/development_platforms#eclipse_rich_ajax_platform_rap:

Eclipse Rich Ajax Platform (RAP)
--------------------------------

  * `Eclipse Rich Ajax Platform (RAP) <http://eclipse.org/rap>`_ aims to enable developers to build rich, Ajax-enabled Web applications by using the Eclipse development model, plug-ins and a Java-only API. The RAP API will be aligned with the Eclipse platform API as much as possible.

The objectives of the RAP project are:

  * *Enable the development of Rich Internet Applications that are based on the Eclipse Plugin architecture*. The Eclipse OSGi framework (Equinox) can run inside of a Web application. This has been demonstrated by several parties, and a subproject of the `Equinox project <http://www.eclipse.org/equinox/incubator/server/>`_ has already been established.
  * *Enable Ajax UI development based on a Java component library with SWT api*. For enabling UI development based on a Java component library the project has received an initial code contribution from Innoopract (W4Toolkit). *NEW*: Based on the infrastructure provided by this code contributions we have implemented a first version of a new widget toolkit with SWT api, called `RWT <http://wiki.eclipse.org/index.php/RWTOverview>`_. RWT is using the sophisiticated JavaScript framework qooxdoo for client side rendering.
  * *Provide a Web Workbench similar to the Eclipse platform workbench*:
    * provides selection service (with session scope),
    * provides extension points for action sets, workbench parts, perspectives, preference pages, etc.,
    * enables plug-ins to contribute to workbench parts provided by other plug-ins (e.g. action contributions)
  * `Online Presentation <http://live.eclipse.org/node/450>`_ ("Webinar")

.. _pages/development_platforms#qxwt:

QxWT
----

A fairly new project that provides a JSNI-wrapper for the qooxdoo JavaScript library to use it in applications based on the Google Web Toolkit (GWT). QxWT follows the qooxdoo-API as much as possible but naturally some constructs available in JavaScript can not get translated the Java 1:1 so some API methods have been adjusted. The biggest difference is that QxWT adopts the GWT-Event-Handler-System instead of wrapping the one of qooxdoo, but then once more provides 99% the same API.

Preliminary information is available on the `QxWT homepage <http://www.ufacekit.org/index.php?cat=02_Qooxdoo&page=01_QxWT>`_ and the recent `blog posts <http://tomsondev.bestsolution.at/?s=qxwt>`_.

.. _pages/development_platforms#qwt:

QWT
---

An older solution that is quite similar to but doesn't use the Google Web Toolkit (GWT). The qooxdoo Web Toolkit is like “qooxdoo for Java”: Write your qooxdoo application in Java, and QWT will translate the client part to JavaScript. It offers the rich qooxdoo widget set for building the UI.

.. _pages/development_platforms#delphi_for_php:

Delphi for PHP
--------------

`Delphi for PHP <http://www.codegear.com/Products/Delphi/DelphiforPHP/tabid/237/Default.aspx>`_ is the first completely integrated visual Rapid Application Development (RAD) environment for PHP. It is a commercial solution offered by Embarcadero Technologies (formerly CodeGear/Borland). Delphi for PHP brings RAD productivity benefits to PHP web developers that Delphi users have enjoyed for years.  The powerful editor and debugger increase coding speed and efficiency, while the integrated VCL for PHP 5 component class library lets developers quickly and visually create PHP web applications and integrate PHP open source components.

Delphi for PHP has an integrated PHP 5 class library called VCL for PHP. A customizable palette of over 50 reusable components includes buttons, labels, check boxes, images, DHTML menus, flash objects, grids, tree views, list boxes and more. Database components are also available for accessing databases, tables, queries, and stored procedures, as well as data grids and navigation. You can also add to the VCL for PHP at any time with your own components or enhancements being offered through the open source PHP platform.

Delphi for PHP makes it easy to create your own components and install customized packages to use in the IDE. The VCL makes it simple for you to develop new classes, because every component is built in pure PHP. Simply place these components into forms and use them in your applications. VCL components have built-in properties, methods, and events that make web interface development a snap.  Delphi for PHP is the fast and easy way to build powerful and reliable PHP web applications.

VCL for PHP are the open source PHP scripts and libraries, including qooxdoo, Adodb, DynAPI, Smarty, XAjax and JSCalendar.  Inspired by VCL for Delphi, the component architecture is 100 percent written in PHP.  Developers can create and integrate components into the IDE and extend the existing components to fit their needs. VCL for PHP is an open source library `available on SourceForge <http://sourceforge.net/projects/vcl4php>`_.

Community-driven support websites:
  * `d4php.org <http://d4php.org>`_
  * `delphi4php-forum.de <http://www.delphi4php-forum.de>`_ (German)

.. _pages/development_platforms#qxtransformer:

QxTransformer
-------------

`QxTransformer <http://qxtransformer.org>`_ is an open source framework providing conversion from a transparent XML description of the graphical user interface (GUI) to qooxdoo JavaScript code. It is designed to significantly ease the burden of writing web application in JavaScript and allows automated creation of UI within the regular qooxdoo build and deployment process. The framework ships with an xml "dialect" which mirrors the qooxdoo object structure, but allows to integrate any other xml semantics with an advanced templating system. 

.. _pages/development_platforms#akorn:

Akorn
-----

`Akorn <http://www.tartansolutions.com/doku.php/akorn/akorn>`_ is an advanced application framework that enables the ability to configure an application into existence rather than coding from scratch or using an external application. However, it is designed to be extremely flexible allowing for extending of the framework easily and the incorporation of custom code if necessary. Akorn is being developed by `Tartan Solutions <http://www.tartansolutions.com>`_ and will be available as an open source project soon.

Akorn is a PHP-based platform that integrates many of the best available open-source PHP tools for server-side application development and uses qooxdoo for all client-side rendering.
Akorn relies on a templating system to communicate with the client. The templates used in Akorn are pure templates that render data generated by the components or other objects in the application. While it is possible to build logic into the templates, Akorn is designed to incorporate most, if not all, logic in objects outside of the presentation layer. This allows the rapid creation of templating systems without the need to replicate unique application logic. 

`SlotReceiver.com <http://www.slotreceiver.com>`_ is a cool showcase of some of the functionality available in the Akorn Integration Framework.  It is a simple tool that provides some help to the legions of fantasy football players while demonstrating the useability and power of Akorn. Be sure to check out the filtering capability, as well as the PDF and Excel reporting features.

.. _pages/development_platforms#x4view:

X4View
------

`X4View® <http://www.reasonsphere.com>`_ is a modern framework for developing rich web-based applications in Java>. Very easy to use, it doesn't require complex programming model : No JSP/Struts, Servlets, HTML, CSS, XML or other configuration files are needed. So now, you can really take the advantage of Java by writing 100% reusable Object Oriented code.

X4View® offers rich event-driven components and layouts which communicate with the server in the most optimized way. It ensures cross-browser compatibility and allows more easy migration to the next generation's standards because your applications will not be tied to HTTP.

Entirely written in Java, X4View® is of course cross-platform. The framework has no dependencies with any others Java Libraries. Only one JAR and one Javascript Library are needed to run your applications.  (x4view-n-n-n.jar and x4view.js files).

Unlike some other frameworks, there is no Java-to-Javascript conversion step. This avoid generating and transporting huge client-side code. The code is generated dynamically only when needed.

The `Showcase <http://www.reasonsphere.com/x4viewdemo/OWebRendererServlet?applicationclassname=com.reasonsphere.x4view.demo.ShowCase>`_ demonstrates some of the product's capabilities. You can view the entire Showcase java source code by choosing the 'Showcase settings' on the button view.

