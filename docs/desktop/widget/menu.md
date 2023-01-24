# Menu

The Menu is a widget that contains different widgets to create a classic menu
structure. The menu is used from different widget, that needs a menu structure
e.q. MenuBar.

## Preview Image

![:Menu](menu.png)

## Features

- On demand scrolling if the menu doesn't fit on the screen
- Menu items with text and/or icon.
- Each menu item can have a command for keyboard support.
- Menu items can have submenus.

The menu can contain different item types:

- Normal buttons
- CheckBox buttons
- RadioButtons
- Separators

## Description

The Menu widget is used in combination with other widgets. The other widgets has
an instance from the menu, and it's shown by user interactions. Each item in a
menu can get a command key, that is used to get keyboard support for the user.

Here a some widgets that use a menu for user interaction:

- menubar
- toolbar
- menubutton
- splitbutton
- list

The package `qx.ui.menu` has a collection of needed classes for creating a menu
structure. The `qx.ui.menu.Menu` class is the container class for the menu
structure and has items as child. Here are some item that can be used to create
the structure:

- [Button](apps://apiviewer/#qx.ui.menu.Button)
- [CheckBox](apps://apiviewer/#qx.ui.menu.CheckBox)
- [RadioButton](apps://apiviewer/#qx.ui.menu.RadioButton)
- [Separator](apps://apiviewer/#qx.ui.menu.Separator)

To create a submenu structure, each item (but not separator) can contain a menu
to realize the submenu structure.

## Diagram

![Menu_UML](menu_uml.png)

## Demos

Here are some links that demonstrate the usage of the widget:

- [Some different widgets that use the menu functionality](apps://demobrowser/#widget~Menu.html)
- [Menus used in a MenuBar](apps://demobrowser/#widget~MenuBar.html)

## API

Here is a link to the API of the Widget:
[qx.ui.menu.Menu](apps://apiviewer/#qx.ui.menu.Menu)
