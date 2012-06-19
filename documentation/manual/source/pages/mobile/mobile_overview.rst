.. _pages/mobile/mobile_overview#overview:

Overview
********

This is an introduction into qooxdoo's mobile framework. qooxdoo mobile
provides a optimized widget set to build applications for mobile devices.

Supported Mobile Operating Systems
==================================

qooxdoo mobile was tested with the native browsers of the following operating
systems:

* iOS
* Android 1.6+
* BlackBerry 10 OS (on BlackBerry PlayBook)

Supported Desktop Browsers
==========================

qooxdoo mobile was tested with the following desktop browsers:

* Safari 5
* Chrome 10+
* Firefox 10 (Experimental)

Features
========

.. index:: animation, mobile, widget, theme, ios, android, touch, page, scroll, iscroll, phonegap

* `Mobile widget set <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.mobile>`_
* :doc:`Theming via CSS and LESS <theming>`
* iOS theme
* Android theme
* Touch events: touchstart, touchmove, touchend, touchcancel 
* Gesture events: swipe, tap
* Animations between pages
* Touch event emulation for debugging in desktop browsers
* Fixed toolbars and momentum scrolling via `iScroll <http://cubiq.org/iscroll>`_
* Basic `PhoneGap <http://www.phonegap.com/>`_ support


.. _pages/mobile_overview#api:

API Documentation
=================

* `qx.application.Mobile <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Mobile>`_:
  The mobile application.
* `qx.ui.mobile <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.mobile>`_:
  This package contains all mobile widgets. See the API documentation for more
  information.


Create a Mobile Application
===========================

To create a mobile application ``mobileapp`` in your home directory with your shell, change to your home directory (just ``cd``). With a qooxdoo SDK available at ``/opt/qooxdoo-%{version}-sdk``, call the script as follows:

::

    /opt/qooxdoo-%{version}-sdk/tool/bin/create-application.py --type=mobile --name=mobileapp --out=.

Have a look into the API documentation of `qx.ui.mobile.page.Page <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.mobile.page.Page>`_
to understand the basic concepts of qooxdoo mobile.

To learn how to develop a basic mobile application, you should try the :doc:`mobile Twitter client tutorial <tutorial>`.

If you are new to qooxdoo, make sure you have read the :ref:`getting started <pages/getting_started/helloworld#setup_the_framework>` tutorial to
understand the basics of qooxdoo.


Debugging
=========

If you want to debug your qooxdoo mobile application on a mobile device, we propose
using a web remote debugger called "weinre":

`weinre. Web Inspector Remote <http://phonegap.github.com/weinre/>`_

Remote debugging allows a developer to use the browsers developer tools from a desktop computer while inspecting and manipulating the website on the mobile device.

Here are some hints for enabling remote debugging on your qooxdoo mobile application with weinre:

  * Install weinre according to the weinre manual. Create a server.properties file,
    and change the port number to 8081 or similar.

  * Add the following script tag to the index.html in your qooxdoo mobile application:

    ``<script src="http://[ENTER_YOUR_HOST_IP_HERE]:8081/target/target-script-min.js"></script>``

  * Replace ip placeholder with your desktop computer ip on your "index.html".

  * Start weinre.

  * Call your qooxdoo mobile application from your mobile device.

Important: Please make sure, not having the character "#", behind the "index.html" on your url.
Weinre uses debug ids, which are appended after the target url, just like "..qooxdoo/foo/../index.html#anonymous".
On mac computers "anonymous" is the default debug id. Any other debug id, results in a disconnect of 
target mobile device. 

Unfortunately, there is a clash with qooxdoo mobile navigation logic. Qooxdoo navigation manager uses 
also the number sign, for navigating through pages:

"../mobileshowcase/source/index.html#/form"

So, if you navigate to a subpage with qooxdoo, and reload the page, weinre interprets
"#/form" as the debug id "/form". On mac computers, only "anonymous" is allowed, so
the target device disconnects from debug server.

This means, debugging with weinre works fine, as long as you do not reload a 
subpage of your qooxdoo mobile page. Your starting point for remote debugging should
always be the "index.html" without any strings attached.


Environment Keys
================

The following environment keys are available:

* ``qx.mobile.emulatetouch: true|false`` - Enables desktop browser touch emulation.
  Enable this option if you want to debug the application in your desktop browser.
* ``qx.mobile.nativescroll: true|false`` - Whether to use native scrolling or
  `iScroll <http://cubiq.org/iscroll>`_ for scrolling.

Differences between Desktop Widgets
===================================

The qooxdoo mobile widget set is optimized for the use on mobile devices. In fact,
the qooxdoo mobile widget set is up to six times faster than the desktop widget set
on mobile devices.
We have tried to keep the differences of the API as low as possible, so that a qooxdoo
developer will have his first qooxdoo mobile application running within minutes.
Of course, respecting the speed advantage, not all features of the desktop widget set
could be retained. There are some differences, listed below:

* Theming: The theming is done via CSS files. Have a look into the existing themes, to see
  how the styling is done. You can find the themes under ``framework/source/resource/qx/mobile/css/``.
  To change the theme, just change the included CSS file in the ``index.html`` and change the loaded
  assets in your mobile application. There is a ``index.html`` file for the build version as well. You can
  find it in the ``source/resource/`` folder of your application.
* No layout item: Only a few, essential, styles are provided by a widget. You
  should set all other styles of a widget via CSS, using the ``addCssClass`` method of a widget.
* No queues: Elements are created directly. There is no element, layout, display queue. Keep this in
  mind when you create and add widgets.
* Layouts: Layouts are done vis CSS(3). HBox / VBox layouts are implemented using the
  `flexible box layout <http://www.w3.org/TR/css3-flexbox/>`_
* `qx.ui.mobile.page.Page <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.mobile.page.Page>`_:
  A page is a widget which provides a screen with which users can interact in order to do something. Most times a page provides a single task or a group of related tasks. A qooxdoo mobile application is usually composed of one or more loosely bound pages.
  Typically there is one page that presents the “main” view.
  
  
Demo Applications
=================

To see qooxdoo mobile applications in action or to see how to implement an application,
you can have a look on the following demo applications:

* `Mobile Showcase <http://demo.qooxdoo.org/%{version}/mobileshowcase>`_ - see all mobile widgets in action
* `Mobile Feedreader <http://demo.qooxdoo.org/%{version}/feedreader-mobile>`_ - the feedreader as a mobile app. Using the same logic and models as the feedreader for desktop browsers does.


All applications can be found in the ``application`` folder of your qooxdoo checkout.
  
How to contribute?
==================

You can contribute in different ways:

* Testing: Test qooxdoo mobile on your mobile device and give us feedback.
* Theming: You can optimize the current CSS files or even create your own theme.
* Widgets: Widget / Feature missing? Create an widget an post it back to us.
* Bugs: If you have found a bug, or when you have fixed it already, please open
  a bug report in the qooxdoo `Bugzilla <http://bugzilla.qooxdoo.org/>`_ with the
  ``core-mobile`` component.
* Devices: If you have an old smartphone (Android, iPhone, Blackberry, Windows Phone, WebOS, etc.)
  that you don't need anymore, you could donate it to qooxdoo. We would be happy to test qooxdoo mobile on it.
* Discussion/Feedback: Please post questions to `our mailing list <http://lists.sourceforge.net/lists/listinfo/qooxdoo-devel>`__. 
