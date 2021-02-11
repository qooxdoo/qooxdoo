# Overview

This is an introduction into Qooxdoo's mobile framework. Qooxdoo mobile provides
a optimized widget set to build applications for mobile devices.

## Supported Mobile Operating Systems

Qooxdoo mobile was tested with the native browsers of the following operating
systems:

- iOS
- Android 1.6+ (Stock Browser and Chrome Mobile)
- Windows Phone 8
- BlackBerry 10 OS

## Supported Desktop Browsers

Qooxdoo mobile was tested with the following desktop browsers:

- Safari 5
- Chrome 10+
- Firefox 10+
- Internet Explorer 10+

## Features

- [Mobile widget set](apps://apiviewer/#qx.ui.mobile)
- [Theming via CSS and SCSS](theming.md)
- Pointer events: pointerdown, pointerup, pointermove, pointerover, pointerout
- Touch events: touchstart, touchmove, touchend, touchcancel
- Gesture events: swipe, tap, longtap, dbltap, roll
- Animations between pages
- Fixed toolbars and momentum scrolling
- Basic [PhoneGap](http://www.phonegap.com/) support
- Support for high-resolution displays ("Retina display support")
- Built-in handling of high DPI images for variable pixel densities

## API Documentation

- [qx.application.Mobile](apps://apiviewer/#qx.application.Mobile): The mobile
  application.
- [qx.ui.mobile](apps://apiviewer/#qx.ui.mobile): This package contains all
  mobile widgets. See the API documentation for more information.

## Create a Mobile Application

To create a mobile application `mobileapp` in your home directory with your
shell, change to your home directory (just `cd`).

```bash
qx create --type mobile
```

and follow the steps.

Have a look into the API documentation of
[qx.ui.mobile.page.Page](apps://apiviewer/#qx.ui.mobile.page.Page) to understand
the basic concepts of Qooxdoo mobile.

To learn how to develop a basic mobile application, you should try the mobile
tweets client [tutorial](tutorial.md)

If you are new to Qooxdoo, make sure you have read the getting started
getting_started/helloworld.md#setup_the_framework tutorial to understand the
basics of Qooxdoo.

## Environment Keys

The following environment keys are available:

- `qx.mobile.nativescroll: true|false` - Whether to use native scrolling or
  iScroll\_ for scrolling.

- `device.pixelRatio: Number` - the ratio between physical pixels and
  device-independent pixels (dips) on the device.

- `device.type: String` - Determines on what type of device the application is
  running. Valid values are: "mobile", "tablet" or "desktop".

## Differences to Desktop Widgets

The Qooxdoo mobile widget set is optimized for the use on mobile devices. In
fact, the Qooxdoo mobile widget set is up to six times faster than the desktop
widget set on mobile devices. We have tried to keep the differences of the API
as low as possible, so that a Qooxdoo developer will have his first Qooxdoo
mobile application running within minutes. Of course, respecting the speed
advantage, not all features of the desktop widget set could be retained. There
are some differences, listed below:

- Theming: The theming is done via CSS files. Have a look into the existing
  themes, to see how the styling is done. You can find the themes under
  `framework/source/resource/qx/mobile/css/`. To change the theme, just change
  the included CSS file in the `index.html` and change the loaded assets in your
  mobile application. There is a `index.html` file for the build version as
  well. You can find it in the `source/resource/` folder of your application.

- No layout item: Only a few, essential, styles are provided by a widget. You
  should set all other styles of a widget via CSS, using the `addCssClass`
  method of a widget.

- No queues: Elements are created directly. There is no element, layout, display
  queue. Keep this in mind when you create and add widgets.

- Layouts: Layouts are done via CSS(3). HBox / VBox layouts are implemented
  using the [flexible box layout](http://www.w3.org/TR/css3-flexbox/)

- [qx.ui.mobile.page.Page](apps://apiviewer/#qx.ui.mobile.page.Page): A page is
  a widget that provides a screen which users can interact with in order to do
  something. Most times a page provides a single task or a group of related
  tasks. A Qooxdoo mobile application is usually composed of one or more loosely
  bound pages. Typically there is one page that presents the "main" view.

## Demo Applications

To see Qooxdoo mobile applications in action or to see how to implement an
application, you can have a look on the following demo applications:

- [Mobile Showcase](apps://mobileshowcase) - see all mobile widgets in action
- [Mobile Feedreader](apps://feedreader-mobile) - the feedreader as a mobile
  app. Using the same logic and models as the feedreader for desktop browsers
  does.

## How to contribute?

You can contribute in different ways:

- Testing: Test Qooxdoo mobile on your mobile device and give us feedback.

- Theming: You can optimize the current CSS files or even create your own theme.

- Widgets: Widget / Feature missing? Create an widget an post it back to us.

- Bugs: If you have found a bug, or when you have fixed it already, please open
  a new issue in the
  [Qooxdoo repository issues](https://github.com/qooxdoo/qooxdoo/issues) or
  generate a pull request in
  [Qooxdoo pull requests](https://github.com/qooxdoo/qooxdoo/pulls) .

- Discussion/Feedback: Please post questions to
  [Stack Overflow](https://stackoverflow.com) with a "Qooxdoo" tag. The Qooxdoo
  specific posts will be scanned and tried to be answered similar to the regular
  mailing list.
