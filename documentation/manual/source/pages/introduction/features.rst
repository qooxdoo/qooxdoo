.. _pages/introduction/features#framework_features:

Feature Overview
******************

A typical qooxdoo application is created by leveraging the integrated development tools and the client-side programming model based on object-oriented JavaScript. Developers can fully concentrate on creating application without worrying about low-level cross-browser issues.

.. _pages/introduction/features#runtimes:

Runtimes
--------

* qooxdoo supports a wide range of JavaScript environments:

  * desktop browsers (Internet Explorer, Firefox, Opera, Safari, Chrome)
  * mobile browsers (iOS, Android)
  * browserless JS engines (node.js, Rhino, ...) 

* No plugins required (neither ActiveX, Java, Flash nor Silverlight needed)
* Non-critical modifications of the native JavaScript objects to allow for easy integration with other libraries and custom code

.. _pages/introduction/features#object-orientation:

Object-orientation
------------------

* Framework is fully based on classes
* Minimal pollution by global variables due to namespacing 
* Besides regular classes, it offers abstract, static or singleton classes
* Constructors and destructors
* Public, protected and private members by naming convention, that can (partly) be enforced during development
* Single inheritance, full polymorphism
* Java-like interfaces
* Ruby-esque mixins
* So-called dynamic properties, a very convenient and powerful way to have optimized setter and getter methods generated from simple configuration

.. _pages/introduction/features#programming:

Programming
-----------

* Pure JavaScript
* No HTML knowledge required
* No CSS knowledge required
* No DOM knowledge required
* Complete support for event-based programming
* Development of qooxdoo applications fully supported on all platforms, e.g. Windows, Linux, all Unixes, Mac OS X
* Skeletons as pre-configured basis for full-featured custom applications
* Many sample applications and examples
* Designed for high performance
* Aid in developing memory-leak free user applications
* Extensive logging capabilities (e.g. different log appenders, Firebug support)
* Straightforward debugging (e.g. object introspection, benchmarking)
* Browser history management, i.e. browser back/forward button, bookmarks
* Cookies
* Generic JavaScript pretty printer / code formatter for unified code style
* Alternative `development platforms <http://qooxdoo.org/docs/general/development_platforms>`_ offered by third parties

.. _pages/introduction/features#internationalization:

Internationalization
--------------------

* Built-in internationalization (i18n) and localization (l10n) support
* Supporting all languages and locales, at least of this planet
* Based on the comprehensive Unicode Common Locale Data Repository (CLDR)
* Well-known translation file format (.po)
* Support by professional, free translation tools ("po editors") on all platforms

.. _pages/introduction/features#api_reference:

API reference
-------------

* Extended Javadoc-like source code comments
* Full API reference for both framework *and* custom application
* Online and offline `API viewer application <http://api.qooxdoo.org>`_
* Search functionality

.. _pages/introduction/features#testing:

Testing
-------

* Integrated unit testing framework :doc:`Test Runner </pages/development/frame_apps_testrunner>`
* Integrated functional testing framework :doc:`Simulator </pages/development/simulator>`

.. _pages/introduction/features#deployment:

Deployment
----------

* Generation of a self-contained and easily deployable "build" version
* Complexity of the build process hidden behind user-friendly commands
* JavaScript compression (removal of whitespaces, etc.)
* Automatic dependency resolution of JavaScript classes; no need for manual "require" statements or tweaking a custom build
* Automatic linking of JavaScript classes ("JS linker")
* Copying of required static resources like images or other external files into a  self-contained build
* String extraction
* Shortening and obfuscating local variables and/or private members
* Optional browser-specific variant generation for selected feature sets (e.g. Firefox-only build)
* Generation of build versions depending on user-defined variants, which allows for different products from the same code base
* Removal of debug statements within the application code before deployment

.. _pages/introduction/features#migration:

Migration
---------

* Support for easy migration of custom applications from one framework release to another
* As painless as technically feasible
* Fully integrated into the regular build system
* All non-ambiguous changes are done automatically for maximum convenience and to avoid manual find/replace errors
* All ambiguous or semantic changes that require some developer decision are put into a comprehensive checklist


