.. _pages/desktop/ui_interaction#interaction:

Interaction
***********

.. _pages/desktop/ui_interaction#register_listeners:

Register listeners
==================

To register listeners to a widget or other qooxdoo object just call ``addListener()`` with the given event type and callback method on them. The method will be executed every time the event occurs. Some types of events will bubble up the parent widget chain (such as mouse events, ...) while others are only fired on the original object (e.g. property changes, ...). A typical registration might look like this:

::

  obj.addListener("changeColor", this._onChangeColor, this);

The first parameter is the name of the event. The events supported by an object are listed in the API documentation of each class in the "Events" section. The second argument is a pointer to a function to call. The function can also be defined inline (in a closure). The third argument defines the context in which the function is executed. This argument is optional and defaults to the object which is listened to, e.g. a listener on a button will call a function on the button.

The method is called with the event object as the first and only argument. The event object contains all information about the target and state of the event and also contains some other useful data: Mouse events may contain mouse coordinates while focus events may contain the focused element. Data events typically contain the current value of the data field listened to.

Please note that event objects are automatically pooled after their dispatch. This is mainly for performance reasons; event objects are reused during the application runtime. That's why keeping references to event instances is not a good idea! If some of the data is needed later during the application runtime it is best to store the actual data and not the event object, e.g. store the coordinates instead of the mouse event object.

.. _pages/desktop/ui_interaction#event_phases:

Event Phases
============

In the browser most user input events like mouse or keyboard events are propagated from the target element up to the document root. In qooxdoo these events bubble up the widget hierarchy. This event propagation happens in two phases, the capturing and the bubbling event phase. The last parameter of the ``addListener(type, listener, context, capture)`` method defines whether the listener should be attached to the capturing (``true``) or bubbling (``false``) phase. 

In the capturing phase, the event is dispatched on the root widget first. Then it is dispatched on all widgets down the widget tree until the event target is reached. Now the event enters the bubbling phase. In this phase the event is dispatched in the opposite direction starting from the event target up to the root widget.

Most of the time only the bubbling phase is used but sometimes the capturing phase can be very useful. For example a capturing listener for "mousedown" events on the root widget is guaranteed to receive every "mousedown" event even if the target widget calls ``stopPropagation()`` on the event. Further it can be used to block events from sub widgets.

.. _pages/desktop/ui_interaction#mouse_events:

Mouse Events
============

qooxdoo supports all the typical mouse events: ``mousedown``, ``mouseup``, ``click`` and ``dblclick`` as well as ``mouseover`` and ``mouseout``. For most action-related widgets ``execute`` is the better choice than ``click`` (see the :ref:`section about basic widgets <pages/ui_widgets#widgets>`). All these events behave identically in all supported browsers, even the sequence in which they are fired is identical. All of them come with a usable ``target`` and sometimes even with a ``relatedTarget`` for ``mouseover`` and ``mouseout`` events. 

Every mouse event propagates the screen (e.g. ``getScreenLeft()``), document (e.g. ``getDocumentLeft()``) or viewport (e.g. ``getViewportLeft()``) coordinates through the available getters. The ``getWheelDelta()`` delta method provides information about the scroll amount of a ``mousewheel`` event. Some widgets like Spinners or SelectBoxes make use of this event already.

During every mouse event it is possible to check the status of modifier keys through the methods ``isCtrlPressed()``, ``isAltPressed()`` or ``isShiftPressed()``. The pressed button can be detected by calling one of the methods ``isLeftPressed()``, ``isMiddlePressed()`` or ``isRightPressed()`` on the mouse event.

See the `API documentation of the MouseEvent <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event.type.Mouse>`_ for a full list of all available methods.

.. _pages/desktop/ui_interaction#event_capturing:

Event Capturing
===============

Usually only the widget underneath the mouse cursor will receive mouse events. This can be a problem in drag operations where the mouse cursor can easily leave the dragged widget. This issue can be resolved in qooxdoo by declaring this widget a capturing widget using the widget's ``capture()`` method.

If a widget is a capturing widget, all mouse events will be dispatched on this widget, regardless of the mouse cursor's position. Mouse capturing is active until either a different widget is set to capture mouse events, the browser loses focus or the user clicks the left mouse button. If a widget loses its capture state a ``losecapture`` event is dispatched on the widget.

Internally, qooxdoo uses mouse capturing in menus, split panes or sliders for example.

.. _pages/desktop/ui_interaction#keyboard_support:

Keyboard Support
================

DOM3-like event handling was the prototype for qooxdoo's key event support. This means that key identifiers can be used (instead of un-unified key codes) which is much more comfortable than what is known from most web application frameworks. Basically each key on the keyboard has a name like ``Ctrl``, ``Shift``, ``F3`` or ``Enter``. A complete list of all supported keys is available in `the API documentation <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event.type.KeySequence~getKeyIdentifier>`_. 

All the typical key sequence events ``keyup``, ``keydown`` and ``keypress`` support the key identifier. The ``keypress`` event is repeated during the time the key is pressed. That's why ``keypress`` is the best candidate for most action related keyboard events. Only use ``keyup`` and ``keydown`` when you *really* depend on the status of the key.

To handle character inputs e.g. on text boxes, there is a special ``keyinput`` event which has nice unified accessors, ``getChar()`` and ``getCharCode()``, to detect the pressed character. This even automatically respects the effects modifier keys have, supporting e.g. German umlauts. The API lists all available methods of the `KeyInput <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event.type.KeyInput>`_ event.

.. _pages/desktop/ui_interaction#working_with_commands:

Working with Commands
=====================

Commands (`API <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.Command>`__) are used to bundle a command to be used by multiple buttons. They can also be used to define a global shortcut to be used for this action.

Creating new commands is as easy as it can be. A shortcut can simply be defined through the constructor, e.g.:

::

  var find = new qx.event.Command("Ctrl+F");
  find.addListener("execute", this._onFind, this);

The command can easily be attached to many types of Buttons etc. Some of them, like the ``MenuButtons``, automatically display the configured shortcut as well. As seen above, the Commands also make use of the key identifiers.

.. _pages/desktop/ui_interaction#focus_handling:

Focus Handling
==============

Good keyboard support also means good focus support. One major feature is the seamless integration between DOM focus handling and qooxdoo's focus handling. Both system communicate with each other. This makes it possible to integrate qooxdoo into normal web pages while still supporting the advanced focus features qooxdoo has to offer in qooxdoo-powered isles.

Focus handling in qooxdoo also means sophisticated support for the ``Tab`` key. While qooxdoo can also use the functionality provided by the browser, it adds its own layer for tab focus handling by default. This layer supports focus roots: A focus root is basically a widget which manages its own tab sequence. This is frequently used for many types of windows inside complex applications: Instead of leaving the window when reaching the last of its child widgets, the focus is moved back to the first child widget. The tab handling in qooxdoo is based on coordinates of each widget on the screen. It follows the visible structure and not the internal application (or even markup) structure. This is often seen as a huge benefit as it improves the usability of such applications out-of-the-box.
It is also possible to define a ``tabIndex`` on widgets which should be reachable in a static hard-coded way. It is not advisable to use this feature too much. The automatic handling works quite well out of the box without hard-wiring every widget to a specific tab position.

To make a widget focusable just enable the property ``focusable`` (`API <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.Widget~focusable>`__) on it. For most widgets, this will also means that the widget is reachable using the ``Tab`` key, but this depends on the widget's implementation of the method ``isTabable()``.

Every widget can function as a focus root. To register a widget as a focus root just call the method ``addRoot()`` of the ``FocusHandler`` like this:

::

  qx.ui.core.FocusHandler.getInstance().addRoot(myWidget);

Activation is related to focus. While focus is limited to widgets which are marked as ``focusable``, any widget can be activated. Usually, the activation moves around while clicking on widgets (during the ``mouseup`` event). The focus is applied to the next focusable parent while the activation directly happens on the widget that was clicked on. Activation is mainly used for keyboard support (key events start bubbling from the active widget). Compared to the focus, there is no visual highlighting for this state. To change the currently focused or active widget just call ``focus()`` or ``activate()``:

::

  myInputField.focus();

The properties ``keepFocus`` and ``keepActive`` are targeted more towards advanced users and developers of custom widgets. Both prevent the focus or active state from moving away (from the widget that currently has it) to the widget which has the specified property disabled. This is appropriate for complex widgets like a ComboBox where the activation should be kept on the ComboBox itself when selecting items from the dropdown list.
