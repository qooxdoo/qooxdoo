/* ************************************************************************

   Copyright: 2019 undefined

   License: MIT license

   Authors: undefined

************************************************************************ */

/**
 * This is the main application class of "issue553"
 *
 * @asset(issue553/*)
 */
qx.Class.define("issue553.ApplicationTwo",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);
    }
  }
});