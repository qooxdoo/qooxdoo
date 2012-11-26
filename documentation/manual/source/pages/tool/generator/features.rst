Generator Features
*********************

This is a functional overview over the feature areas of the Generator, answering the question "What can I achieve with the Generator?".

Application Generation
=======================

Code Dependency Analysis
-------------------------

The Generator automatically detects dependencies between classes. These dependencies are explored recursively, so only the minimal set of start classes needs to be provided, in order to create a full application consisting of many classes. Except for rare cases, no explicit "requiring" of other classes is necessary in application code.

Code Selection
---------------

Depending on dependency information the classes necessary for an application are selected from all classes provided by the involved libraries.

Variant Builds
-------------------

You can create variants of your application, where in each of them only code is contained that complies with a specific set of values that can be defined in configuration. Those values may pertain to browser features, runtime settings, or user-defined properties. A common application is to remove debug code from optimized builds, or to specialize code for a specific rendering engine like Gecko or Webkit.

Code Optimization
--------------------

Besides variant generation (that optimizes by removing dead code) various optimizations and compressions can be applied to class code, to make script files smaller and execution faster. Those optimizations include variable shortening, partial evaluation, call inlining, or constant folding (the latter for environment queries).

Script and Loader Generation
-------------------------------

All the code that eventually goes into the application needs to be sorted, so that symbols are available in the JavaScript interpreter when they are referenced. This is achieved by generating sorted script files, and generating a loader script that loads them in the right order. The loader script is the single entry point for the hosting HTML page to load the qooxdoo application.

Zip Compression
----------------

Script files can optionally be gzipped.

Application Environment
-------------------------

An open set of key-value bindings can be established in the generator configuration. Those bindings are evaluated by the Generator at compile time (e.g. in the form of partial evaluating access to them), as well as at runtime.

File Inclusion
---------------

You can add arbitrary .js and .css files to your application that will be loaded ahead of any qooxdoo code.

Contribution Inclusion
-----------------------

Online hosted qooxdoo contributions can be included like local libraries.

Lazy-Loading Parts
-------------------

You can define parts of your application that are generated as distinct units that can be loaded on demand during runtime. This reduces network and memory footprint when the main application is loaded, and the overall footprint when the optional part is not needed over the app's life cycle.

Deployment Builds
------------------

The deployment build creates an optimized version of the application, together with all its static resources like images, translation strings, Css files, into a self-contained directory tree. This tree can then be copied to arbitrary locations and will run there out of the box.

File Watching
--------------

TBD [Watching files or directory trees for changes, and take a predefined action like re-generating an application, compile Less to Css files, or run a documentation generator.]

Application Development
=======================

Inspector Console
-------------------

The Generator allows the creation of an inspector that can load the actual application and provides various console views to inspect and tweak it. E.g. it exposes the object hierarchy of qooxdoo classes, gives access to each class' properties, etc.

Code Maintenance
==================

Lint Checking
--------------

You code can be inspected for flaws and potential pitfalls, beyond it being syntactically correct.

Whitespace Fixing
-------------------

Irregular whitespace can be an annoyance, like tab width differences or the inclusion of unusual Unicode whitespace characters (e.g. BOM). The Generator can fix this.

Pretty-Printing
----------------

Your code can be re-formatted to comply to some rules of regularity, which are customizable through configuration.


Resource Handling
===================

Resource Selection
--------------------

From a rich set of application resources like images only those are chosen that are required by the classes that are selected for the application. This reduces the size footprint of the application.

Image Slicing and Combining
------------------------------

The Generator provides a high-level interface to the ImageMagick tool suite, in order to slice a complex image in smaller parts (e.g. border, edges and the central part), or to combine a set of images into a combined image.

Base64 Combined Images
------------------------

A special case of image combining, the generator can create Base64 representations of a set of images into a single file. These images can then be used with ``data:`` URLs.

CSS Compression
-------------------------------

Css files can be compressed.

Documentation
=======================

API Data
----------

From class code JSDoc comments can be extracted, and fed into one of the Apiviewer instances to be viewed in the browser.

Testing
=========

Unit Tests
-----------

An "Application Under Test" can be generated, combining application test classes and classes from qooxdoo's unit testing framework into a runnable application. To control the testing, both command-line as well as browser-based runners are available.

GUI Tests
-------------

qooxdoo supports testing browser applications with Selenium. The generator can generate the necessary client driver scripts from dedicated application and framework classes that can then be run with e.g. Node.js.


Internationalization
=====================

PO Files
-----------------------

The Generator allows you to extract tagged strings from class code and place them in PO files which can then be translated by translators.

Runtime Support
------------------

For a given list of locales message keys with their translations will be extracted from the PO files and included with the application. Locales can then be switched a runtime, or be lazily loaded on demand.

File System
============

File Copying
-------------

Various files can be copied, especially for the deployment version of the application.

Artefacts Cleanup
------------------

Clean jobs can be deployed to remove generated artefacts and cached content.

Migration
==========

Application Code Migration
----------------------------

The Generator supports automatic migration of application code across several qooxdoo versions.

Logging and Reporting
========================

Dependency Logging
---------------------

Dependency relations between classes can be logged in several formats, json, flare, graphviz/dot or formatted text. 

Library Classes
-----------------

Unused classes of a library can be logged during application build.

Library Translations
-----------------------

The Generator can which and how much PO entries of a library are translated.

Installation Information
-------------------------

A general 'info' job gathers information about the installed qooxdoo version, the current cache, Python version, asf. This is helpful for debugging client problems.

Miscellaneous
===============

Shell Commands
---------------

Arbitrary shell commands can be issued through the Generator, allowing to bind in other child processes in the build system.
