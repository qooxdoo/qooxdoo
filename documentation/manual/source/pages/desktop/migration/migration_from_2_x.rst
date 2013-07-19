Migration from %{Desktop} 2.x
*****************************

%{Desktop} 3.0 introduces some major improvements to the internals of qooxdoo's desktop widget system. This was made possible by taking advantage of  features in modern browsers while trying to implement graceful degradation in older browsers and discontinuing support for some legacy browsers.

In order to improve UI performance and decrease memory load, every widget now consists of **just one content element**. Before, each desktop widget consisted of (at least) two DOM elements and their `JavaScript object representations <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.html.Element>`_: container and content. Usually widgets also had a decorator element. Now widgets no longer have decorator, container or protector elements.

Most modifications were made "under the hood", affecting mostly internal APIs. Therefore regular users should immediately benefit from those improvements without being required to adjust their application code. If custom themes and/or custom layouts are used however, some manual adjustments to existing applications based on %{Desktop} 2.x may be required. Additionally, some theming features no longer have fallback implementations for legacy browsers (see below for details).


Legacy Browsers
===============

Some browsers unfortunately lack built-in functionality for some features common to modern browsers. To work around those technical limitations is either too complex or simply impossible. Therefore browser support in %{Desktop} 3.0 had to be adjusted accordingly:

* Browser versions **no longer** supported:
    * **IE 6, 7**
    * **Firefox 3.5** and below
    * **Safari 3**
    * **Opera 11** and below

* Browser versions with **limited** support:
    * **IE 8**:
        * double borders on input elements no longer supported
        * border-image decorations no longer supported
        * PNGs are no longer supported as background images in combination with the backgroundRepeat values 'scale' and 'no-repeat'
        * PNGs with alpha transparency are no longer supported as background images
    * **IE 9, 10**:
        * border-image decorations no longer supported


Built-in Themes
===============

Along with the changes in the %{Desktop} GUI toolkit, the themes that ship with the SDK have also been adjusted. They no longer contain the image-based fallbacks for legacy browsers that were used to work around missing CSS3 features.

* Indigo, Simple: no changes from previous releases
* Modern: shadows and rounded borders no longer available in IE 8
* Classic: shadows no longer available in IE 8; text fields and text areas only with single not double borders

This is also relevant if you used some of the decorators for your custom widgets. They might have been renamed or deleted.


Custom Themes
=============

The following information applies to user-defined themes. The framework's built-in themes are already up to date.

Decoration Theme
----------------

* The ``inset`` properties of the decorators have been set to read-only. Any inset definitions in your decoration theme or application code should be removed and replaced with the corresponding ``padding`` and/or ``margin`` in the appearance theme.

* The ``decorator`` theme key will be ignored. All decorations now use `a common class <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.Decorator>`_, which supports all decoration features. You can simply remove any ``decorator`` keys from your custom theme.

* The decorators ``qx.ui.decoration.Grid``, ``qx.ui.decoration.GridDiv``, ``qx.ui.decoration.BoxDiv``, ``qx.ui.decoration.AbstractBox``, ``qx.ui.decoration.HBox``, and ``qx.ui.decoration.VBox`` have been removed. These classes were responsible for providing image-based fallback implementations for border-image and background-gradient decorators, meaning **border-image decorations are no longer available in Internet Explorer 8 - 10**. The properties of `MBorderImage <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MBorderImage>`_ provide these features for most modern browsers. Change every occurrence of the ``baseImage`` key to its new equivalent, `borderImage <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MBorderImage~borderImage!property>`_.

* The ``qx.ui.decoration.Beveled`` and ``qx.ui.decoration.Uniform`` decorators are deprecated. Replace them with ``qx.ui.decoration.Decorator`` and use the `width <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MSingleBorder~width!property>`_, `style <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MSingleBorder~style!property>`_ and `color <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MSingleBorder~color!property>`_ properties.

* The decorator ``qx.ui.decoration.Double`` is also deprecated. Replace it with ``qx.ui.decoration.Decorator`` and use the properties of `MDoubleBorder <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.MDoubleBorder>`_.

* ``qx.ui.decoration.DynamicDecorator`` has been deprecated. Replace it with `decoration.Decorator <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.Decorator>`_.

Custom Decorators
-----------------

The ``qx.ui.decoration.IDecoration`` interface has been updated. The methods ``getMarkup``, ``tint`` and ``resize`` were removed. ``getStyles`` was added: This method is responsible for adding the Decorator's CSS styles to a map of existing styles.

Appearance Theme
----------------

* The key ``shadow`` is no longer supported in the map returned by the ``style`` function. Use the properties of ``qx.ui.decoration.MBoxShadow`` instead (in the decoration theme).


Custom Layouts
==============

Custom layouts extending ``qx.ui.layout.Abstract`` must be adjusted: The ``renderLayout`` method is now called with a map containing the container's ``top``, ``bottom``, ``left`` and ``right`` padding values as an additional third argument. These values must be taken into consideration when calculating the layout children's size and position.



Custom Widgets
==============

The following information is only relevant for authors of custom widgets using the ``qx.html`` layer directly.

* With the removal of the decorator element, the method ``qx.ui.core.Widget.getDecoratorElement`` was also removed. For most use cases it should be sufficient to use the content element instead, which can be accessed by ``qx.ui.core.Widget.getContentElement``.

* The same applies to the container element and ``qx.ui.core.Widget.getContainerElement``. This method is deprecated and returns the content element. Use ``qx.ui.core.Widget.getContentElement`` instead.

* As with the container element itself, the method ``qx.ui.core.Widget.getContainerLocation`` is deprecated. Just use ``qx.ui.core.Widget.getContentLocation`` instead.

* The ``shadow`` property has been removed. Use a decorator setting the properties of ``qx.ui.decoration.MBoxShadow`` instead.


Other Code Changes
==================

The blocking implementation (``qx.ui.core.Blocker``, ``qx.ui.core.MBlocker``) was simplified:

* ``unblockContent`` was removed. Use ``unblock`` instead.
* ``isContentBlocked`` was removed. Use ``isBlocked`` instead.
* ``forceUnblockContent`` was removed. Use ``forceUnblock`` instead.


Implementation Details
======================

This section lists all further internal changes. They should not be relevant for you as an application developer. Nevertheless, this information could be useful for anyone interested in the framework's internals.

* The new implementation is based on ``box-sizing: border-box``. As a consequence, **Internet Explorer 6 and 7 is no longer supported**.
* Decorations are compiled as CSS classes and applied to a central style sheet.
* Background gradients are rendered using Canvas in IE9.
* CSS clip is used to apply padding to combined images.
* For the legacy browser fallback implementation of the text fields' placeholder property, the placeholder element is attached to the field's layout parent.
* The blocker element of ``qx.ui.embed.Iframe`` is now attached to the application root.
* ``qx.ui.core.Blocker`` is attached to the blocked widget's layout parent.
* The default ``zIndex`` value for Widgets is now 10.
* ``qx.html.Element`` now supports addition and removal of CSS classes.
* ``qx.ui.tooltip.ToolTip`` offers a new child control named ``arrow``. It is used to render an arrow for error tooltips in the Modern theme.
* The padding of ``qx.ui.basic.Image`` instances is applied as background-position.
* Separators are now instances of ``qx.ui.core.Widget`` instead of ``qx.html.Element``.
* The infrastructure classes ``qx.ui.core.DecoratorFactory`` and ``qx.html.Decorator`` have been removed.
