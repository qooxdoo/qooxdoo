Glossary
********

.. glossary::
   :sorted:

   .. A ..............................................................

   API Viewer
      A popular qooxdoo application, the API Viewer is a class browser for the framework class hierarchy, written in qooxdoo. It allows for customized views, where the framework classes are displayed together with the classes of an application, in order to provide automated application documentation. The data displayed is extracted from the JavaScript source code where it is maintained as JavaDoc-like comments.


   .. B ..............................................................

   Build Process
      qooxdoo comes with its own build system, usually referred to as the "build process" or "build system". It is a collection of ''make'' Makefiles and command line tools. Together they help to maintain a development environment and is seamlessly used throughout the framework, the standard applications that come with qooxdoo, and is recommended for any custom application. Its features encompass checking of dependencies and maintaining lists of used framework classes, generating files to "glue" everything together, copying code, HTML, style and resource files around, pretty-formatting of source code, generating complete and compressed JavaScript files, and creating distribution-ready, self-contained application folders. Particularly, the build system helps to maintain a Source and a Build Version of a qooxdoo application.


   Build Version
      The "Build Version" of a qooxdoo application is the version where all application files together with all relevant framework classes have been compressed and optimized, to provide a self-contained and efficient Web application that can be distributed to any Web environment.


   .. C ..............................................................

   Class
      A JS object created with ``qx.Class.define()``.


   Compiler
      A compiler is a tool that translates code written in some programming language into another language, usually a lower-level one. In qooxdoo we are transforming JavaScript into optimized JavaScript, which is often referred to as *translation* (as the target language is on the same level as the source language). But as it is the more popular term, we usually refer to this process as compilation as well.


   Constructor
      A class method that is run everytime a new instance of the class is created. Used to do initialisation on the class instance. In qooxdoo this method is named *construct*.
       

   .. D ..............................................................

   Destructor
      A class method that is run everytime a class instance is deleted.


   .. E ..............................................................

   Event
      A notification that signals a special situation in time. Events usually take the form of concrete objects. Important for reactive systems like user interfaces, to notify parts of the software of a particular situation, e.g. a user action like a keyboard stroke or a mouse click.


   Execption
      An exceptional situation that prohibits the normal continuation of the program flow.


   .. F ..............................................................

   Framework
      A coherent collection of a library, documentation, tools and a programming model which application developers use to create applications.


   .. G ..............................................................

   Generator
      The generator is the backbone of qooxdoo's build process. It is the main tool that drives various other tools to achieve the various goals of the build process, like dependency checking, compression and resource management.
   

   .. H ..............................................................


   .. I ..............................................................

   Initialization
      The process of setting up a certain software component, like an object, for its work, or the programming code to achieve such a setting up.


   Interface
      An Interface is "a class without implementation", i.e. a class-like structure that only names class features like attributes and methods without providing an implementation. It is created with ``qx.Interface.define()``.


   .. J ..............................................................


   .. K ..............................................................

   Key
      Keys are the "left-hand side" of the key-value pairs in a map. Map keys have to be unique within the map.
   

   .. L ..............................................................

   Layout
   

   .. M ..............................................................

   Map
      A data structure that contains key-value pairs. Each value can be looked up by using the key on the map. In JavaScript, maps are also object literals, i.e. each map constitutes an object.

   Member
      A class attribute, usually a method. Within qooxdoo, members usually refer to instance methods (as opposed to static methods).
   

   Meta-Theme
      A theme that only references other themes.
   

   Mixin
      A Mixin is a class you cannot instantiate, but provides a certain set of features. Mixins are the included in "proper" classes to add this feature set without the necessity to re-implement it. It is created with ``qx.Mixin.define()``.


   .. N ..............................................................


   .. O ..............................................................


   .. P ..............................................................

   Package
      A JavaScript file that is loaded by an application.
   

   Pollution
      Application-specific variables that are added to the global name space in the JavaScript interpreter.
   

   Property
      A class attribute that is not accessed directly, but rather through automatic accessor methods (getters/setters/resetters, initializers, ...).
   

   .. Q ..............................................................

   Quirks Mode
      *"Quirks mode refers to a technique used by some web browsers for the sake of maintaining backwards compatibility with web pages designed for older browsers, instead of strictly complying with W3C and IETF standards in standards mode."* [`Wikipedia <http://en.wikipedia.org/wiki/Quirks_mode>`__]


   .. R ..............................................................

   RIA
      Rich internet application. A desktop-like application with menus, toolbars, etc. that runs over the Internet in a browser.


   Ribbon
      *"The ribbon is a graphical user interface widget composed of a strip across the top of the window that exposes all functions the program can perform in a single place, with additional ribbons appearing based on the context of the data."* [`Wikipedia <http://en.wikipedia.org/wiki/Ribbon_(computing)>`__]
       

   .. S ..............................................................

   Skeleton
      A minimal qooxdoo application that serves as a starting point for custom applications. qooxdoo provides several skeleton applications, according to intended application domain.
   

   Source Version
      The "source version" of a qooxdoo application is the version where all class files are loaded individually and in their original source form. This is less efficient when loaded into the browser, but much better for debugging and error tracing. Hence, it is the preferred development version.
   

   Style
      A set of visual attributes that determin how a certain element is displayed. This encompasses things like foreground and background colors, background images, font types and border styles.


   .. T ..............................................................
   
   Theme
      A comprehensive set of style definitions that can be used to give an application a consistent look and feel through all of its visual elements.


   .. U ..............................................................


   .. V ..............................................................


   .. W ..............................................................
   
   Widget
      Visual user interface element, like a button, a text input field or a scroll bar. Usually, widgets have their own specific behaviours, i.e. a way of reacting to user interaction, but there are also pure display widgets.
   

   Window
      A distinct rectangular region on the screen, usually with borders and a top bar that allows to drag it around. More specifically a browser window.


   .. X ..............................................................


   .. Y ..............................................................


   .. Z ..............................................................


