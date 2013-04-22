Migration from %{Desktop} 2.x
*****************************

General Information
===================

* IE 7 is no longer supported since ``box-sizing: border-box`` is used to size DOM elements
* Decorations are compiled as CSS classes and applied to a central style sheet
* Several qx.ui.decoration classes have been deprecated: ``Grid``, ``GridDiv``, ``BoxDiv``, ``HBox``, ``VBox`` and ``css3.BorderImage``
* Some theming features no longer have fallback implementations for legacy browsers:
  * ``borderRadius`` (IE < 9)
  * ``borderImage`` (IE 8, 9, 10)
  * double border/``boxShadow`` (IE < 9)

Theming
=======

Decoration Theme
----------------

* ``inset`` keys should be replaced with ``padding``
* The 'decorator' key is no longer required since ui.decoration.Decorator supports all decoration features

Appearance Theme
----------------

* The key ``shadow`` is no longer supported in the map returned by the ``style`` function. Use ``qx.ui.decoration.MBoxShadow``'s properties instead

Widgets
=======

* ``qx.ui.core.Widget.getDecoratorElement`` and ``getContainerElement`` are deprecated: use ``getContentElement`` instead
* ``qx.ui.core.Widget.getContainerLocation`` is deprecated: use ``getContentLocation`` instead
* ``qx.ui.core.Widget.getShadowElement`` is deprecated (no replacement)
* Separators are now instances of ``qx.ui.core.Widget`` instead of ``qx.html.Element``

Layouting
=========

Custom layouts extending ``qx.ui.layout.Abstract`` must be adjusted: The ``renderLayout`` method is now called with a map containing the container's ``top``, ``bottom``, ``left`` and ``right`` padding values as an additional third argument. These values must be taken into consideration when calculating the layout children's size and position.
