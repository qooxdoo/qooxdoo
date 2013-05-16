.. _pages/on_mobile#using_deskltop_on_mobile_devices:

Using %{Desktop} on Mobile Devices
**********************************

General Statement
=================
All modern mobile devices supply a standard compliant web browser, most likely webkit-based. The most obvious difference between desktop and mobile browsers can be found in the events fired. The desktop browsers supply mouse evens, which means events for the buttons (up, down, click), hovered items (over and out), scroll and move are available. Mobile devices are usually based on touch interaction and therefore, fire touch events. But to supply backward compatibility, mobile browsers emulate mouse events but with a slight delay compared to the touch events. This delay is mostly responsible for a sluggish feel of the UI. The `Apple documentation about handling events <https://developer.apple.com/library/ios/#DOCUMENTATION/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html>`__ covers the event handling of mobile devices in more detail.

Emulate Mouse
=============
With the knowledge of the browser generated delay for mouse events, we thought of a way to eliminate it by relying on the touch events instead of the browser based mouse events. This means we have to disable the mouse event handler we usually use for mouse interaction and supply a new one listening to the touch events and fake the mouse events. This is what Emulate Mouse does.

How to use it?
==============
Enabling this feature is quite easy for the application developer. It is available as a :ref:`enviornment <pages/core/environment#environment>` setting named ``qx.emulatemouse``. Setting the value to ``true`` in the :ref:`config.json <pages/tool/generator/generator_config_ref#environment>` will enabled the mouse emulation as soon as touch event are supported.

Technical Realization
=====================
As you might have already guessed, emulation mouse events based on touch events can never emulate every event the mouse has to offer. The most obvious event are the mouseover / mouseout event. Nevertheless we tried to do out best by emulating the following events based on the listed touch events.

* ``touchstart``: triggers a ``mousedown`` event. Keep in mind that there is also a ``touchstart`` event if you start scrolling or use any other gesture.

* ``touchmove``: results in two different kind of events. The obvious one is the ``mousemove`` event. The second event is ``mousewheel`` event which is responsible for the scrolling behavior. There is also a algorithm for momentum scrolling included.

* ``touchend``: triggers a ``mouseup`` event.

* ``tap``: is a qooxdoo based event which is already normalized and will be fired on a user tap. This results into a ``click`` event.

|emulatemouse.png|

.. |emulatemouse.png| image:: emulatemouse.png