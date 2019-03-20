Interaction
===========

Register listeners
------------------

To register listeners to a widget or other qooxdoo object just call `addListener()` with the given event type and callback method on them. The method will be executed every time the event occurs. Some types of events will bubble up the parent widget chain (such as pointer events, ...) while others are only fired on the original object (e.g. property changes, ...). A typical registration might look like this:

    obj.addListener("changeColor", this._onChangeColor, this);

The first parameter is the name of the event. The events supported by an object are listed in the API documentation of each class in the "Events" section. The second argument is a pointer to a function to call. The function can also be defined inline (in a closure). The third argument defines the context in which the function is executed. This argument is optional and defaults to the object which is listened to, e.g. a listener on a button will call a function on the button.

The method is called with the event object as the first and only argument. The event object contains all information about the target and state of the event and also contains some other useful data: Pointer events may contain coordinates while focus events may contain the focused element. Data events typically contain the current value of the data field listened to.

Please note that event objects are automatically pooled after their dispatch. This is mainly for performance reasons; event objects are reused during the application runtime. That's why keeping references to event instances is not a good idea! If some of the data is needed later during the application runtime it is best to store the actual data and not the event object, e.g. store the coordinates instead of the pointer event object.

Event Phases
------------

In the browser most user input events like pointer or keyboard events are propagated from the target element up to the document root. In qooxdoo these events bubble up the widget hierarchy. This event propagation happens in two phases, the capturing and the bubbling event phase. The last parameter of the `addListener(type, listener, context, capture)` method defines whether the listener should be attached to the capturing (`true`) or bubbling (`false`) phase.

In the capturing phase, the event is dispatched on the root widget first. Then it is dispatched on all widgets down the widget tree until the event target is reached. Now the event enters the bubbling phase. In this phase the event is dispatched in the opposite direction starting from the event target up to the root widget.

Most of the time only the bubbling phase is used but sometimes the capturing phase can be very useful. For example a capturing listener for "pointerdown" events on the root widget is guaranteed to receive every "pointerdown" event even if the target widget calls `stopPropagation()` on the event. Further it can be used to block events from sub widgets.

Pointer Events
--------------

qooxdoo abstracts mouse and touch events in pointer events. This is the preferred way to react to user input from either a mouse or a touch device. Check out the specified manual page about pointer events \<pages/pointer\#pointer\_events\> for more details on that topic. Mouse and touch events are also supported and can be used.

Mouse Events
------------

qooxdoo supports all the typical mouse events: `mousedown`, `mouseup`, `click` and `dblclick` as well as `mouseover` and `mouseout`. For most action-related widgets `execute` is the better choice than `click` (see the section about basic widgets \<pages/ui\_widgets\#widgets\>). All these events behave identically in all supported browsers, even the sequence in which they are fired is identical. All of them come with a usable `target` and sometimes even with a `relatedTarget` for `mouseover` and `mouseout` events.

Every mouse event propagates the screen (e.g. `getScreenLeft()`), document (e.g. `getDocumentLeft()`) or viewport (e.g. `getViewportLeft()`) coordinates through the available getters. The `getWheelDelta()` delta method provides information about the scroll amount of a `mousewheel` event. Some widgets like Spinners or SelectBoxes make use of this event already.

During every mouse event it is possible to check the status of modifier keys through the methods `isCtrlPressed()`, `isAltPressed()` or `isShiftPressed()`. The pressed button can be detected by calling one of the methods `isLeftPressed()`, `isMiddlePressed()` or `isRightPressed()` on the mouse event.

See the [API documentation of the MouseEvent](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event.type.Mouse) for a full list of all available methods.

Touch Events
------------

qooxdoo supports all the touch events: `touchstart`, `touchmove`, `touchend` and `touchcancel`.

Every touch event propagates the screen (e.g. `getScreenLeft()`), document (e.g. `getDocumentLeft()`) or viewport (e.g. `getViewportLeft()`) coordinates through the available getters.

See the [API documentation of the TouchEvent](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event.type.Touch) for a full list of all available methods.

Event Capturing
---------------

Usually only the widget underneath the pointer will receive events. This can be a problem in drag operations where the pointer can easily leave the dragged widget. This issue can be resolved in qooxdoo by declaring this widget a capturing widget using the widget's `capture()` method.

If a widget is a capturing widget, all pointer events will be dispatched on this widget, regardless of the pointer's position. Capturing is active until either a different widget is set to capture events, the browser loses focus or the user taps the primary button. If a widget loses its capture state a `losecapture` event is dispatched on the widget.

Internally, qooxdoo uses capturing in menus, split panes or sliders for example.

Promise Support
---------------

Event handlers are called in sequence, but if an event handler returns a `qx.Promise` then the event handling chain will be suspended until the promise is resolved; if the promise is rejected, then the event's `stopPropagation()` method will be called and the usual behaviour for handling aborted events will apply.

Note that this is not able to stop different physical events - for example, "mousedown" and "mouseup" are two completely separate events sent by the browser in response to physical user events, and if you return a promise from a "mousedown" handler this will not prevent "mouseup" being sent a few milliseconds later; of course, because these events are technically unrelated there is no guarantee that just because a widget sees a "mousedown" event it would see a "mouseup" in the first place, or vice versa.

Keyboard Support
----------------

DOM3-like event handling was the prototype for qooxdoo's key event support. This means that key identifiers can be used (instead of non-unified key codes) which is much more comfortable than what is known from most web application frameworks. Basically each key on the keyboard has a name like `Ctrl`, `Shift`, `F3` or `Enter`. A complete list of all supported keys is available in [the API documentation](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event.type.KeySequence~getKeyIdentifier).

All the typical key sequence events `keyup`, `keydown` and `keypress` support the key identifier. The `keypress` event is repeated during the time the key is pressed. That's why `keypress` is the best candidate for most action related keyboard events. Only use `keyup` and `keydown` when you *really* depend on the status of the key.

To handle character inputs e.g. on text boxes, there is a special `keyinput` event which has nice unified accessors, `getChar()` and `getCharCode()`, to detect the pressed character. This even automatically respects the effects modifier keys have, supporting e.g. German umlauts. The API lists all available methods of the [KeyInput](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.event.type.KeyInput) event.

Working with Commands
---------------------

Commands ([API](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.command.Command)) are used to bundle a command to be used by multiple buttons. They can also be used to define a global shortcut to be used for this action.

Creating new commands is as easy as it can be. A shortcut can simply be defined through the constructor, e.g.:

    var findCommand = new qx.ui.command.Command("Ctrl+F");
    findCommand.addListener("execute", this._onFind, this);

The command can easily be attached to many types of Buttons etc. Some of them, like the `MenuButtons`, automatically display the configured shortcut as well. As seen above, the Commands also make use of the key identifiers.

    var button = new qx.ui.form.Button("Search");
    button.setCommand(findCommand);

Sometimes it's useful to create groups of commands, especially if you want to define the same shortcut in different commands. With the ([API](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.command.Group)) class, you can logically organize your commands as well as activate or deactivate all added commands at once.

    var group1 = new qx.ui.command.Group();
    group1.add("find", new qx.ui.command.Command("Ctrl+F"));
    group1.add("copy", new qx.ui.command.Command("Ctrl+C"));
    group1.add("paste", new qx.ui.command.Command("Ctrl+V"));
    group1.add("showPage2", new qx.ui.command.Command("2"));
    group1.setActive(false); // all commands will be deactivated

We also provide you with a manager to handle command groups more comfortable. A common use case is to create multiple instances of one view. If every instance creates the same set of commands, a global shortcut will invoke the command on all instances. Now you can easily add your command groups to a command group manager which will activate only one group. An implementation could look like this:

    var manager = new qx.ui.command.GroupManager();
    manager.addGroup(group1);
    manager.addGroup(group2);
    manager.addGroup(group3);
    manager.setActiveGroup(group2); // this will deactivate all command groups except group2

Furthermore you are able to block even the active command group by the manager. This is useful for disabling commands on focused input field.

    var btn = new qx.ui.form.TextField();
    btn.setPlaceholder("If focused here, all commands will be disabled!");
    btn.addListener("focusin", manager.block, this);
    btn.addListener("focusout", manager.unblock, this);

Here you can find an example: ([Demobrowser](http://demo.qooxdoo.org/%{version}/demobrowser/#ui~CommandGroupManager.html))

Focus Handling
--------------

Good keyboard support also means good focus support. One major feature is the seamless integration between DOM focus handling and qooxdoo's focus handling. Both system communicate with each other. This makes it possible to integrate qooxdoo into normal web pages while still supporting the advanced focus features qooxdoo has to offer in qooxdoo-powered isles.

Focus handling in qooxdoo also means sophisticated support for the `Tab` key. While qooxdoo can also use the functionality provided by the browser, it adds its own layer for tab focus handling by default. This layer supports focus roots: A focus root is basically a widget which manages its own tab sequence. This is frequently used for many types of windows inside complex applications: Instead of leaving the window when reaching the last of its child widgets, the focus is moved back to the first child widget. The tab handling in qooxdoo is based on coordinates of each widget on the screen. It follows the visible structure and not the internal application (or even markup) structure. This is often seen as a huge benefit as it improves the usability of such applications out-of-the-box. It is also possible to define a `tabIndex` on widgets which should be reachable in a static hard-coded way. It is not advisable to use this feature too much. The automatic handling works quite well out of the box without hard-wiring every widget to a specific tab position.

To make a widget focusable just enable the property `focusable` ([API](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.Widget~focusable)) on it. For most widgets, this will also means that the widget is reachable using the `Tab` key, but this depends on the widget's implementation of the method `isTabable()`.

Every widget can function as a focus root. To register a widget as a focus root just call the method `addRoot()` of the `FocusHandler` like this:

    qx.ui.core.FocusHandler.getInstance().addRoot(myWidget);

Activation is related to focus. While focus is limited to widgets which are marked as `focusable`, any widget can be activated. Usually, the activation moves around while tapping on widgets (during the `pointerup` event). The focus is applied to the next focusable parent while the activation directly happens on the widget that was tapped on. Activation is mainly used for keyboard support (key events start bubbling from the active widget). Compared to the focus, there is no visual highlighting for this state. To change the currently focused or active widget just call `focus()` or `activate()`:

    myInputField.focus();

The properties `keepFocus` and `keepActive` are targeted more towards advanced users and developers of custom widgets. Both prevent the focus or active state from moving away (from the widget that currently has it) to the widget which has the specified property disabled. This is appropriate for complex widgets like a ComboBox where the activation should be kept on the ComboBox itself when selecting items from the dropdown list.
