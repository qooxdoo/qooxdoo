.. _pages/introduction/third_party_components:

Third-party Components
***************************

The qooxdoo project makes use of components and tools from other projects and
endeavours. This applies to the framework %{JS} class code, the tool chain, and
static resources. This page gives an overview over those components which are
included with the SDK or other deliverables. Please refer to the contained
files for version information of a particular component.

Besides foreign files we have included in the project, we also want to list the
tools we use to either produce or consume genuine files of our source tree
(beyond basic text editors ;-), so it is easy to oversee all the project's
dependencies.

.. _pages/introduction/third_party_components#js_code:

Framework %{JS} Code
============================

These are components that are integrated into the framework class code. I.e. if
you are using classes from the framework to create your custom application,
chances are that these components will make it into the deploy version of your
application.

.. list-table::
  :header-rows: 1
  :widths: 50 50

  * - Component
    - License

  * - `Sizzle <http://sizzlejs.com/>`_
    - `MIT <http://www.opensource.org/licenses/mit-license.php>`_

  * - `mustache.js <https://github.com/janl/mustache.js/>`_
    - `MIT`_

  * - `SWFFix <http://code.google.com/p/swffix/>`_
    - `MIT`_

  * - `Sinon.JS <http://sinonjs.org/>`_
    - `BSD`_

  * - `parseUri <http://blog.stevenlevithan.com/archives/parseuri>`_
    - `MIT`_

  * - `iScroll <http://cubiq.org/iscroll-4/>`_
    - `MIT`_

  * - `JSON 3 <https://github.com/bestiejs/json3>`_
    - `MIT`_

  * - `PluginDetect PDF.js <http://www.pinlady.net/PluginDetect/PDFjs/>`_
    - `MIT`_

Application %{JS} Code
============================

These are components that are used by the %{JS} code of our demo apps.  I.e. if
you are using classes from the framework to create your custom application none
of these components will ever make it into your application.

.. list-table::
  :header-rows: 1
  :widths: 50 50

  * - Component
    - License

  * - `ACE <http://ajaxorg.github.com/ace/>`_
    - `BSD (mod.) <https://github.com/ajaxorg/ace/blob/master/LICENSE>`_

  * - `highlight.js <http://highlightjs.org/>`_
    - `BSD (3-Clause) <http://opensource.org/licenses/BSD-3-Clause>`_


.. _pages/introduction/third_party_components#resources:

Resources
=========

Static resource files, like images, CSS, etc. Static resources are frequently
included in custom application, so it is very likely some of them will make it
into your own custom application.

.. list-table::
  :header-rows: 1
  :widths: 50 50

  * - Component
    - License

  * - `Tango Icons <http://tango.freedesktop.org/Tango_Icon_Library>`_
    - `CC BY-SA 2.5 <http://creativecommons.org/licenses/by-sa/2.5/>`_

  * - `Oxygen Icons <http://www.oxygen-icons.org/>`_
    - `LGPLv3 <http://www.gnu.org/licenses/lgpl-3.0.html>`_

  * - `CLDR Data <http://cldr.unicode.org/>`_
    - `Unicode Terms of Use <http://www.unicode.org/copyright.html>`_

  * - `JQTouch Project <http://www.jqtouch.com/>`_
    - `MIT`_

  * - `iScroll <http://cubiq.org/iscroll-4/>`_
    - `MIT`_

.. _pages/introduction/third_party_components#tool_chain:

Tool Chain
===========

These are the Python modules we use that are not self-written nor part of a
vanilla Python 2.6 SDK. While they are shipped with our SDK they are only used
while the tool chain runs, and never become part of the resulting custom
application.

.. list-table::
   :header-rows: 1
   :widths: 50 50

   * - Module
     - License

   * - `argparse <https://pypi.python.org/pypi/argparse/>`_
     - `Python License 2 <http://opensource.org/licenses/Python-2.0>`_

   * - `demjson <http://deron.meranda.us/python/demjson/>`_
     - `LGPL 3 <http://www.gnu.org/licenses/lgpl-3.0.html>`_

   * - `elementtree <http://effbot.org/zone/element-index.htm>`_
     - `old-style Python <http://effbot.org/zone/copyright.htm>`_ `(HPND) <http://www.opensource.org/licenses/historical.php>`_

   * - `graph <http://pypi.python.org/pypi/python-graph>`_
     - `MIT`_

   * - `jsonschema <http://pypi.python.org/pypi/jsonschema/>`_
     - `MIT`_

   * - `polib <http://pypi.python.org/pypi/polib>`_
     - `MIT`_

   * - `pyparsing <http://pypi.python.org/pypi/pyparsing/>`_
     - `MIT`_

   * - `simplejson <http://pypi.python.org/pypi/simplejson>`_
     - `MIT`_

   * - `six <https://pypi.python.org/pypi/six/>`_
     - `MIT`_

   * - `textile <http://pypi.python.org/pypi/textile/>`_
     - `BSD <http://www.opensource.org/licenses/bsd-license.php>`_

These are the Node.js modules we use that are not self-written nor part of a
vanilla Node.js v0.10+. While they are shipped with our SDK they are only used
while the tool chain runs, and never become part of the resulting custom
application.

.. list-table::
   :header-rows: 1
   :widths: 50 50

   * - Module
     - License

   * - `async <https://npmjs.org/package/async>`_
     - `MIT`_

   * - `deepmerge <https://npmjs.org/package/deepmerge>`_
     - `MIT`_

   * - `shelljs <https://npmjs.org/package/shelljs>`_
     - `BSD (3-Clause)`_


.. _pages/introduction/third_party_components#other:

Components or tools that are not included with the SDK
=======================================================

These tools we use on our development machines, e.g. to prepare the %{qooxdoo}
SDK, run automated tests, create reports, and the like. They are not required to
use any of %{qooxdoo}'s deliverables, but can be interesting for users that
pursue specific interests.

.. list-table::
   :header-rows: 1
   :widths: 50 50

   * - Tool
     - License

   * - `ImageMagick <http://www.imagemagick.org/script/index.php>`_
     - `GPL-compat <http://www.imagemagick.org/script/license.php>`_

   * - `Make <http://www.gnu.org/s/make/>`_
     - `GPL 3.0 <http://www.gnu.org/licenses/gpl-3.0.html>`_ or later

   * - `Mozilla Rhino <http://developer.mozilla.org/en/Rhino>`_
     - `MPL 1.1 <http://www.mozilla.org/MPL/MPL-1.1.html>`_/`GPL 2.0 <http://www.gnu.org/licenses/gpl-2.0.html>`_, `Unnamed License <https://developer.mozilla.org/en/Rhino_License#License_for_portions_of_the_Rhino_debugger>`_

   * - `RRDTool <http://oss.oetiker.ch/rrdtool/>`_
     - `GPL <http://www.gnu.org/copyleft/gpl.html>`_

   * - `Selenium <seleniumhq.org>`_
     - `Apache License 2.0 <http://www.apache.org/licenses/LICENSE-2.0>`_

   * - `Sphinx <http://sphinx.pocoo.org/>`_
     - `BSD`_

   * - `TeX Live <http://www.tug.org/texlive/>`_
     - `mixed free licenses <http://tug.org/texlive/LICENSE.TL>`_

   * - `qxMaven <http://qxmaven.charless.org/>`_
     - `LGPL <http://www.gnu.org/licenses/lgpl.html>`_, `EPL <http://www.eclipse.org/org/documents/epl-v10.php>`_
