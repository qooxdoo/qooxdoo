/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(testrunner/*)

************************************************************************ */

/**
 * The main application class.
 */
qx.Class.define("testrunner.runner.Application",
{
  extend : qx.legacy.application.Gui,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    main : function()
    {
      this.base(arguments);

      // Include CSS file
      qx.bom.Stylesheet.includeFile("testrunner/css/testrunner.css");

      // Initialize the viewer
      this.viewer = new testrunner.runner.TestRunner;

      // this.viewer = new testrunner.runner.BasicRunner;
      this.viewer.addToDocument();
    },

    // overridden
    finalize : function()
    {
      this.base(arguments);

      // Finally load the data
      this.viewer.load();
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function () {
    this._disposeObjects("viewer");
  }
});
