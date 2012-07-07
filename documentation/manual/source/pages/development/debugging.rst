.. _pages/debugging#debugging_applications:

Debugging Applications
**********************

You have several options at hand when it comes to debugging a qooxdoo application.

.. _pages/debugging#introspection:

Introspection
=============

  * ``qx.io.Json.stringify()``
  * ``qx.dev.Debug()``

Included in the latter is qx.dev.Debug.debugObject() which will print out a complete recursive hierarchy (or up to some max level) of an object.

This is taken from a firebug interactive session:

::

    >>> var myTest = {a:1, b:[2,3], c:4}
    >>> qx.dev.Debug.debugObject(myTest)
    1665905: Object, count=3:
    ------------------------------------------------------------
    a: 1
    b: Array
     0: 2
     1: 3
    c: 4
    ==================================

.. _pages/debugging#memory_leaks:

Memory leaks
============

  * Setting ``qx.debug.dispose.level``

.. _pages/debugging#ajax:

AJAX
====

  * Setting ``qx.debug.io.remote``
  * Setting ``qx.debug.io.remote.data``

.. _pages/debugging#debugging_tools:

Debugging Tools
===============

`Some browser-specific tools <http://qooxdoo.org/docs/general/debugging_tools>`_ allow for a powerful and often convenient way of debugging applications.

.. _pages/debugging#code_instrumentation_idioms:

Code Instrumentation Idioms
===========================

These are helpful idioms you might want to include in your code, i.e. you use them at *programming time*.

.. _pages/debugging#this.debug:

this.debug()
------------

With ``this.debug()`` you can print out any string you want to see in the console during execution of your application. Of course you might want to interpolate variable values in the output. If you pass an entire object reference, the whole object will by stringyfied and printed. So beware: for big objects you get the entire instantiation in code printed out!

Example:

::

    this.debug("I found this value for myVar: "+myVar);

.. _pages/debugging#console.log:

console.log()
-------------

In contrast to this.debug(), if you pass an object reference to ``console.log()`` Firebug will provide you with a nice hyperlink to the live object which you can follow to inspect the object in a structured way. This is much easier to navigate than to skim through pages of source output.

::

    var b = new qx.ui.form.Button();
    console.log(b);

.. _pages/debugging#this.trace:

this.trace()
------------

Will log the current stack trace using the defined logger. This can be useful to inspect from which method the current function was called.

::

    this.trace() 

.. _pages/debugging#getting_at_your_objects:

Getting at your Objects
=======================

This section shows you how to access objects of your application at *run time*, i.e. while it executes. Access to those objects is possible through JavaScript, either in the form of another piece of JavaScript code, or - especially interesting for debugging - from an interactive shell, like Firebug or Venkman, that allows for interactive input and execution of JavaScript commands.

.. _pages/debugging#qx.core.init.getapplication:

qx.core.Init.getApplication()
-----------------------------

In your running app, the singlton ``Init`` object provides you with the ``getApplication()`` method, to access the root object of your application. All members and sub-members that you have attached to your application class in your code are accessible this way.

::

    qx.core.Init.getApplication();

.. _pages/debugging#firebug_usage_idioms:

Firebug Usage Idioms
====================

.. _pages/debugging#inspect:

"Inspect"
---------

Getting at your application objects fast is a common requirement when debugging. A useful idiom (or usage pattern) with Firebug is to press the *"Inspect"* button and select the visible page element you are interested in. This will take Firebug to its HTML tab in a split-pane view. The left side holds the HTML code underlying your selection (which is probably not very enlightening). The right side though has a *"DOM"* tab, among others. Selecting this will show a display of the underlying DOM node, which features a ``qx_Widget`` attribute. This attribute is added to the outermost HTML tag representing a qooxdoo widget. For complex widgets that are made up of nested HTML elements, make sure to select the outermost container node that actually has this attribute ``qx_Widget``. It takes you straight to the qooxdoo object associated with the selected DOM node.

::

    Inspect -> Web page element -> HTML tab -> right side -> DOM tab -> qx_Widget link

