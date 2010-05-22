Code Structure
**************

This is how a single source file should look like:

  * **UTF-8 encoding**:All source files should be encoded in UTF-8.
  * **optional Header**:A comment holding author, copyrights, etc.
  * **optional Compiler Hints**:Can be any number of the following:
    * **#use**(classpattern) -- other class that has to be added to the application
    * **#require**(classpattern)  -- other class that has to be added to the application *before* this class
    * **#asset**(resourcepattern)  -- resources that are used by this class (required if the class uses resources)
    * **#ignore**(classname)  -- unknown global symbol (like e.g. a class name) that the compiler should not complain about (ie. you know will be available in the running application)
  * a **single Definition**:One call to a *define()* method, such as *qx.([[classes|Class]]|[[ui_theming|Theme]]|[[interfaces|Interface]]|[[mixins|Mixin]]|...).define()*.

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

