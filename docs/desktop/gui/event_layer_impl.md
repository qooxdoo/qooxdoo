# The Event Layer

The class
[qx.event.Manager](apps://apiviewer/#qx.event.Manager)
provides a per-document wrapper for cross-browser DOM event handling.
The implementation of the event layer is inside the
[qx.event](apps://apiviewer/#qx.event) namespace.

The following features work in all supported browsers:

  - Canceling events: `stopPropagation()`
  - Skipping the browser's default behavior: `preventDefault()`
  - Unified event objects matching the [W3C DOM 2 event
    interface](http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface)
  - Cross-browser event *bubbling* and *capturing* phase, even in
    Internet Explorer
  - [Pointer event
    capturing](http://msdn2.microsoft.com/en-us/library/ms537630.aspx)
  - Unified key events. For a full list of available key identifiers see
    the
    [getKeyIdentifier()](apps://apiviewer/#qx.event.type.KeySequence~getKeyIdentifier)
    method documentation of the `qx.event.type.KeySequence` class.
  - Unified [pointer events](pointer.md#pointer_events)
