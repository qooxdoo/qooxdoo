/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * Your apiviewer application
 *
 * @asset(apiviewer/*)
 */
qx.Class.define("apiviewer.Application",
{
  extend : qx.application.Standalone,

  construct : function()
  {
    this.base(arguments);
    var uri = qx.util.ResourceManager.getInstance().toUri("apiviewer/css/apiviewer.css");
    qx.bom.Stylesheet.includeFile(uri);
  },

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
      if (qx.core.Environment.get("qx.debug"))
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
      this.controller.load("script/apidata.json");
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("viewer", "controller");
  }
});
