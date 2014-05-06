.. _pages/event_layer_impl#the_event_layer:

The Event Layer
***************

The class `qx.event.Manager <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event.Manager>`_ provides a per-document wrapper for cross-browser DOM event handling. The implementation of the event layer is inside the `qx.event <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event>`_ namespace.

The following features work in all :ref:`supported browsers <pages/website/requirements#client>`:

* Canceling events: ``stopPropagation()``
* Skipping the browser's default behavior: ``preventDefault()``
* Unified event objects matching the `W3C DOM 2 event interface <http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface>`_
* Cross-browser event *bubbling* and *capturing* phase, even in Internet Explorer
* `Pointer event capturing <http://msdn2.microsoft.com/en-us/library/ms537630.aspx>`_
* Unified key events. For a full list of available key identifiers see the `getKeyIdentifier() <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event.type.KeySequence~getKeyIdentifier>`_ method documentation of the ``qx.event.type.KeySequence`` class.
* Unified :ref:`pointer events <pages/pointer#pointer_events>`