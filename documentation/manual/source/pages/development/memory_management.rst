.. _pages/memory_management#memory_management:

Memory Management
*****************

.. _pages/memory_management#introduction:

Introduction
============

Generally, qooxdoo's runtime will take care of most of the issues around object disposal, so you don't have to be too anxious if you get those 'missing destruct declaration' messages from a verbose disposer run.

To destruct existing objects at the end of your application is an important feature in the ever growing area of web applications. Widgets and models are normally handling a few storage fields on each instance. These fields need the dispose process to work without memory leaks.

Normally, JavaScript automatically cleans up. There is a built-in garbage collector in all engines. But these engines are more or less buggy. One problematic issue is that browsers differentiate between DOM and JavaScript and use different garbage collection systems for each (This does not affect all browsers, though). Problems arise when objects create links between the two systems. Another issue are circular references which could not be easily resolved, especially by engines which rely on a reference counter.

To help the buggy engines to collect the memory correctly it is helpful to dereference complex objects from each other, e.g. instances from maps, arrays and other instances. You don't need to delete primitive types like strings, booleans and numbers.

qooxdoo has solved this issue from the beginning using the included "dispose" methods which could be overridden and extended by each class. qooxdoo 0.7 introduced `a new class declaration <http://attic.qooxdoo.org/documentation/0.7/class_declaration>`_. This class declaration supports real "destructors" as known from other languages. These destructors are part of the class declaration. The new style makes it easier to write custom destructor/disposer methods because there are many new helper methods and the whole process has been streamlined to a great extend.

.. _pages/memory_management#disposing_an_application:

Disposing an application
========================

You can dispose any qooxdoo based application by simply calling ``qx.core.ObjectRegistry.shutdown()``. The simplest possibility is to use the command line included in Firebug. Another possibility is to add a HTML link or a button to your application which executes this command.  

You can look at the dispose behaviour of your app if you set the disposer into a verbose mode and then invoke it deliberately while your app is running. This will usually render your app unusable, but you will get all those messages hinting you at object properties that might need to be looked after. How-To instructions can be found :ref:`here <pages/memory_management#how_to_test_the_destructor>`. But mind that the disposer output contains only hints, that still need human interpretation.

.. _pages/memory_management#example_destructor:

Example destructor
==================

::

    destruct : function()
    {
      this._data = this._moreData = null;
      this._disposeObjects("_buttonOk", "_buttonCancel");
      this._disposeArray("_children");
      this._disposeMap("_registry");
    }

* ``_disposeObjects``: Supports multiple arguments. Dispose the objects (qooxdoo objects) under each key and finally delete the key from the instance.
* ``_disposeArray``: Disposes the array under the given key, but disposes all entries in this array first. It must contain instances of qx.core.Object only.
* ``_disposeMap``: Disposes the map under the given key, but disposes all entries in this map first. It must contain instances of qx.core.Object only.

.. _pages/memory_management#how_to_test_the_destructor:

How to test the destructor
==========================

The destructor code allows you an in-depth analysis of the destructors and finds fields which may leak etc. The DOM tree gets also queried for back-references to qooxdoo instances. These checks are not enabled by default because of the time they need on each unload of a typical qooxdoo based application. 

To enable these checks you need to select a variant and configure a setting.

The environment setting ``qx.debug`` must be ``true``. The setting ``qx.debug.dispose.level`` must be at least at ``1`` to show not disposed qooxdoo objects if they need to be deleted. A setting of ``2`` will additionally show non qooxdoo objects. Higher values mean more output. Don't be alarmed if some qooxdoo internal showing up. Usually there is no need to delete all references. `Garbage collection <http://bugzilla.qooxdoo.org/show_bug.cgi?id=3411#c2>`_ can do much for you here. For a general analysis ``1`` should be enough, a value of ``2`` should be used to be sure you did not miss anything. You can use the following code to adapt your ``config.json``: 

::

    {
      "jobs" :
      {
        // existing jobs ...
        "source-disposerDebug" : 
        {
          "desc" : "source version with 'qx.debug.dispose.level' for destruct support",
          
          "extend" : [ "source" ],
          
          "environment" :
          {
             "qx.debug.dispose.level" : "2"
          }
        }
      }
    }


This snippet is also available at the `Support for finding potential memory leaks <http://qooxdoo.org/docs/general/snippets#support_for_finding_potential_memory_leaks>`_ .

Log output from these settings could look something like this:

::

    35443 DEBUG: testgui.Report[1004]: Disposing: [object testgui.Report]FireBug.js (line 75)
    Missing destruct definition for '_scroller' in qx.ui.table.pane.FocusIndicator[1111]: [object qx.ui.table.pane.Scroller]Log.js (line 557)
    Missing destruct definition for '_lastMouseDownCell' in qx.ui.table.pane.Scroller[1083]: [object Object]Log.js (line 557)
    036394 DEBUG: testgui.Form[3306]: Disposing: [object testgui.Form]FireBug.js (line 75)
    Missing destruct definition for '_dateFormat' in qx.ui.component.DateChooserButton[3579]: [object qx.util.format.DateFormat]Log.js (line 557)
    Missing destruct definition for '_dateFormat' in qx.ui.component.DateChooserButton[3666]: [object qx.util.format.DateFormat]Log.js (line 557)

The nice thing here is that the log messages already indicate which dispose method to use: Every *"Missing destruct..."* line contains a hint to the type of member that is not being disposed properly, in the *"[object ...]"* part of the line. As a rule of thumb

* native Javascript types (Number, String, Object, ...) usualy don't need to be disposed.
* for qooxdoo objects (e.g. qx.util.format.DateFormat, testgui.Report, ...) use ``_disposeObjects``
* for arrays or maps of qooxdoo objects use ``_disposeArray`` or ``_disposeMap``.
* be sure to cut all references to the DOM because garbage collection can not dispose object still connected to the DOM. This is also true for event listeners for example.

.. _pages/memory_management#finding_memory_leaks:

Finding memory leaks
====================

qooxdoo contains a built-in dispose profiling feature that finds undisposed objects. This is useful mainly for applications that create and destroy objects as needed during their lifetime (instead of creating them once and re-using them). It cannot be used to find undisposed objects left over after the application was shut down. 

Dispose profiling works by disabling a feature in qooxdoo's Object Registry where the hash codes used to identify objects are reused. That way, it is possible to iterate over all objects created between two specified points in the application's lifecycle and check if they're disposed. Since hash reusing is a performance feature, dispose profiling should only be activated for the development version of an application.
It is activated by enabling the **qx.debug.dispose** environment setting for a compile job, e.g. `source-script`:

::

  "source-script" :
  {
    "environment" :
    {
      "qx.debug.dispose" : true
    }
  }

After building the application, the dispose debugging workflow is as follows:

* Call `qx.dev.Debug.startDisposeProfiling <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.dev.Debug~startDisposeProfiling>`_ before the code you wish to debug is executed. This effectively sets a marker saying "ignore any objects created before this point in time".
* Execute the code to be debugged, e.g. create a view component, then destroy it.
* Call `qx.dev.Debug.stopDisposeProfiling <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.dev.Debug~stopDisposeProfiling>`_. It will return a list of maps containing references to the undisposed objects as well as stack traces taken at the time the objects were registered, which makes it easy to find where in the code they were instantiated. Go through the list and add ``destroy`` and/or ``dispose`` calls to the application as needed.
 
