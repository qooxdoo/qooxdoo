.. _pages/code_structure#code_structure:

Code Structure
**************

This is how a single source file should look like:

* **UTF-8 encoding**:All source files should be encoded in UTF-8.
* **(optional) Header**:A comment holding author, copyrights, etc.
* **(optional) Compiler Hints**:Can be any number of the following:

  * **#use**\ (classname) -- other class that has to be added to the application; a "run" dependency that has to be available when the current class is actually used (instantiation, method invocation)
  * **#require**\ (classname)  -- other class that has to be added to the application before this class; a "load" dependency that has to be available when the current class is loaded into the browser (its code being evaluated)
  * **#ignore**\ (classname)  -- unknown global symbol (like a class name) that the compiler should not care about (i.e. you know it will be available in the running application). Ignored symbols will not be warned about. Besides proper class names there are two special symbols you can use:

    * *auto-require*  -- ignore all *require* dependencies detected by the automatic analysis; they will not be added to the class' load dependencies
    * *auto-use*  -- ignore all *use* dependencies detected by the automatic analysis; they will not be added to the class' run dependencies

  * **#optional**\ (classname) -- this symbol will not be added to either the run or load dependencies of the current class, even if it was detected as a dependency by the automatic analysis
  * **#asset**\ (resourcepattern)  -- resources that are used by this class (required if the class uses resources such as icons)
  * **#cldr** -- indicates that this class requires CLDR data at runtime

* **Single Definition**: One call to a *define()* method, such as qx.(:doc:`Class </pages/core/classes>`\|\ :doc:`Theme </pages/gui_toolkit/ui_theming>`\|\ :doc:`Interface </pages/core/interfaces>`\|\ :doc:`Mixin </pages/core/mixins>`\|...).define().

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

