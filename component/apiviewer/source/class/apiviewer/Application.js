/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(apiviewer/*)

************************************************************************ */

/**
 * Your apiviewer application
 */
qx.Class.define("apiviewer.Application",
{
  extend : qx.application.Standalone,



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
      // Call super class
      this.base(arguments);

      // Add log appenders
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      qx.Class.include(qx.ui.core.Widget, apiviewer.MWidgetRegistry);

      this.viewer = new apiviewer.Viewer();
      this.controller = new apiviewer.Controller();

      this.getRoot().add(this.viewer, {edge : 0});
    },


    // overridden
    finalize : function()
    {
      this.base(arguments);

      // Finally load the data
      this.controller.load("script/apidata.js");
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function()
  {
    // Include CSS file
    qx.bom.Stylesheet.includeFile("apiviewer/css/apiviewer.css");
  }
});
