Layouting
=========

Introduction
------------

A Layout manager defines the strategy of how to position the child widgets of a parent widget. They compute the position and size of each child by taking the size hints and layout properties of the children and the size hint of the parent into account.

Whenever the size of one widget changes, the layout engine will ask the layout manager of each affected widget to recompute its children's positions and sizes. Layout managers are only visible through the effects they have on the widgets they are responsible for.

It is possible to place and size all children directly to static positions using [setUserBounds](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem~setUserBounds) as well, but this is quite uncommon and only used in very special cases. It is almost always better to position children using a layout manager.

The layout manager can be configured on any widget, but most classes only have the protected methods to control the layout. In fact it doesn't make sense to control the layout manager of a `Spinner`, `ComboBox`, etc. from outside. So this scenario is quite common. Some widgets however publish the layout API. One of them is the above mentioned widget/composite widget. It exposes the layout system and the whole children API.

The nature of layout managers is that each one has specialized options for its children. For example, one layout allows specifying a left position of a child in the canvas while another one works with rows and cells instead. Given this fact, the best place to handle these options is the layout itself. Every `LayoutItem` has the methods [setLayoutProperties](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem~setLayoutProperties) and [getLayoutProperties](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem~getLayoutProperties). Through this API the layout properties can be configured independently from the layout.

The validation of properties is lazy (compared to the classic qooxdoo properties). At the moment where a child with layout properties is inserted into a parent widget with a layout, these properties are checked against the rules of the layout. This validation is not possible earlier, e.g. at the definition of the *wrong* property, as at this moment the child may not have a parent yet.

To make layout properties available in a convenient fashion each [add()](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.container.Composite~add) has an optional second parameter: A map with all layout properties to configure. A basic example:

    var canvas = new qx.ui.container.Composite(new qx.ui.layout.Canvas);
    canvas.add(new qx.ui.form.Button("Say Hello"), {
      left : 20,
      top: 20
    });

This example places a button at the position 20x20 of the composite created. As you can see, the `Composite` widget has a convenient way -- using the constructor -- to define the layout it uses.

Panes
-----

Some widgets extend the `Composite` widget above. Typical examples here are:

-   [TabView Page](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.tabview.Page)
-   [Popup](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.popup.Popup)

These have the same API like the composite. A slightly other type are so-called composite-like widgets. These widgets offer the same type of children management and layout management to the outside, but they redirect these properties to an inner pane.

Typical widgets in this category are:

-   [Window](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.window.Window)
-   [GroupBox](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.groupbox.GroupBox)

Sensible defaults
-----------------

By default, widgets are intelligently auto-sized. This means that most of the time you can create a widget and it will look nice. If you need greater control, you can override the defaults. Every property defined initially is also reconfigurable during the runtime of an application. When using layout managers any computed sizes are automatically refreshed and the arrangement of children is updated.

Every automatically detected size can be overridden. Common settings of a widget (or spacers) are configured through the widget itself. This for example includes properties like [width](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem~width) or [height](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem~height). All these sizes are pixel values. Percent and other complex values are only supported by a few layout managers so these are implemented as layout properties (explained in detail later).

Automatic size detection means, that limits are detected as well. Any widget in qooxdoo knows how much it can shrink and how much it can grow without interfering the functionality. The application developer can override these min/max sizes as well. This is no problem as long as the new value is tougher than the automatically detected values (e.g. lower limit of maximum width). When overriding the automatic sizes to reduce the limits layout problems may occur. It is highly suggested to keep an eye on this to omit such scenarios.

One thing to keep in mind is that the `width` cannot override the `minWidth` or the `maxWidth`. Limitation properties may be overridden by the property itself, but not by the normal size property. The `minWidth` can override the minimal automatically detected size, but the `width` cannot. This decision makes the layout system more stable as unintended overrides of the limitations are omitted in most cases.

Often `width` and `height` are described as preferred sizes as the given size may not have an influence on the actual rendered size of the widget. Even if the `width` is configured by the user, this does not mean that the widget always get the desired width.

Growing & Shrinking
-------------------

Dynamic GUIs often must work equally well in cases where not enough (or too much) room is available to render the GUI in the way meant by the developer. This may include simple cases where the size of tabs is reduced in order to handle the display of all open tabs without scrolling. More advanced cases are text which wraps to multiple lines depending on the available width (and this way influences the position of following children).

In the first case we often see that an application reduces the size of the label and uses an ellipsis symbol to show that the label was too long. This feature is built-in into both commonly used widgets: [Label](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.basic.Label) and [Atom](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.basic.Atom). When the underlying layout ask to reduce the width (or the developer using the `width` property) the widget tries to solve the requirement dynamically. This certainly works for the height as well.

    var label = new qx.ui.basic.Label().set({
      value: "A long label text which has not enough room.",
      width: 60
    });

The second case is handled by the [height for width](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem~_getHeightForWidth) support. Lengthy name but basically a really strong feature which is required quite often. It means that the height may depend on the actual width available. This especially makes sense for multi-line text where the wrapping may be influenced by the available width. The [Label](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.basic.Label) widget includes support for this feature when using the [rich](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.basic.Label~rich) output mode (HTML content).

    var label = new qx.ui.basic.Label().set({
      value: "A long label text with auto-wrapping. This also may
        contain <b style='color:red'>rich HTML</b> markup.",
      rich : true,
      width: 120
    });

Finally this means that every widget can grow and shrink depending on the limitations given for the respective axis. Two easy accessors which disable growing or shrinking respectively are [allowGrowX](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem~allowGrowX) and [allowShrinkX](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem~allowShrinkX). When the growing is disabled the configured or automatically detected maximum size is ignored and configured to the preferred size. When the shrinking is disabled the configured or automatically detected minimum size is ignored and configured to the preferred size. Two convenient methods to controlling these features without knowing of the exact dimensions.

Overflow Handling
-----------------

This leads to the next question: how to handle scenarios where the content needs more room than provided by the parent but should not shrink. This is a common case for data widgets like [Lists](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.form.List) or [Trees](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.tree.Tree). Both extend the [AbstractScrollArea](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.scroll.AbstractScrollArea) to provide scrollbars to handle overflowing content.

The `ScrollArea` itself renders scrollbars in a custom way. It does not use the native scrollbars nor the native overflowing capabilities of the browser. Benefits of this decision are:

-   Scroll bars can be themed.
-   Optimal integration into layout system.
-   Own implementation overrides browser quirks

The scrollbars are [controlable in a way that is comparable to CSS](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.scroll.AbstractScrollArea~scrollbarX). It is possible to have both scrollbars marked as `auto` to automatically detect the needs of the content. Or any other combination where a scrollbar may be statically hidden or visible. Each bar can be controlled separately. It is possible to enable one scrollbar statically and make the other one auto-displayed and vice-versa.

    var big = new qx.ui.form.TextArea;
    big.setWidth(600);
    big.setHeight(600);

    var area = new qx.ui.container.Scroll;
    area.setWidth(200);
    area.setHeight(200);
    area.add(big);

The `ScrollArea` provides all typically needed methods like [scrollToX](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.scroll.AbstractScrollArea~scrollToX) to scroll to an absolute position or [scrollByX](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.scroll.AbstractScrollArea~scrollByX) to scroll by the given amount. The widget also supports the scrolling of any child into the viewport. This feature is provided through the method [scrollItemIntoView](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.Widget~scrollChildIntoView). It just needs any child of the widget (at any depth).

    var list = new qx.ui.form.List();
    var item;
    for (var i=0; i<20; i++)
    {
      item = new qx.ui.form.ListItem("Item #" + i);
      list.add(item);

      if (i == 12) {
        list.select(item);
      }
    }

One really interesting aspect of these scrolling features is, that they work all the time, even if the widget is not yet rendered. It is possible to scroll any `ScrollArea` before even rendered. It is even possible to scroll any child into view without the whole parent being visible. This is quite useful for selection handling (selected items should be visible). Selections of a list for example can be modified during the normal application runtime and are automatically applied and scrolled correctly after the first appearance on the screen.

Layout Properties
-----------------

While there are a few core layout features which are normally respected by most layouts like the margin and alignment properties (have a look to the [LayoutItem](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem) for these), there are layout specific properties which only makes sense in conjunction with the specified layout as well. These properties are called layout properties in qooxdoo.

These properties are normally defined with the addition to the parent widget. The [children handling](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.MChildrenHandling) normally allows a second optional parameter `options`. The layout properties are given through a simple map e.g.

    parent.add(child, {left:20, top: 100});

This is still good readable and directly defines the properties where the children is added to the parent (and the parent's layout). While this is the common use pattern of layout properties in qooxdoo applications, it is still possible to define layout properties afterwards using [setLayoutProperties](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem~setLayoutProperties). The first parameter is like the second parameter in `add` and accepts a map of layout properties.

Units of Layout Properties
--------------------------

### Pixel

Usually all position and size values are defined as pixel values. For example the `left` and `top` layout properties of the `Basic` layout are defined as pixel values.

### Flex

The flex value indicates the flexibility of the item, which implies how an item's container distributes remaining empty space among its children. Flexible elements grow and shrink to fit their given space. Elements with larger flex values will be sized larger than elements with lower flex values, at the ratio determined by the two elements. The actual flex value is not relevant unless there are other flexible elements within the same container. Once the default sizes of elements in a box are calculated, the remaining space in the box is divided among the flexible elements, according to their flex ratios. Specifying a flex value of `0` has the same effect as leaving the flex attribute out entirely.

The easiest use case is to make exactly one child consuming the remaining space. This is often seen in modern application. For example the location field in common browsers are automatically configured to behave like this. To do this add a flex value of `1` to the child. In order to make more children behave like this, one could make them flexible the same way. The available space is automatically allocated between all of them. As `flex` allows integer values it is also possible to define weighted values. A flex value of `2` means double importance over `1`. The result is that from 100 pixel remaining space and two flexible children the one with `2` gets about 66 pixel and the other one 33 pixel.

Please note that in shrinking mode flex has an analogous effect. As a flex value of `2` means doubled importance compared to `1` the child with `2` is shrunken less than the child with `1`.

In contrast to qooxdoo 0.7 `flex` values are supplemental to the normal size values of a widget. First all children are positioned using their regular size hints. If after this step the combined size of the children is larger or smaller than the available size the `flex` value defines by how much each widget is stretched or shrunken.

The `flex` property is supported by both [Box Layouts](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.layout.HBox), the [Dock](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.layout.Dock) Layout and the [Grid](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.layout.Grid) (for columns and rows).

In some way the [SplitPane](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.splitpane) supports flex as well, but it behaves a bit different there as it is regarded as an alternative to the preferred size.

### Percent

With the above mentioned `flex` feature the use of percents is quite uncommon in most qooxdoo applications. Still, there are some cases where it might be interesting to define percent locations or dimensions.

The [Canvas](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.layout.Canvas) Layout for example allows a child's position to contain a percent value (e.g. the layout property `left` could be configured to `20%`). When there are 1000 pixel available the so-configured child is placed at a left coordinate of 200 pixel. The final coordinate is automatically updated when the outer dimensions are modified.

The [LayoutItem](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.LayoutItem)'s dimension properties only support integer values. To use percentage dimensions some qooxdoo layout managers allow to define width and height using layout properties. This dimensions are then *higher* prioritized than the width and height configured in the child using the *normal* properties. The limitations defined through `minWidth` etc. are still respected by the layout manager. Percentage dimensions are useful to allocate a specific part of the available space to a given widget without being dependent on the configuration of the other children.

It is possible to combine `flex` with percent dimensions. This is good because it allows to define *approximations* like `3` times `33%` instead of being forced to fill the `100%` completely. With flex enabled the layout manager automatically arranges the children to fill the remaining pixels.

The effects of percentage dimensions in box layouts are comparable to the result of flex in a [SplitPane](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.splitpane). The resulting size is computed from the available space less all statically configured gaps like spacings or margins. Layout managers with support for percentage dimensions are the already mentioned [Box](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.layout.VBox) Layouts, but also the [Canvas](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.layout.Canvas) Layout as well as the [Dock](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.layout.Dock) Layout.

Pre-configured Widgets
----------------------

There are a few containers in qooxdoo which use a predefined immutable layout for rendering their children. Currently these containers are included:

-   widget/scroll: Provides automatic scrollbars for larger content. Does not influence the size of the content which is rendered at the preferred size. Allows scrolling of the content. Supports advanced features like offset calculation and scroll into view.
-   widget/stack: Scales every widget to the available space and put one over another. Allows selection of which child should be visible. Used internally by TabView etc.
-   widget/slidebar: Comparable to the Scroll Container but only provides automatic forward and backward arrows. Supports only one axis per instance: horizontal or vertical. Buttons are automatically displayed as needed. Supports automatic shrinking of the children (other than the Scroll Container).
-   widget/splitpane: Divides the available space into two areas and provides a possibility to resize the panes for the user. Automatically respects the limitations of each child.

Visibility Handling
-------------------

Every widget can be hidden and shown at any time during the application runtime. In qooxdoo each widget's visibility might have three values: `visible`, `hidden` or `excluded`. While `hidden` and `excluded` both makes a widget invisible there is still a difference: `excluded` ignores the widget in during the layout process while `hidden` simply hides the widget and keeps the room for the widget during the layout process.

The `visibility` property is not commonly used in qooxdoo applications.There are a few nice accessor methods for each widget:

-   To check the status of a widget: `isVisible()`, `isHidden()` and `isExcluded()`
-   To modify the visibility: `show()`, `hide()` and `exclude()`

Please note that for performance reasons invisible widgets are not rendered or updated to the DOM which means that especially initially invisible parts could improve the startup of a qooxdoo application e.g. alternate Tab Pages, closed Window instances, Menus, etc.

To work with multiple layers like in a Tab View it is suggested to use a Stack Container instead of doing the visibility management on the own.
