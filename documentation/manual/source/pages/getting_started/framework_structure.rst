.. _pages/framework_structure#framework_structure:

Framework Structure
*******************

When exploring the framework source, the following overview will give you an idea about the file structure of qooxdoo:

**application** - sample applications (for end users)

* ``demobrowser`` - for browsing a large number of demos (`online <http://demo.qooxdoo.org/%{version}/demobrowser>`__)
* ``feedreader`` - a sample rich internet application (`online <http://demo.qooxdoo.org/%{version}/feedreader>`__)
* ``portal`` - a showcase for low-level features, i.e. without widgets (`online <http://demo.qooxdoo.org/%{version}/portal>`__)
* ``playground`` - an interactive playground without the need to install qooxdoo (`online <http://demo.qooxdoo.org/%{version}/playground>`__)
* ``featureconfigeditor`` -- a tool to create configurations for browser-specific builds (`online <http://demo.qooxdoo.org/%{version}/featureconfigeditor>`__)

**component** - helper applications (used internally)

* ``apiviewer`` - API reference (for ``generate.py api``) (`online <http://api.qooxdoo.org>`__)
* ``skeleton`` - blue print for custom applications (for ``create-application.py``)
* ``testrunner`` - unit testing framework (for ``generate.py test / test-source``) (`online <http://demo.qooxdoo.org/%{version}/testrunner>`__)
* ``simulator`` - GUI testing framework (for ``generate.py simulation-build / simulation-run``)
* ``library`` - common components used by multiple applications

**framework** - main frontend part of the framework

* ``source``

  * ``class`` - JavaScript classes
  * ``resource``

    * ``qx`` - resources need to be namespaced, here it is ``qx``

      * ``decoration`` - images for the decorations, ``Modern`` and ``Classic``
      * ``icon`` - icon themes that come with qooxdoo, ``Oxygen`` and ``Tango``
      * ``static`` - other common resources like ``blank.gif``

    * ``source`` - contains original resources

  * ``translation`` - language-specific data as ``po`` files

**tool** - tool chain of the framework 

* ``bin`` - various scripts are located here, most importantly ``generator.py``
* ``data`` - lots of data to be used by different tools, e.g. for localization, migration, etc.
* ``pylib`` - Python modules used by the platform-independent tool chain

