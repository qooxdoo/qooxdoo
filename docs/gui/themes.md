Custom Themes
=============

There are certain circumstances when the built-in themes are no more sufficient for your application and your needs. You need to create a custom theme because you have either self-written widgets you wish to style or you like to change the theming of your application overall.

Basically you have two choices to create a custom theme depending on your needs and the amount you want to change. The next two sections describe both briefly.

Extending Themes
----------------

If you want to stick with an existing theme and only like to add or modify some appearances, change colors or fonts the best way to go is to extend a theme and to create an own meta theme which sets your extended theme.

For example you like to add some appearances (of your own widgets) to the Modern theme you can simply extend the appearance theme of the Modern theme.

    qx.Theme.define("myApplication.theme.Appearance",
    {
      extend : qx.theme.modern.Appearance,
      title : "my appearance theme",

      appearances :
      {
        "my-widget" :
        {
          alias : "atom",

          style : function(states)
          {
            return {
              width : 250,
              decorator : "main"
            };
          }
        }
      }
    });

To enable your own appearance theme you also have to extend the Meta theme and set your appearance theme.

    qx.Theme.define("myApplication.theme.Theme",
    {
      title : "my meta theme",

      meta :
      {
        color : qx.theme.modern.Color,
        decoration : qx.theme.modern.Decoration,
        font : qx.theme.modern.Font,
        icon : qx.theme.icon.Tango,
        appearance : myApplication.theme.Appearance
      }
    });

At last you have to tell the generator to actually use your meta theme. Therefore you have to edit your `config.json` file and add/edit the key `QXTHEME` in the `let` block.

    "let" :
      {
        "APPLICATION"  : "myApplication",
        ...
        "QXTHEME"      : "myApplication.theme.Theme"
        ...
      },

After editing your `config.json` the very last step is to generate your application sources and you're done. Now you can adjust and extend your appearance theme to suit your needs.

> **note**
>
> These steps are also applicable for the other themes.

Define Custom Themes
--------------------

A custom theme is an own meta theme and the corresponding themes build from scratch. The main part of this work is mainly the appearance theme and the content of the other themes is mostly defined by the appearance theme, since this theme is the one who uses fonts, icons, decorators and colors.

Creating the meta theme is a no-brainer and when creating the several themes you only have to consider some rules:

-   every theme has its own root key which also defines its type. `colors` for a color theme, `appearances` for an appearance theme and so on
-   every widget has to be equipped with an appearance, otherwise you'll get a warning at application startup
-   every used color, decorator or font has to be defined, otherwise you'll get an error at application startup. So be sure to define all used colors, fonts and decorators and to test your application always in the source version to get the error messages
-   be sure to include every image you use in your appearance theme by defining corresponding `@asset` directives.
-   Be sure to check all build in widgets with all states. A Widget may have a different looks and feel when disabled or invalid.
-   Its a good idea to copy a existing appearance theme and edit all the stuff you need. That way, you can be sure that you have all the appearance keys included the framework needs.

Appearance
-----------

An appearance theme is the main part of the theme. It contains all appearance definitions which are responsible for holding all styling information for the widgets. Usually the appearance theme is the biggest theme and uses all other theme classes like the Decorator- or Font-theme.

### Appearance Theme Structure

A theme normally consists of a set of entries. Each entry has a key which is basically some kind of selector which matches to a specific widget. Missing selectors are presented as a warning when developing with debug code enabled.

    qx.Theme.define("qx.theme.modern.Appearance",
    {
      appearances :
      {
        selector : entry,
        [...]
      }
    });

### Selectors

In the most basic form each selector is identical to an appearance ID. This appearance ID is the value stored in the `appearance` property ([API](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.core.Widget~appearance)) of each widget.

The child control system ignores this appearance entry for widgets which function as a child control of another widget. In these cases the selector is the combination of the appearance ID of the parent widget plus the ID of the child control.

In a classic `Button` there is a child control `icon` for example. The appearance selector for the image element which represents the icon is `button/icon`. As you can see the divider between the appearance ID and the child control is a simple slash (`/`).

It is also possible that a widget, which is a child control itself, uses another child control. Generally the mechanism prepends the ID of each parent which is also a child control to the front of the selector. For example:

    - pane
      - level1
        - level2
          - level3

the generated selector would be `pane/level1/level2/level3`. For `pane` which is not a child control of any other widget the appearance ID is used. For all others the child control ID is used. Again `pane` is not managed by any other widget so it is basically added by the developer of the application to another widget while `level1` to `level3` are managed by some type of combined widget and are added to each other without the work of the application developer.

A classic example for this is the `Spinner` widget. A `Spinner` is basically a Grid layout with a `TextField` and two `RepeatButtons`. The three internal widgets are available under the sub control IDs `textfield`, `upbutton` and `downbutton`. The selectors for these kind of child controls are then:

-   `spinner/textfield`
-   `spinner/upbutton`
-   `spinner/downbutton`

Each of these selectors must be defined by the selected appearance. Otherwise a warning about missing selectors is displayed.

### Aliases

A entry can be defined with two different values, a string or a map. The first option is named "alias", it is basically a string, redirecting to another selector. In the `Spinner` example from above we may just want to use aliases for the buttons. See the example:

    qx.Theme.define("qx.theme.modern.Appearance",
    {
      appearances :
      {
        [...],

        "spinner/upbutton" : "button",
        "spinner/downbutton" : "button",

        [...]
      }
    });

So we have mastered one essential part for appearance themes. It is basically the easiest part, but seen quite often. Compared to CSS you always have a full control about the styling of such an child control. There is no type of implicit inheritance. This may also be seen negatively, but most developers tend to like it more.

Such an alias also redirects all child controls of the left hand selector to the right hand selector. This means that the icon inside the button is automatically redirected as well. Internally this mapping looks like this:

    "spinner/upbutton" => "button"
    "spinner/upbutton/icon" => "button/icon"
    "spinner/upbutton/label" => "button/label"

This is super convenient for simple cases and additionally it is still possible to selectively override definitions for specific child controls.

    qx.Theme.define("qx.theme.modern.Appearance",
    {
      appearances :
      {
        [...],

        "myimage" : [...],

        "spinner/upbutton" : "button",
        "spinner/upbutton/icon" : "myimage",

        [...]
      }
    });

Internally the above results into the following remapping:

    "spinner/upbutton" => "button"
    "spinner/upbutton/icon" => "myimage"
    "spinner/upbutton/label" => "button/label"

### Entries

The more complex full entry is a map with several sub entries where all are optional:

    qx.Theme.define("qx.theme.modern.Appearance",
    {
      appearances :
      {
        [...],

        "spinner/textfield" :
        {
          base : true/false,
          include : String,
          alias : String,

          style : function(states, styles)
          {
            return {
              property : states.hovered ? value1 : value2,
              [...]
            };
          }
        },

        [...]
      }
    });

#### Style Method

Let's start with the `style` sub entry. The value under this key should be a function which returns a set of properties to apply to the target widget. The first parameter of the function is named `states`. This is a map containing keys with boolean values which signalize which states are switched on. The data could be used to react on specific states like `hovered`, `focused`, `selected`, etc. The second parameter `styles` is only available if a `include` key is given. If so, the `styles` parameter contains the styles of the included appearance. This may be very handy if you just want to add some padding and don't want to change it completely. In any case, you don't need to return the given styles. The returned styles and the `styles` argument will be merged by the appearance manager with a higher priority for the local (returned) styles.

It is required that all properties applied in one state are applied in all other states. Something like this is seen as bad style and may result in wrong styling:

    style : function(states)
    {
      var result = {};

      if (states.hovered) {
        result.backgroundColor = "red";
      }
      // BAD: backgroundColor missing when widget isn't hovered!

      return result;
    }

Instead, you should always define the else case:

    style : function(states)
    {
      var result = {};

      if (states.hovered) {
        result.backgroundColor = "red";
      } else {
        // GOOD: there should be a setting for all possible states
        result.backgroundColor = undefined;
      }

      return result;
    }

> **note**
>
> The `undefined` value means that no value should be applied. When qooxdoo runs through the returned map it calls the `reset` method for properties with a value of `undefined`. In most cases it would be also perfectly valid to use `null` instead of `undefined`, but keep in mind that `null` is stored using the setter (explicit null) and this way it overrides values given through the inheritance or through the init values. In short this means that `undefined` is the better choice in almost all cases.

One thing we have also seen in the example is that it is perfectly possible to create the return map using standard JavaScript and fill in keys during the runtime of the `style` method. This allows to use more complex statements to solve the requirements of today's themes were a lot of states or dependencies between states can have great impact on the result map.

#### Includes

Includes are used to reuse the result of another key and merge it with the local data. Includes may also used standalone without the `style` key but this is merely the same like an alias. An alias is the faster and better choice in this case.

The results of the include block are merged with lower priority than the local data so it just gets added to the map. To remove a key from the included map just define the key locally as well (using the `style` method) and set it to `undefined`.

Includes do nothing to child controls. They just include exactly the given selector into the current selector.

#### Child Control Aliases

Child control aliases are compared to the normal aliases mentioned above, just define aliases for the child controls. They do not redirect the local selector to the selector defined by the alias. An example to make this more clear:

    qx.Theme.define("qx.theme.modern.Appearance",
    {
      appearances :
      {
        [...],

        "spinner/upbutton" :
        {
          alias : "button",

          style : function(states) {
            return {
              padding : 2,
              icon : "decoration/arrows/up.gif"
            }
          }
        },

        [...]
      }
    });

The result mapping would look like the following:

    "spinner/upbutton" => "spinner/upbutton"
    "spinner/upbutton/icon" => "button/image"
    "spinner/upbutton/label" => "button/label"

As you can see the `spinner/upbutton` is kept in its original state. This allows one to just refine a specific outer part of a complex widget instead of the whole widget. It is also possible to include the original part of the `button` into the `spinner/upbutton` as well. This is useful to just override a few properties like seen in the following example:

    qx.Theme.define("qx.theme.modern.Appearance",
    {
      appearances :
      {
        [...],

        "spinner/upbutton" :
        {
          alias : "button",
          include : "button",

          style : function(states)
          {
            return {
              padding : 2,
              icon : "decoration/arrows/up.gif"
            }
          }
        },

        [...]
      }
    });

When `alias` and `include` are identically pointing to the same selector the result is identical to the real alias

#### Base Calls

When extending themes the so-named `base` flag can be enabled to include the result of this selector of the derived theme into the local selector. This is quite comparable to the `this.base(arguments, ...)` call in member functions of typical qooxdoo classes. It does all the things the super class has done plus the local things. Please note that all local definitions have higher priority than the inheritance. See next paragraph for details.

#### Priorities

Priority is quite an important topic when dealing with so many sources to fill a selector with styles. Logically the definitions of the `style` function are the ones with the highest priority followed by the `include` block. The least priority has the `base` flag for enabling the *base calls* in inherited themes.

### States

A state is used for every visual state a widget may have. Every state has flag character. It could only be enabled or disabled via the API `addState` or `removeState`.

### Performance

qooxdoo has a lot of impressive caching ideas behind the whole appearance handling. As one could easily imagine all these features are quite expensive when they are made on every widget instance and more important, each time a state is modified.

#### Appearance Queue

First of all we have the appearance queue. Widgets which are visible and inserted into a visible parent are automatically processed by this queue when changes happen or on the initial display of the widget. Otherwise the change is delayed until the widget gets visible (again).

The queue also minimizes the effect of multiple state changes when they happen at once. All changes are combined into one lookup to the theme e.g. changing `hovered` and `focused` directly after each other would only result into one update instead of two. In a modern GUI typically each tap influence a few widgets at once and in these widgets a few states at once so this optimization really pays of.

#### Selector Caching

Each widget comes with an appearance or was created as a child control of another widget. Because the detection of the selector is quite complex with iterations up to the parent chain, the resulting selector of each widget is cached. The system benefits from the idea that child controls are never moved outside the parent they belong to. So a child controls which is cached once keeps the selector for lifetime. The only thing which could invalidate the selectors of a widget and all of its child controls is the change of the property `appearance` in the parent of the child control.

#### Alias Caching

The support for aliases is resolved once per application load. So after a while all aliases are resolved to their final destination. This process is lazy and fills the redirection map with selector usage. This means that the relatively complex process of resolving all aliases is only done once.

The list of resolved aliases can be seen when printing out the map under `qx.theme.manager.Appearance.getInstance().__aliasMap` to the log console. It just contains the fully resolved alias (aliases may redirect to each other as well).

#### Result Caching

Further the result of each selector for a specific set of states is cached as well. This is maybe the most massive source of performance tweaks in the system. With the first usage, qooxdoo caches for example the result of `button` with the states `hovered` and `focused`. The result is used for any further request for such an appearance with the identical set of states. This caching is by the way the most evident reason why the appearance has no access to the individual widget. This would interfere with the caching in some way.

This last caching also reduces the overhead of `include` and `base` statements which are quite intensive tasks because of the map merge character with which they have been implemented.

## Qooxdoo Theme Decorators

Decorations are used to style widgets. The idea is to have an independent layer around the widget content that can be freely styled. This way you can have separate decorators that define all kinds of decoration (colors, background image, corners, ...), and apply them to existing widgets, without interfering with the widget code itself.

### Using Decorators

Generally all decorators used should be part of the selected decorator theme. The convention is that each decorator instance is stored under a semantic name. To use names which describe the appearance of the decorator is bad because it may make themes less compatible to each other.

It is also regarded as bad style to make use of so-named inline decorators which are created by hand as part of a function call. The reason for this is that generally decorators defined by the theme may be used in multiple places. This means that widgets and application code should not directly deal with decorator instances.

### Decoration Theme

As mentioned above, it is common to define the decorators in a decorator theme. This is really easy because you have to specify only a few details about the decorator.

    "main" : {
      style : {
        width : 1,
        color : "background-selected"
      }
    },

The first thing you see is the name of the decorator, in this case, `main`. The specified decorator is available using that name in the entire application code, especially in the appearance theme. Then there's the styles map which contains values for decorator properties. You can see all possible style value as properties of the [Decorator class](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.Decorator).

Sometimes it is very handy to change only little details about the decorator. Imagine a special decorator for hovered buttons. Inheritance comes in very handy in such a case.

    "scroll-knob-pressed" : {
      include : "scroll-knob",

      style : {
        backgroundColor : "scrollbar-dark"
      }
    },

As you can see here, we include the previously defined decorator and override the backgroundColor property. That's all you need to do!

### Custom Decorators

Custom decorators are created by extending the decorator theme and adding new ones or overwriting existing ones. Each decorator class comes with a set of properties for configuration of the instance. These properties are defined by mixins in the [qx.ui.decoration namespace](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration). Following is a short description of the available mixins:

-   **MBackgroundColor**: Renders a background color.
-   **MBackgroundImage**: Renders a background image.
-   **MSingleBorder**: Renders a single border.
-   **MDoubleBorder**: Renders an outer and an inner border, e.g. to achieve a bevel effect.
-   **MBorderImage**: Uses an image to create a border.
-   **MBorderRadius**: Used to render rounded corners.
-   **MBoxShadow**: Renders a shadow.
-   **MLinearBackgroundGradient**: Renders a linear color gradient.

As you may have guessed, the last three mixins do not work cross browser due to the fact that they rely on CSS properties not available in all browsers. If you want more details, take a look at the [API documentations of the mixins](http://demo.qooxdoo.org/current/apiviewer/#qx.ui.decoration).

Each entry of the theme is automatically made available using the `setDecorator` function of the widget class. The instances needed are automatically created when required initially. This mechanism keeps instance numbers down and basically ignores decorators which are defined but never used.

### Writing Decorator Mixins

The recommended way is to write a simple decoration mixin and add it to the default decorator qooxdoo delivers. There is only one method your mixin should supply:

-   `_style<yourName>`: This method has a styles map as parameter which should be manipulated directly. That way, you can just append your styles and That's it. But you should make sure you don't manipulate / override any style another mixin could uses.

As you can see, every mixin can define its own methods for `style`. The theme system combines all the methods given by the separate widgets to one big working method.

Here is a sample text shadow decorator mixin:

    qx.Mixin.define("my.MTextShadow", {
      properties : {
        textShadowColor : {
          nullable : true,
          check : "Color"
        }
      },

      members : {
        _styleTextShadow : function(styles) {
          var color = this.getTextShadowColor();
          if (color === null) {
            return;
          }
          color = qx.theme.manager.Color.getInstance().resolve(color);
          styles["text-shadow"] = color + " 1px 1px";
        }
      }
    });

    // patch the original decorator class
    qx.Class.patch(qx.ui.decoration.Decorator, my.MTextShadow);

### Writing Decorators

It is possible to write custom decorators, although they are not usable in the decoration theme. You can only create instances in the application code and assign the instances. For that reason, the recommendation is to write a decorator mixin instead. [The interface](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.decoration.IDecorator) is quite trivial to implement. There are only three methods which needs to be implemented:

-   `getInsets`: Returns a map of insets (space the decorator needs) e.g. the border width plus padding
-   `getPadding`: Returns the configured padding minus the border width.
-   `getStyle`: Returns the decorator's CSS styles as a map.

Decorators are regarded as immutable. Once they are used somewhere there is no need to be able to change them anymore.

Each decorator configuration means exactly one decorator instance (created with the first usage). Even when dozens of widgets use the decorator only one instance is used. To cache the styles is a good way to improve the initial time to create new element instances.
