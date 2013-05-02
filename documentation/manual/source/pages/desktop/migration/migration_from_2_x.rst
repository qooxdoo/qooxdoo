Migration from %{Desktop} 2.x
*****************************

%{Desktop} 3.0 introduced some major changes to the internals of qooxdoo's desktop widget system: Before, each Widget consisted of (at least) three DOM elements and their `JavaScript object representations <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.html.Element>`_: Container, content and decorator. In an effort to improve UI performance and decrease memory load, this was reduced to **just one content element**. This means Widgets no longer have decorator, container or protector elements. To achieve this, the new implementation is based on ``box-sizing: border-box``. As a consequence, **Internet Explorer 7 is no longer supported**. Additionally, some theming features no longer have fallback implementations for legacy browsers (see below for details).

While most modifications were made "under the hood", affecting mostly internal APIs, some manual adjustments to existing applications based on 2.x may be required if custom themes and/or layouts are used.


Custom Themes
=============

The following information applies to user-defined themes. The frameworks built-in themes are already up to date.

Decoration Theme
----------------

* The ``inset`` properties of the decorators have been set to read-only. Any inset definitions in your decoration theme or application code should be removed and replaced with padding and / or margin in the appearance theme.

* The ``decorator`` theme key will be ignored. All decorations now use `a common class <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.Decorator>`_, which supports all decoration features. You can simply remove any ``decorator`` keys from your custom theme.

* The decorators ``qx.ui.decoration.Grid``, ``qx.ui.decoration.GridDiv``, ``qx.ui.decoration.BoxDiv``, ``qx.ui.decoration.AbstractBox``, ``qx.ui.decoration.HBox``, and ``qx.ui.decoration.VBox`` have been removed. These classes were responsible for providing image-based fallback implementations for border-image and background-gradient decorators, meaning **border-image decorations are no longer available in Internet Explorer 8 - 10**. The properties of `MLinearGradient <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MLinearGradient>`_ and `MBorderImage <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MBorderImage>`_ provide these features for most modern browsers. Change every occurrence of the ``baseImage`` key to its new equivalent, `borderImage <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MBorderImage~borderImage!property>`_.

* The ``qx.ui.decoration.Beveled`` and ``qx.ui.decoration.Uniform`` decorators are deprecated. Replace them with ``qx.ui.decoration.Decorator`` and use the `width <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MSingleBorder~width!property>`_, `style <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MSingleBorder~style!property>`_ and `color <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MSingleBorder~color!property>`_ properties.

* The decorator ``qx.ui.decoration.Double`` is also deprecated. Replace it with ``qx.ui.decoration.Decorator`` and use the properties of `MDoubleBorder <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MDoubleBorder>`_. This uses CSS3 box shadows so **double borders are no longer supported in IE 8**.

* ``qx.ui.decoration.DynamicDecorator`` has been deprecated. Replace it with `decoration.Decorator <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.Decorator>`_.

Custom Decorators
-----------------

The ``qx.ui.decoration.IDecoration`` interface has been updated. The methods ``getMarkup``, ``tint`` and ``resize`` were removed. ``getStyles`` was added: This method is responsible for adding the Decorator's CSS styles to a map of existing styles.

Appearance Theme
----------------

* The key ``shadow`` is no longer supported in the map returned by the ``style`` function. Use ``qx.ui.decoration.MBoxShadow``'s properties instead (in the decoration theme).


Custom Layouts
==============

Custom layouts extending ``qx.ui.layout.Abstract`` must be adjusted: The ``renderLayout`` method is now called with a map containing the container's ``top``, ``bottom``, ``left`` and ``right`` padding values as an additional third argument. These values must be taken into consideration when calculating the layout children's size and position.



Custom Widgets
==============

The following information is only relevant for authors of custom widgets using the ``qx.html`` layer directly.

* With the removal of the decorator element, the method ``qx.ui.core.Widget.getDecoratorElement`` was also removed. For most use cases it should be possible to use the content element instead, which can be accessed by ``qx.ui.core.Widget.getContentElement``.

* The same applies to the container element and ``qx.ui.core.Widget.getContainerElement``. This method is deprecated and returns the content element. Use ``qx.ui.core.Widget.getContentElement`` instead.

* As with the container element itself, the method ``qx.ui.core.Widget.getContainerLocation`` is deprecated. Just use ``qx.ui.core.Widget.getContentLocation`` instead.

* The ``shadow`` property has been removed. Use a decorator setting the properties of ``qx.ui.decoration.MBoxShadow`` instead.



Implementation changes
======================

This section lists all internal changes which should not be relevant for you as an application developer. Nevertheless, this information could be useful for anyone interested in the frameworks internals.

* Decorations are compiled as CSS classes and applied to a central style sheet
* background gradients are rendered using Canvas in IE9
* CSS clip is used to apply padding to combined images
* For the legacy browser fallback implementation of the text fields' placeholder property, the placeholder element is attached to the field's layout parent
* ``qx.ui.embed.Iframe``'s blocker element is now attached to the application root
* The default ``zIndex`` value for Widgets is now 10
* ``qx.html.Element`` now supports addition and removal of CSS classes
* ``qx.ui.tooltip.ToolTip`` offers a new child control named ``arrow``. It is used to render an arrow for error tooltips in the modern theme
* The non-CSS3 fallbacks from the Modern and Classic themes have been removed
* The padding of ``qx.ui.basic.Image`` instances is applied as background-position
* Separators are now instances of ``qx.ui.core.Widget`` instead of ``qx.html.Element``.
* The infrastructure classes ``qx.ui.core.DecoratorFactory`` and ``qx.html.Decorator`` have been removed.