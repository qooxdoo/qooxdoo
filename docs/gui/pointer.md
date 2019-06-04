Pointer Events
==============

qooxdoo's pointer events layer offers a unified set of events that work across all three GUI toolkits (desktop, mobile and website) regardless of which input device type (mouse, touch or stylus) is used. This enables developers to create GUIs that work on touch devices such as smartphones and tablets just as well as on PCs.

This layer is the foundation for high-level gesture events \<pages/gestures\#gesture\_events\>, and is based on the [W3C Pointer Events candidate recommendation](http://www.w3.org/TR/pointerevents/), a specification that is based on mouse events and maps all input devices to pointer events. It extends the mouse event type with additional information like the ID of the pointer for multi pointer devices.

Currently, only IE 10+ supports pointer events natively. In all other browsers, native touch or mouse events are translated into synthetic pointer events. This translation layer checks for native pointer events availability so that no modifications to framework or application code should be necessary as more browsers gain native pointer events support.

Supported Pointer Events
------------------------

The following events are available in all of qooxdoo's GUI toolkits:

-   pointerover
-   pointerout
-   pointermove
-   pointerdown
-   pointerup
-   pointercancel

[Pointer event API documentation](http://demo.qooxdoo.org/current/apiviewer/index.html#qx.event.type.Pointer)

Note that not all events mentioned in the specification are listed here. We chose to only implement the event types required for qooxdoo's widgets, which is one reason why we don't like to call this implementation a polyfill, even if in most areas it conforms to the the spec and is quite broad in scope.
