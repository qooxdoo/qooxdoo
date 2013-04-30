Migration from %{Desktop} 2.x
*****************************

%{Desktop} 3.0 introduced some major changes to the internals of qooxdoo's desktop widget system: Before, each Widget consisted of (at least) three DOM elements and their `JavaScript object representations <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.html.Element>`_: Container, content and decorator. In an effort to improve UI performance and decrease memory load, this was reduced to **just one content element**.

While most modifications were made "under the hood", affecting mostly internal APIs, some manual adjustments to existing applications based on 2.x may be required if custom themes and/or layouts are used.

General Information
===================

* Widgets no longer have decorator, container or protector elements. ``qx.ui.core.Widget.getDecoratorElement`` has been removed; ``getContainerElement`` is deprecated and returns the content element
* **Internet Explorer 7 is no longer supported** since ``box-sizing: border-box`` is used extensively
* Some theming features no longer have fallback implementations for legacy browsers (see below for details)

Custom Themes
=============

Decoration Theme
----------------

* ``inset`` keys should be replaced with ``padding`` TODO: More info

* The ``decorator`` theme key will be ignored. All decorations now use `a common class <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.Decorator>`_, which supports all decoration features

* ``qx.ui.decoration.Grid``, ``GridDiv``, ``BoxDiv``, ``AbstractBox``, ``HBox``, and ``VBox`` have been removed. These classes were responsible for providing image-based fallback implementations for border-image and background-gradient decorators, meaning **border-image decorations are no longer available in Internet Explorer 8 - 10**. The properties of `MLinearGradient <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MLinearGradient>`_ and `MBorderImage <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MBorderImage>`_ provide these features for most modern browsers. `borderImage <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MBorderImage~borderImage!property>`_ is the new equivalent of the old ``baseImage`` property.

* ``qx.ui.decoration.Beveled`` and ``Uniform`` are deprecated. Use the `width <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MSingleBorder~width!property>`_, `style <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MSingleBorder~style!property>`_, `color <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MSingleBorder~color!property>`_ and `backgroundImage <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MBackgroundImage~backgroundImage!property>`_ properties instead.

* ``qx.ui.decoration.Double`` is also deprecated. Use the properties of `MDoubleBorder <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MDoubleBorder>`_ instead. This uses CSS3 box shadows so **double borders are no longer supported in IE 8**.

* ``qx.ui.decoration.DynamicDecorator`` has been deprecated in favor of `decoration.Decoration <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.Decoration>`_.

Custom Decorators
-----------------

* ``qx.ui.decoration.IDecoration``: ``getMarkup``, ``tint`` and ``resize`` were removed. ``getStyles`` was added: This method is responsible for adding the Decorator's CSS styles to a map of existing styles

Appearance Theme
----------------

* The key ``shadow`` is no longer supported in the map returned by the ``style`` function. Use ``qx.ui.decoration.MBoxShadow``'s properties instead (in Decoration)

Widgets
=======

* ``qx.ui.core.Widget.getDecoratorElement`` was removed. ``getContainerElement`` is deprecated and returns the content element: use ``getContentElement`` instead
* ``qx.ui.core.Widget.getContainerLocation`` is deprecated: use ``getContentLocation`` instead
* The ``shadow`` property has been removed. Use the ``shadowXYZ`` decoration properties instead
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

* removed ``qx.ui.core.DecoratorFactory`` and ``qx.html.Decorator``

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
