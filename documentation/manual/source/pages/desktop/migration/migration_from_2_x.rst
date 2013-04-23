Migration from %{Desktop} 2.x
*****************************

General Information
===================

* Widgets no longer have decorator, container or protector elements
* IE 7 is no longer supported since ``box-sizing: border-box`` is used to size DOM elements
* Some theming features no longer have fallback implementations for legacy browsers

Custom Themes
=============

Decoration Theme
----------------

* ``inset`` keys should be replaced with ``padding`` TODO: More info
* The 'decorator' theme key will be ignored. All decorations now use ``qx.ui.decoration.Decorator``, which supports all decoration features
* removed decoration classes:
  * ``Grid``, ``GridDiv``, ``BoxDiv``, AbstractBox, ``HBox``, ``VBox`` and ``css3.BorderImage`` -> borderImage
* Deprecated decoration classes:
  * DynamicDecorator, Beveled (MSingleBorder#style), Uniform, Background
* Removed decoration fallbacks:
  * ``borderImage`` (IE 8, 9, 10)
  * double border/``boxShadow`` (IE < 9)
  * ``baseImage`` renamed to ``borderImage``

Custom Decorators
-----------------

  * ``qx.ui.decoration.IDecoration``: ``getMarku``, ``tint`` and ``resize`` were removed. ``getStyles`` was added

Appearance Theme
----------------

* The key ``shadow`` is no longer supported in the map returned by the ``style`` function. Use ``qx.ui.decoration.MBoxShadow``'s properties instead (in Decoration)

Widgets
=======

* ``qx.ui.core.Widget.getDecoratorElement`` was removed. ``getContainerElement`` is deprecated and returns the content element: use ``getContentElement`` instead
* ``qx.ui.core.Widget.getContainerLocation`` is deprecated: use ``getContentLocation`` instead
* The ``shadow`` property has been removed (use the ``shadowXYZ`` decoration properties instead)
* Separators are now instances of ``qx.ui.core.Widget`` instead of ``qx.html.Element``

Other Code Changes
==================
old:
var htmlDecorator = new qx.ui.decoration.Single(1, "solid", "border-main");
new:
var htmlDecorator = new qx.ui.decoration.Decorator().set({
  width: 1,
  style: "solid",
  color: "border-main"
});

old:
new qx.ui.decoration.Background().set({
  backgroundColor : "white"
});
new:
new qx.ui.decoration.Decorator().set({
  backgroundColor: "white"
});

removed ``qx.ui.core.DecoratorFactory`` and ``qx.html.Decorator``

Custom Layouts
==============

Custom layouts extending ``qx.ui.layout.Abstract`` must be adjusted: The ``renderLayout`` method is now called with a map containing the container's ``top``, ``bottom``, ``left`` and ``right`` padding values as an additional third argument. These values must be taken into consideration when calculating the layout children's size and position.

Implementation changes
======================

* Decorations are compiled as CSS classes and applied to a central style sheet
* Several qx.ui.decoration classes have been removed
* background gradients are rendered using Canvas in IE9
* CSS clip is used to apply padding to combined images
* fallback placeholder implementation for text fields: placeholder element is attached to the field's layout parent
* ``qx.ui.embed.Iframe``'s blocker element is now attached to the application root
* Default ``zIndex`` for Widgets is now 10
* ``qx.html.Element`` now supports addition and removal of CSS classes
* ``qx.ui.tooltip.ToolTip``: The arrow is rendered using a separate child control
* removed the non-CSS3 fallbacks from the Modern and Classic themes
* ``qx.ui.basic.Image``: padding is applied as background-position
