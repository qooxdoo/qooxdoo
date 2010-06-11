.. _pages/image_handling#image_handling:

Image Handling
**************

This document tries to give some insights into the low-level features for image handling. This includes the functionality of these classes:

* ``qx.bom.element.Background`` (`API <http://api.qooxdoo.org#qx.bom.element.Background>`__)
* ``qx.bom.element.Decoration`` (`API <http://api.qooxdoo.org#qx.bom.element.Decoration>`__)

Generally there are two common ways to show images in a browser: normal image elements and background images. The ``Decoration`` class supports both of them and automatically selects the type to use for a specific requirement. The ``Background`` class is a simple wrapper around the support for background images. It is mainly some cross-browser magic to fix a few quirks of some of the supported engines.
