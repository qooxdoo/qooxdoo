.. _pages/ui_widgets#widgets:

Basic Widgets
*************

.. note::
  This chapter introduces some of the widgets found in qooxdoo. For a full list of widgets, please refer to the :doc:`../widget/widget_ref`.

.. _pages/ui_widgets#labels:

Labels
======

Labels are one of the basic building blocks in applications. The qooxdoo Label supports two modes: One which combines simple single line text content with the possibility to automatically render an ellipsis in cases where not enough room is available. This is often the best choice for all types of simple labels and is the default mode in qooxdoo. Through technical restrictions it is not possible to insert HTML in a so-configured instance. The other mode allows rich content (HTML) and adds the option for multi-line content together with an advanced mechanism called *Height4Width* which automatically re-wraps content based on the available width. This mode however cannot handle automatic ellipsis (which makes less sense in multiline labels, but is also not technologically possible).

More details: :doc:`../widget/label`

.. _pages/ui_widgets#images:

Images
======

The second building block of applications. The image class in qooxdoo is quite sophisticated. PNG transparency is available in all browsers. Image data (e.g. format and dimension) is automatically pre-cached by the build system and distributed to the application for optional performance (avoiding page reflow during application startup for example). 

This data also makes it possible to allow semi-automatic image sprites, a feature which becomes more important in larger applications. Image sprites combine multiple images (perhaps even with multiple states) in a single image instance. Only the relevant part is shown, all other states or images are cropped. This has positive effects on the latency (e.g. number of HTTP requests needed) and also improves the runtime performance (switching a state in an image sprite is much faster than replacing the source of an image instance). Image sprites can be introduced in any application at any time without changing the application code. The original image path is automatically interpreted as a clipped image source with the needed offsets. Please note that this feature largely depends on qooxdoo's tool chain which is required to generate the image data for the client.

A major restriction of this technology is that the options to resize images on the client side are crippled (the normal image is rendered through a background-image definition and allows no stretching at all). The alternate mode renders the image using a normal image element. This is a good alternative whenever a part of the application depends on this scaling feature but should not be used unless necessary.

More details: :doc:`../widget/image`

.. _pages/ui_widgets#atoms:

Atoms
=====

Atoms have been in qooxdoo for quite some time now. Basically, this widget combines an Image with a Label and allows some alignment options for them. Both content types are optional and toggle-able. The Atom supports shrinking like the Label while keeping the image intact. Atoms are used by many higher level widgets like Buttons (in Tab Views, Toolbars, ...) or List Items etc.

More details: :doc:`../widget/atom`

.. _pages/ui_widgets#buttons:

Buttons
=======

The Button is basically an Atom with some additional events. All relevant rendering features are already provided by the Atom. Several variants of the Button are available: Repeat, Radio or Toggle Button.

The Button can be connected to a Command (a class to work with key bindings etc.) and fires an ``execute`` event when clicked (or activated via the keyboard). The Repeat Button fires the ``execute`` event in an interval while being pressed. The Toggle Button (which toggles between checked and unchecked) is an exception to this and fires a ``change`` event on each transition of the ``checked`` property.

More details: :doc:`../widget/button`

.. _pages/ui_widgets#text_fields:

Text Fields
===========

The Text Field is one of the most commonly used form elements. It fires two events: The ``input`` event is fired on every keystroke or other type of text modification. This event fires "live", i.e. whenever a modification is made. If the application does not need this level of detailed information, it should use the ``change`` event which fires after the modification is done, typically after the field has lost focus.

The Text Field supports basic label alignment to ``left``, ``center`` or ``right``. Preventing user inputs is possible through the property ``enabled`` or ``readOnly``. Disabling a widget greys it out and makes it unresponsive for all types of interaction while ``readOnly`` only prevents the modification of the value and normally has no special visual indication when enabled.

More details: :doc:`../widget/textfield`

.. _pages/ui_widgets#popups:

Popups
======

Popups and Tooltips are comparable in some way. Both are rendered above other content (while tooltips are even above Popups). Both widgets are automatically inserted into the application root widget (can be overridden when needed).

Popups may be used for notification panels or a type of modal sub dialog. Basically they are just a container (with a configurable layout) which lays above normal content. 

By default, popups are automatically hidden if the user interacts with some other part of the application. This behavior is controllable through the ``autoHide`` property. Popups are automatically moved back inside the viewport. In fact, it is not possible to place Popups outside the viewport (not even partly). This behavior makes sense in almost every case and improves the usability of popups in general.

With ``bringToFront`` and ``sendToBack`` the popups' zIndex can be controlled in relation to other visible popups.

More details: :doc:`../widget/popup`

.. _pages/ui_widgets#tooltips:

Tooltips
========

Tooltips are basically Popups with an Atom in them. But Tooltips improve on many of the features of the normal Popup. The automatic positioning support as mentioned for the Popups supports offsets as well and automatically moves the Tooltip to the best possible side in relation to the mouse cursor's position. 

Although it's generally not necessary, every popup can be configured with an individual timeout. This is useful when building different type of tooltips e.g. to display system notifications etc.

More details: :doc:`../widget/tooltip`

