.. _pages/code_structure#code_structure:

Code Structure
**************

.. _pages/code_structure#guidelines:

Outline
==========

This is how a single source file should look like. Ahead of the detailed listing here are some general rules to follow when you write your own classes:

* Define **one** class per file.
* The base **class name** (like "Application" in *"custom.Application"*) has to match the **file name** (e.g. *"Application.js"*).
* The class **name space** (like "custom" in *"custom.Application"*) has to match the **directory path** of the file under the ``source/class`` root (like e.g. *"custom/Application.js"*).

  * This applies recursively for sub-directories. E.g. a class in the file *"custom/foo/Bar.js"* has to be named *"custom.foo.Bar"*.


.. _pages/code_structure#details:

Details
=======

* **UTF-8 encoding** : All source files have to be encoded in UTF-8.
* **Header** *(optional)* : A comment holding author, copyrights, etc.
* **Compiler Hints** *(optional)* : Enclosed in a :doc:`JSDoc
  </pages/development/api_jsdoc_ref>` comment you can have any number of the
  following `@` attributes that serve as hints to the compiler:

  * :ref:`pages/development/api_jsdoc_ref#use`
  * :ref:`pages/development/api_jsdoc_ref#require`
  * :ref:`pages/development/api_jsdoc_ref#ignore`
  * :ref:`pages/development/api_jsdoc_ref#asset`
  * :ref:`pages/development/api_jsdoc_ref#cldr`

  See their respective descriptions on the JSDoc page for details. Currently,
  `@use`, `@require`, `@asset` and `@cldr` are interpreted global to the file
  (So actually no matter where you place those hints within the file they will
  scope over the entire file. Hence, it's good practice to put them at the
  beginning). Only `@ignore` will scope over the construct it precedes, as the
  JSDoc reference explains.

* **Single Definition** : One call to a *define()* method, such as
  qx.(:doc:`Class </pages/core/classes>`\|\ :doc:`Theme
  </pages/desktop/ui_theming>`\|\ :doc:`Interface </pages/core/interfaces>`\|\
  :doc:`Mixin </pages/core/mixins>`\|...).define().

Example:

::

    /* ************************************************************************

       Copyright:

       License:

       Authors:

    ************************************************************************ */

    /**
     * My wonderful class.
     *
     * @asset(custom/*)
     * @ignore(foo)
     */

    qx.Class.define("custom.Application",
    {
      ...
    });

