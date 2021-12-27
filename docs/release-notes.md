# Qooxdoo Release Notes

Starting with Qooxdoo 6.0.0, there are lots of changes which have happened "under the hood"
which mean great things for the project, a better development environment for coders, and
still maintaining that rock solid reliability, scalability and no compromise on backwards
compatibility and coding standards.

And although 6.0.0 is a very new release, it's stable because the core developers as well as a number of other developers have been using the `master` branch of the framework constantly for many years; stability is essential to us, and while there are bound to be bugs, the project has gone through a lot of real world testing to get here.


## Deployment via npmjs.com
Instead of downloading a tarball or zip file, releases are now distributed via npm - this streamlines version management, and makes it particularly easy for new users.

We've also modularised the repo - using features like (the new packages system)[#packages], things like the API viewer, test runner, etc can be added on demand to your application; internally, as they are separate repositories at GitHub this allows us to vary the release cycle for those added features so that we can get updates out faster (and it's easier for anyone who wants to contribute changes!)


## Compiler
There is a whole new compiler and command line tool (the `qx` command), written entirely in 
Javascript and replacing the Python toolchain (which is still supported but is officially 
deprecated **and will be removed in v7**).

The compiler (the `qx compile` command) is fast, and continuously compiles code written to 
the latest ES6 language specs into ES5, giving you ultimate compatibility without compromising
ease of coding.

[Documentation](https://qooxdoo.org/documentation/#/development/cli/commands)


## Packages
The new compiler supports "packages" (which are analogous to the old "contrib" system), where
it is able to detect and install widgets and libraries written by anyone and made available on 
GitHub.  This is similar to how `npm` or other package managers work, using GitHub as the
database to pull from.

See the `qx package` command for more information on how to incorporate packages into your
application.

All published packages are listed in an online
[Catalog](http://qooxdoo.org/package-cache/) and showcased in our [Package
Browser](https://qooxdoo.org/qxl.packagebrowser/qxl.packagebrowser/#),
which is itself a packaged application that can be locally installed.

[Documentation](https://qooxdoo.org/documentation/#/development/cli/packages).


## Automatic Memory Management
A big improvement is that it is no longer necessary to manually `.dispose()` most objects when you
no longer need them; this isn't true for objects such as widgets, but for most objects you can simply 
stop referring to the object and Javascript's garbage collection will take care of the rest.

**NOTE** this does have an issue for backwards compatibility - previously, every single object was
stored in `qx.core.ObjectRegistry` but it was this list that prevented normal garbage collection.  In
6.0.0, only widgets are added to that list automatically.  You can still add objects to the `qx.core.ObjectRegistry`
if you want to.

Although it is *mostly* widgets that are in the `ObjectRegistry`, it's actually any class which implements
the `qx.core.IDisposable` interface; if you add that interface to your own classes, they will automatically
added to the `ObjectRegistry` and you must manually call `.dispose()`.

[Documentation](https://qooxdoo.org/documentation/#/development/howto/memory_management)


## Object ID
All objects now support an ID mechanism which is heirarchial and can be navigated by code; this simplifies
development and enables external automated testing tools to find your widgets and other objects.

[Documentation](https://qooxdoo.org/documentation/#/core/object_id)


## Promises
Promises are now integrated into the framework, represented by the `qx.Promise` class.  Events and property
apply methods can return promises and will when for previous promises to complete before going onto
the next step.

[Documentation ](https://qooxdoo.org/documentation/#/core/promises)


## Webfonts
Qooxdoo now supports webfonts / iconfonts everywhere an image can be placed.

[Documentation](https://qooxdoo.org/documentation/#/development/howto/icon_fonts)

## New Themes

There's a new theme based on Google Materials design
philosophy and available in Light and Dark modes - the theme
is called Tangible and is `qx.theme.TangibleLight` and
`qx.theme.TangibleDark`. An additional theme is available as a [Qooxdoo
package](https://qooxdoo.org/qxl.packagebrowser/#sqville~ville.Clean~Demos~WidgetBrowser), 
and we expect more themes to be contributed via packages.

## New testing infrastructure

The v6 release contains a testing infrastructure for unit and UI
testing that will ultimately allow to test browser and server apps by
simply executing `qx test`, using pluggable test runners. 

[Documentation](https://qooxdoo.org/documentation/#/development/testing/)

## Component behaviour changes

In hindsight of better keyboard accessibility support some components received changes regarding their behaviour:

| Component | Changes |
| --- | --- |
| qx.ui.core.scroll.AbstractScrollArea | The width and height are now fix. To reenable dynamic growing, the width or height can be set to null. |
| qx.ui.form.AbstractSelectBox | `Tab` Key is now equally treated as `Escape` and closes the menu |
| qx.ui.form.ComboBox | - `Down` Key now opens the menu without pressing `Alt` <br /> - Textfield text is not fully selected anymore when the menu closes <br /> - Pressing input specific keys while the menu is open will close the menu|
| qx.ui.form.MenuButton | - `Space` Key is now equally treated as `Enter` and opens the menu <br /> - Opening the menu focuses the button |
| qx.ui.form.RadioGroup | Changing selection now moves focus too |
| qx.ui.menu.Manager | Pressing tab while a menu is open will close the menu |
| qx.ui.menubar.Button | Is now focusable and listens to keyboard events |
| qx.ui.table.Table | The first focusable cell gets focused if no cell is focused and a keyboard event tries to move the focus |
| qx.ui.table.pane.Scroller | Does not focus first focusable cell anymore if the model data changes and no row was focused. Instead no cell gets focused |
| qx.ui.toolbar.Button | Is now focusable and listens to keyboard events |
| qx.ui.toolbar.CheckBox | Is now focusable and listens to keyboard events |
| qx.ui.toolbar.SplitButton | Is now focusable and listens to keyboard events |

## Accessibility

Accessibility is an important topic in nowadays webdevelopment in order to allow assistive technologies to better help persons with disabilities. Qooxdoo now supports better integration of [WAI-ARIA](https://www.w3.org/TR/wai-aria-1.1/) and more keyboard accessibility for the following components:

- Button
- Checkbox
- Combobox
- Menu
- RadioButton
- SelectBox
- Slider
- Table
- Tabview
- ToggleButton
- Toolbar
- Window

Other components will follow.

## Licensing and Open Source Ownership
The first big change, chronologically speaking, was that 1&1, the company which originally 
developed Qooxdoo donated the project completely into the public domain; the project is now 
entirely community based and open source, and as part of this we changed the licensing
model to the MIT license.

None of this should make any practical difference to anyone using Qooxdoo to develop their 
applications - the MIT license is at least as liberal as the Eclipse license that was used
before, and we've made sure that all contributions have formally switched to MIT.

As a team, we are a small group of experienced developers based around the world who use
Qooxdoo every day and have a vested interest in maintaining the project and keeping it strong.

All code is available at GitHub [https://github.com/qooxdoo](https://github.com/qooxdoo),
where we have published policies and rules on contributing; we actively encourage anyone to
submit Pull Requests to contribute to the project.

We chat in public on [Gitter](https://gitter.im/qooxdoo/qooxdoo) and answer questions
on [StackOverflow](https://stackoverflow.com/questions/tagged/qooxdoo)

And we have [exciting plans for the future](http://qooxdoo.org/documentation/#/roadmap)!

[Documentation](https://qooxdoo.org/documentation/#/development/contribute)



