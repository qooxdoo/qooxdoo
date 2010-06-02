.. _pages/internet_explorer_specific_settings#internet_explorer_specific_settings:

Internet Explorer specific settings
***********************************

This page describes all settings which are used/implemented by qooxdoo to workaround/solve IE-specific issues.

.. _pages/internet_explorer_specific_settings#document_mode_in_ie8:

Document Mode in IE8
====================

qooxdoo uses *Internet Explorer 8 standard mode* as the default for all generated applications. This is achieved by setting a XHTML 1.2 Doctype to all *index.html* files provided by the framework.

.. _pages/internet_explorer_specific_settings#using_alpha-transparent_pngs:

Using alpha-transparent PNGs
============================

IE7 and IE8 have built-in support for loading alpha-transparent PNGs. qooxdoo however does use the AlphaImageLoader for all IE versions whenever a PNG image has to be loaded. This has several reasons:

* Performance issues in IE8 - native alpha PNG support is slower when running IE8 standards mode
* Rendering bug in IE - reported at `Bug #1287 <http://bugzilla.qooxdoo.org/show_bug.cgi?id=1287>`_

.. _pages/internet_explorer_specific_settings#url-rewriting_under_https:

URL-Rewriting under HTTPS
=========================

Every IE version does show a *Mixed Content* warning whenever a resource (image, script, etc.) is loaded with a regular HTTP request when the containing page runs under HTTPS. However, this useful warning is also appearing in situations it is not acceptable, e.g. for relative paths like *./path/to/my/resource*.
In order to solve these issues every URL of a resource managed by qooxdoo is rewritten in IE under HTTPS to an absolute URL to prevent the warning. See `Bug #2427 <http://bugzilla.qooxdoo.org/show_bug.cgi?id=2427>`_ for more details.

