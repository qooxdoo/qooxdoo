Glossary
********

.. glossary::
   :sorted:

   RIA
       Rich internet application. A desktop-like application with menus, toolbars, etc. that runs over the Internet in a browser.

   class
        A JS object created with ``qx.Class.define()``.

   Mixin
        A Mixin is a class you cannot instantiate, but provides a certain set of features. Mixins are the included in "proper" classes to add this feature set without the necessity to re-implement it. It is created with ``qx.Mixin.define()``.

   Interface
        An Interface is "a class without implementation", i.e. a class-like structure that only names class features like attributes and methods without providing an implementation. It is created with ``qx.Interface.define()``.

   API Viewer
        A popular qooxdoo application, the API Viewer is a class browser for the framework class hierarchy, written in qooxdoo. It allows for customized views, where the framework classes are displayed together with the classes of an application, in order to provide automated application documentation. The data displayed is extracted from the JavaScript source code where it is maintained as JavaDoc-like comments.

   Build Process
        qooxdoo comes with its own build system, usually referred to as the "build process" or "build system". It is a collection of ''make'' Makefiles and command line tools. Together they help to maintain a development environment and is seamlessly used throughout the framework, the standard applications that come with qooxdoo, and is recommended for any custom application. Its features encompass checking of dependencies and maintaining lists of used framework classes, generating files to "glue" everything together, copying code, HTML, style and resource files around, pretty-formatting of source code, generating complete and compressed JavaScript files, and creating distribution-ready, self-contained application folders. Particularly, the build system helps to maintain a Source and a Build Version of a qooxdoo application.

   Build Version
        The "Build Version" of a qooxdoo application is the version where all application files together with all relevant framework classes have been compressed and optimized, to provide a self-contained and efficient Web application that can be distributed to any Web environment.

   Compiler
       TBD

   Constructor

   Destructor

   Event

   Framework

   Generator
       The Generator is the backbone of qooxdoo's Build Process. It is the main tool that drives various other tools to achieve the various goals of the Build Process, like dependency checking, compression and resource management.
   
   Initialization

   Key
   
   Layout
   
   Member
   
   Meta-Theme
   
   Package
   
   Pollution
   
   Property
   
   Quirks Mode
       *"Quirks mode refers to a technique used by some web browsers for the sake of maintaining backwards compatibility with web pages designed for older browsers, instead of strictly complying with W3C and IETF standards in standards mode."* [`Wikipedia <http://en.wikipedia.org/wiki/Quirks_mode>`__]


   Ribbon
       *"The ribbon is a graphical user interface widget composed of a strip across the top of the window that exposes all functions the program can perform in a single place, with additional ribbons appearing based on the context of the data."* [`Wikipedia <http://en.wikipedia.org/wiki/Ribbon_(computing)>`__]
       
   Skeleton
   
   Source Version
   
   Style
   
   Theme
   
   Widget
   
   Window
       A distinct rectangular region on the screen, usually with borders and a top bar that allows to drag it around. More specifically a browser window.
