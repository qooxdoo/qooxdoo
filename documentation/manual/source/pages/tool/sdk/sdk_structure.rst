.. _pages/framework_structure#framework_structure:

SDK Structure
*******************

When exploring the SDK tree, the following overview will give you an idea about the file structure of qooxdoo:

**readme.txt** - a quick information

**license.txt** - qooxdoo's license information

**index.html** - an overview over and access to most of the SDK's applications. Mind that in order to use them, you might need to run a ``generate.py build`` in their respective directories first.

**application/**

  * :ref:`sample and demo applications <pages/application#demo_applications>` and interactive tools (for end users) in their respective subfolders, like ``demobrowser``, ``feedreader`` or ``playground``

**component/**

  * :ref:`helper applications and libraries <pages/application#developer_tools>` (used internally), like ``apiviewer``, ``testrunner`` or ``simulator``.

**documentation/** - documentation files

  * ``manual`` - the user manual


**framework/** - qooxdoo's class library

  * ``source``

    * ``class`` - JavaScript classes
    * ``resource``

      * ``qx`` - resources need to be namespaced, here it is ``qx``

        * ``decoration`` - images for the decorations, ``Modern`` and ``Classic``
        * ``icon`` - icon themes that come with qooxdoo, ``Oxygen`` and ``Tango``
        * ``static`` - other common resources like ``blank.gif``

      * ``source`` - contains original resources

    * ``translation`` - language-specific data as ``po`` files

**tool/** - tool chain of the framework 

  * ``bin`` - executable scripts are located here, most importantly ``generator.py``
  * ``data`` - lots of data to be used by different tools, e.g. for localization, migration, etc.
  * ``pylib`` - Python modules used by the tool chain

