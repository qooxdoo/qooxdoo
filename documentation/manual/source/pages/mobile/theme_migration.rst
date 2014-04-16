.. _pages/mobile/theme_migration#theme_migration:

Migrating a %{Mobile} theme to another version
**********************************************

Migration from 3.1 to 3.5
=========================

Here is an introduction of how to migrate your %{Mobile} theme from version ``3.1`` to ``3.5``.
The %{Mobile} theming system was extended to provide much more customization
possibilities for each widget.

Step 1: Update your custom.scss
-------------------------------

Please replace the following lines of your ``custom.scss``

::

    @import "../../../../${REL_QOOXDOO_PATH}/framework/source/resource/qx/mobile/scss/common/base";
    @import "../../../../${REL_QOOXDOO_PATH}/framework/source/resource/qx/mobile/scss/theme/styles";
    @import "styles";
    @import "../../../../${REL_QOOXDOO_PATH}/framework/source/resource/qx/mobile/scss/basic/basic";
    @import "../../../../${REL_QOOXDOO_PATH}/framework/source/resource/qx/mobile/scss/theme/theme";

through these lines:

::

    @import "common/all";
    @import "styles";
    @import "ui/all";

Step 2: Update your watch-scss job
----------------------------------

The watch-scss job was changed in ``3.5``. Please replace your existing ``watch-scss`` job at your app-specific ``config.json``:

::

    "watch-scss" :
    {
      "desc"   : "Watch and compile custom.scss",
      "extend" : ["cache"],
       "let" :
      {
        "MOBILE_THEME_PATH" : "${QOOXDOO_PATH}/framework/source/resource/qx/mobile/scss",
        "SHARED_THEME_PATH" : "${QOOXDOO_PATH}/framework/source/resource/qx/scss"
      },
      "watch-files" :
      {
        "paths"    : ["source/resource/${APPLICATION_PATH}/scss"],
        "command" :
        {
          "line"  : "${PYTHON_CMD} ${QOOXDOO_PATH}/tool/bin/scss.py source/resource/${APPLICATION_PATH}/scss/custom.scss -o source/resource/${APPLICATION_PATH}/css/custom.css --load-path=source/resource/${APPLICATION_PATH}/scss,${MOBILE_THEME_PATH},${SHARED_THEME_PATH}",
          "exec-on-startup" : true,
          "per-file" : false
        }
      }
    }

Step 3: Reset your app-specific variables
-----------------------------------------

In the newest %{Mobile} version we added a lot of new variables for expanding the customization possibilities of our theming system.

As there were a lot of changes, we propose to reset your ``_styles.scss`` and to restart from our "Indigo" or "Flat" theme version ``3.5``. After resetting your file, you can migrate your recent theming variables.

1. Please save the content of your recent ``_styles.scss`` inside another file e.g.:

::

<APP_ROOT>/source/resource/<APP_NAME>/mobile/scss/_old.scss

2. Please remove any content inside your ``_styles.scss``.

3. Now copy the content of this file:

::

    <QOOXDOO_PATH>/framework/source/resource/qx/mobile/scss/theme/<THEME_NAME>/_styles.scss

Into your app-specific ``styles.scss``:

::

    <APP_ROOT>/source/resource/<APP_NAME>/mobile/scss/_styles.scss


4. After the replacement, your theme should build again by calling the watch-job:

::

    generate.py watch-scss

Step 4: Migrate your recent style variables
-------------------------------------------

If you already have changed some theme variables in your ``_old.scss``, you should now copy/migrate these values into the corresponding variables of your new ``_styles.scss``.

Most of the changes are caused by renaming the variable endings from "background-color", to "background".

Here is a full list of changes we applied to the theming variables by releasing version ``3.5``:

::

     // NavigationBar

    -$navigationbar-background-color
    +$navigationbar-background
    +$navigationbar-text-size
    +$navigationbar-padding
    +$navigationbar-font-weight

    // Page
    -$navigationpage-background-color
    +$navigationpage-background

     // NavigationBar Button

    -$navigationbarbutton-background-color
    -$navigationbarbutton-active-background-color
    +$navigationbarbutton-background
    +$navigationbarbutton-active-background
    +$navigationbarbutton-font-weight

     // Dialog

    -$dialog-background-color
    +$dialog-background
    +$dialog-arrow-up-color
    +$dialog-arrow-down-color
    +$dialog-arrow-size
    +$dialog-arrow-position-offset
    +$dialog-font-weight

     // Group

    -$group-background-color
    +$group-background

     // List

    -$list-active-background-color
    -$list-background-color
    +$list-background
    +$list-title-font-size
    +$list-title-font-weight
    +$list-subtitle-font-size
    +$list-active-background
    +$list-arrow-thickness

     // Form

    -$form-background-color
    +$form-background
    +$form-label-text-color
    +$form-font-weight

     // Input

    +$input-background

     // Checkbox

    -$checkbox-background-color
    -$checkbox-background-color-2
    +$checkbox-size
    +$checkbox-tick-size
    +$checkbox-tick-width
    +$checkbox-tick-shadow
    +$checkbox-background

    // Radiobutton

    -$radiobutton-background-color
    -$radiobutton-background-color-2
    -$radiobutton-background-inner-color
    +$radiobutton-size
    +$radiobutton-background
    +$radiobutton-dot-shadow

     // Tabbar

    -$tabbar-active-background-color
    -$tabbar-inactive-background-color
    +$tabbar-height
    +$tabbar-divider-color
    +$tabbar-active-background
    +$tabbar-active-border-color
    +$tabbar-inactive-background
    +$tabbar-inactive-border-color
    +$tabbar-button-distance

     // ToggleButton

    -$togglebutton-background-color
    -$togglebutton-active-background-color
    +$togglebutton-width
    +$togglebutton-height
    +$togglebutton-border-color
    +$togglebutton-background
    +$togglebutton-active-background
    +$togglebutton-knob-background
    +$togglebutton-knob-width
    +$togglebutton-inset-shadow
    +$togglebutton-knob-shadow
    +$togglebutton-font-size
    +$togglebutton-font-weight

     // Carousel

    -$carousel-pagination-background-color
    -$carousel-pagination-active-background-color
    +$carousel-pagination-background
    +$carousel-pagination-active-background
    +$carousel-pagination-size
    +$carousel-pagination-font-size
    +$carousel-pagination-font-color
    +$carousel-pagination-border-color
    +$carousel-pagination-active-border-color

     // Button

    -$button-background-color
    -$button-active-background-color
    +$button-font-size
    +$button-font-weight
    +$button-background
    +$button-active-background

     // SelectBox

    -$selectbox-background-color
    -$selectbox-active-background-color
    +$selectbox-background
    +$selectbox-active-background

     // Slider

    -$slider-background-color
    -$slider-active-area-color
    +$slider-height
    +$slider-background
    +$slider-active-area
    +$slider-knob-width
    +$slider-knob-height
    +$slider-knob-background
    +$slider-knob-border-color
    +$slider-shadow
    +$slider-font-color

     // Toolbar

    -$toolbar-background-color
    -$toolbar-active-background-color
    +$toolbar-background
    +$toolbar-active-background
    +$toolbar-font-weight

     // Menu

    -$menu-item-selected-background-color
    +$menu-item-selected-background

     // Picker

    -$picker-spinning-wheel-background-color
    +$picker-spinning-wheel-background
    +$picker-spinning-wheel-overlay
    +$picker-highlight-border-width
    +$picker-spinning-wheel-border-radius
    +$picker-spinning-wheel-divider-color
    +$picker-spinning-wheel-divider-width
    +$picker-label-height
    +$picker-label-font-size
    +$picker-height

     // Drawer

    -$drawer-above-background-color
    -$drawer-below-background-color
    +$drawer-above-background
    +$drawer-below-background

     // Collapsible

    -$collapsible-header-background-color
    -$collapsible-header-active-background-color
    +$collapsible-header-background
    +$collapsible-header-active-background
