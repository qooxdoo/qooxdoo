Third-party Components
======================

The qooxdoo project makes use of components and tools from other
projects and endeavours. This applies to the framework %{JS} class code,
the tool chain, and static resources. This page gives an overview over
those components which are included with the SDK or other deliverables.
Please refer to the contained files for version information of a
particular component.

Besides foreign files we have included in the project, we also want to
list the tools we use to either produce or consume genuine files of our
source tree (beyond basic text editors ;-), so it is easy to oversee all
the project's dependencies.

Framework %{JS} Code
--------------------

These are components that are integrated into the framework class code.
I.e. if you are using classes from the framework to create your custom
application, chances are that these components will make it into the
deploy version of your application.

> header-rows
> :   1
>
> widths
> :   50 50
>
> -   -   Component
>     -   License
> -   -   [Sizzle](http://sizzlejs.com/)
>     -   [MIT](http://www.opensource.org/licenses/mit-license.php)
> -   -   [mustache.js](https://github.com/janl/mustache.js/)
>     -   MIT\_
> -   -   [SWFFix](http://code.google.com/p/swffix/)
>     -   MIT\_
> -   -   [Sinon.JS](http://sinonjs.org/)
>     -   BSD\_
> -   -   [parseUri](http://blog.stevenlevithan.com/archives/parseuri)
>     -   MIT\_
> -   -   [iScroll](http://cubiq.org/iscroll-4/)
>     -   MIT\_
> -   -   [JSON 3](https://github.com/bestiejs/json3)
>     -   MIT\_
> -   -   [PluginDetect
>         PDF.js](http://www.pinlady.net/PluginDetect/PDFjs/)
>     -   MIT\_

Application %{JS} Code
----------------------

These are components that are used by the %{JS} code of our demo apps.
I.e. if you are using classes from the framework to create your custom
application none of these components will ever make it into your
application.

> header-rows
> :   1
>
> widths
> :   50 50
>
> -   -   Component
>     -   License
> -   -   [ACE](http://ajaxorg.github.com/ace/)
>     -   [BSD
>         (mod.)](https://github.com/ajaxorg/ace/blob/master/LICENSE)
> -   -   [highlight.js](http://highlightjs.org/)
>     -   [BSD (3-Clause)](http://opensource.org/licenses/BSD-3-Clause)

Resources
---------

Static resource files, like images, CSS, etc. Static resources are
frequently included in custom application, so it is very likely some of
them will make it into your own custom application.

> header-rows
> :   1
>
> widths
> :   50 50
>
> -   -   Component
>     -   License
> -   -   [Tango Icons](http://tango.freedesktop.org/Tango_Icon_Library)
>     -   [CC BY-SA 2.5](http://creativecommons.org/licenses/by-sa/2.5/)
> -   -   [Oxygen Icons](http://www.oxygen-icons.org/)
>     -   [LGPLv3](http://www.gnu.org/licenses/lgpl-3.0.html)
> -   -   [CLDR Data](http://cldr.unicode.org/)
>     -   [Unicode Terms of Use](http://www.unicode.org/copyright.html)
> -   -   [JQTouch Project](http://www.jqtouch.com/)
>     -   MIT\_
> -   -   [iScroll](http://cubiq.org/iscroll-4/)
>     -   MIT\_

Tool Chain
----------

These are the Python modules we use that are not self-written nor part
of a vanilla Python 2.6 SDK. While they are shipped with our SDK they
are only used while the tool chain runs, and never become part of the
resulting custom application.

These are the Node.js modules we use that are not self-written nor part
of a vanilla Node.js v0.10+. While they are shipped with our SDK they
are only used while the tool chain runs, and never become part of the
resulting custom application.

Components or tools that are not included with the SDK
------------------------------------------------------

These tools we use on our development machines, e.g. to prepare the
%{qooxdoo} SDK, run automated tests, create reports, and the like. They
are not required to use any of %{qooxdoo}'s deliverables, but can be
interesting for users that pursue specific interests.
