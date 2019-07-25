# Internet Explorer specific settings (outdated)

This page describes all settings which are used/implemented by qooxdoo to
workaround/solve IE-specific issues.

Document Mode in IE8
--------------------

qooxdoo uses *Internet Explorer 8 standard mode* as the default for all
generated applications. This is achieved by setting a XHTML 1.2 Doctype to all
*index.html* files provided by the framework.

Using alpha-transparent PNGs
----------------------------

IE7 and IE8 have built-in support for loading alpha-transparent PNGs. qooxdoo
however does use the AlphaImageLoader for all IE versions whenever a PNG image
has to be loaded. 

URL-Rewriting under HTTPS
-------------------------

Every IE version does show a *Mixed Content* warning whenever a resource (image,
script, etc.) is loaded with a regular HTTP request when the containing page
runs under HTTPS. However, this useful warning is also appearing in situations
it is not acceptable, e.g. for relative paths like *./path/to/my/resource*. In
order to solve these issues every URL of a resource managed by qooxdoo is
rewritten in IE under HTTPS to an absolute URL to prevent the warning. 
