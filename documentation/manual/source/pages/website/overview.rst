Low Level Overview 
==================

.. note::
  This section is outdated and does not reflect the current implementation. To get an idea of where %{Website} is heading, please refer to the API docs of `qx.module <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.module>`__.

This page is an overview of qooxdoo's low-level capabilities. It does collect the existing documentation and tries to show the big picture.


CSS Selector Support 
--------------------

If you are familiar with jQuery you can check out the :doc:`comparison article <fromjquery>` of qooxdoo's `Collection class <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.bom.Collection>`__ and jQuery implementation. Internally qooxdoo also uses the `Sizzle <http://sizzlejs.org>`__ selector engine, so you can use the CSS selectors you're familiar with. 


DOM query and manipulation
--------------------------

The core for querying the DOM and manipulate DOM elements is the ``qx.bom.Collection`` class which offers this fundamental functionality. This class connects all relevant :doc:`low level APIs <website_apis>` of qooxdoo. For further reading the :doc:`overview of the collection use cases <use_cases_collection_class>` is worth reading.


Event layer
-----------

Adding listeners to interact with the user is one of the top use cases. qooxdoo does offer a sophisticated event layer with powerful features like *cross-browser event bubbling and capturing* and many more! 

Check out the detailed article about the :doc:`qooxdoo event layer <event_layer_impl>`.


Communication
-------------

Pulling data from remote sources is also one of the most common use cases and usually the next logical step when it comes to improving your existing JavaScript powered website / application. However, you expect that the underlying framework is providing you a nice abstracted cross-browser solution you can easily use. qooxdoo offers you multiple implementations to pull data. 

The first option is to use `XHR <http://en.wikipedia.org/wiki/XHR>`__. This browser API is widely used and qooxdoo comes with :ref:`a wrapper of this API <pages/communication#low_level_requests>` which hides away inconsistencies and works around bugs. However, to gain more comfort the recommended way is to use the :doc:`Higher-level requests </pages/communication/request_io>`.

The second option is to use `JSONP <http://en.wikipedia.org/wiki/JSONP>`__. With that approach you can overcome the `same orgin policy <http://en.wikipedia.org/wiki/Same_origin_policy>`__ and can talk to any server which is offering a JSON API like e.g `Twitter <https://dev.twitter.com/>`__ does. qooxdoo is offering a :doc:`nice and powerful API </pages/communication/request_io>` with the same interface as the XHR transport to let you easily adapt any JSONP API out there.


Animation
---------

Animations can enhance the user experience and can help to create appealing and natural behaving user interfaces. With modern browsers CSS3 animations and transforms are opening a new way of realizing this in an efficient way. No need to do it programmatically in JavaScript. 

To use animations with qooxdoo you can use the `animation layer <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.element.Animation>`__ introduced with the 1.6 release of qooxdoo. This is a cross-browser wrapper for CSS3 animations and transforms with the goal to align closely to the spec wherever possible.

A `fallback implementation <http://demo.qooxdoo.org/current/apiviewer/#qx.fx>`__ for older browser is also available and can be used together with the new implementation.

.. note::

  A new and more consistent fallback implementation is planned.


Scenarios 
---------

Depending on your needs you can either use a pre-build low-level library or use a low-level application class. The qooxdoo SDK offers you to let you generate you both so-called :doc:`skeletons </pages/development/skeletons>` in an easy and fast way.


Low Level library
*****************

This library is suited for all developers which like to use qooxdoo for traditional websites. It comes which a pre-configured set of classes which should cover the top use cases. 

How to create this low-level library is described at :doc:`Setting up a low-level library <setup_a_low-level_library>`.



Low-level application
*********************

Suppose you like to create an application, but you don't want to use the RIA approach with all rich widgets. The :ref:`low-level application <pages/development/skeletons#Native>` (aka ``native``) comes exactly with the same structure as a normal GUI skeleton and does offer the same powerful functionalities like automatic dependency analysis, generated API viewer, unit testing infrastructure and the like. The main difference that no rich widgets are referenced and you can create your application using HTML and CSS. 

You can create this application using the ``create-application.py`` script:

::

   path_to_SDK/tool/bin/create-application.py -n myLowLevelApp -t native
   
   
The result is a new low-level application skeleton named ``myLowLevelApp`` in the current folder. Dive into the :ref:`Getting started <pages/getting_started/helloworld#helloworld>` tutorial for further infos about creating your application.
