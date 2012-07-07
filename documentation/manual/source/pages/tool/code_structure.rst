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

* **UTF-8 encoding** : All source files should be encoded in UTF-8.
* **Header** *(optional)* : A comment holding author, copyrights, etc.
* **Compiler Hints** *(optional)* : Enclosed in a block comment you can have any number of the following lines (leading white space is ignored):

  * **#use**\ *(classname)* : Other class that has to be added to the application; a "run" dependency that has to be available when the current class is actually used (instantiation, method invocation). (There is one special symbol, which is reserved for internal use and shouldn't be used in normal application code:

    * *feature-checks* : Use all known feature checks. This will add all known feature check classes as run time dependencies to the current class.)

  * **#require**\ *(classname)*  : Other class that has to be added to the application before this class; a "load" dependency that has to be available when the current class is loaded into the browser (i.e. its code is being evaluated). (There is one special symbol, which is reserved for internal use and shouldn't be used in normal application code:

    * *feature-checks* : Require all known feature checks. This will add all known feature check classes as load time dependencies to the current class.)

  * **#ignore**\ *(symbol)*  : Unknown global symbol (like a class name) that the compiler should not care about (i.e. you know it will be available in the running application). Ignored symbols will not be added to either the run or load dependencies of the class, and will not be warned about. Besides proper identifiers there are two special symbols you can use:

    * **auto-require** : Ignore all *require* dependencies detected by the automatic analysis; they will not be added to the class' load dependencies
    * **auto-use** : Ignore all *use* dependencies detected by the automatic analysis; they will not be added to the class' run dependencies

  * **#asset**\ *(resourcepattern)* : Resources that are used by this class (required if the class uses resources such as icons)
  * **#cldr** : Indicates that this class requires CLDR data at runtime

* **Single Definition** : One call to a *define()* method, such as qx.(:doc:`Class </pages/core/classes>`\|\ :doc:`Theme </pages/desktop/ui_theming>`\|\ :doc:`Interface </pages/core/interfaces>`\|\ :doc:`Mixin </pages/core/mixins>`\|...).define().

Example:

::

    /* ************************************************************************

       Copyright:

       License:

       Authors:

    ************************************************************************ */

    /* ************************************************************************

    #require(qx.core.Assert)
    #use(qx.log.Logger)
    #asset(custom/*)
    #ignore(foo)

    ************************************************************************ */

    qx.Class.define("custom.Application",
    {
      ...
    });

