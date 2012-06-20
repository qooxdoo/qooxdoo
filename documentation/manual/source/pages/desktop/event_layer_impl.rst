.. _pages/event_layer_impl#the_event_layer:

The Event Layer
***************

The class `qx.event.Manager <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event.Manager>`_ provides a per-document wrapper for cross-browser DOM event handling. The implementation of the event layer is inside the `qx.event <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event>`_ namespace.

The following features work in all :ref:`supported browsers <pages/website/requirements#client>`:

* Canceling events: ``stopPropagation()``
* Skipping the browser's default behavior: ``preventDefault()``
* Unified event objects matching the `W3C DOM 2 event interface <http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface>`_ 
* Cross-browser event *bubbling* and *capturing* phase, even in Internet Explorer
* `Mouse event capturing <http://msdn2.microsoft.com/en-us/library/ms537630.aspx>`_
* Port of the unified `qooxdoo 0.7 key event handler <http://attic.qooxdoo.org/documentation/0.7/keyboard_events>`_ to the 1.2 low-level layer. For a full list of available key identifiers see the `getKeyIdentifier() <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event.type.KeySequence~getKeyIdentifier>`_ method documentation of the ``qx.event.type.KeySequence`` class.
* Unified mouse events

  * Normalized double click event sequence ``mousedown`` -> ``mouseup`` -> ``click`` -> ``mousedown`` -> ``mouseup`` -> ``click`` -> ``doubleclick`` in Internet Explorer
  * Normalized right click sequence ``mousedown`` -> ``mouseup`` -> ``contextmenu`` in Safari 3 and Opera.
  * Always fire ``click`` events if the ``mouseup`` happens on a different target than the corresponding ``mousedown`` event. Natively only Internet Explorer behaves like that.

.. _pages/event_layer_impl#uml_class_diagram:

UML Class Diagram
=================

|:documentation:general:eventhandler.jpg|

.. |:documentation:general:eventhandler.jpg| image:: eventhandler.jpg

