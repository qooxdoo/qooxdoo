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

************************************************************************ */

/* ************************************************************************

#asset(apiviewer/*)

************************************************************************ */

/**
 * The main application class.
 */
qx.Class.define("apiviewer.Application",
{
  extend : qx.legacy.application.Gui,

  members :
  {
    main : function()
    {
      this.base(arguments);

      // Use log appenders in debug mode
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      qx.Class.include(qx.legacy.ui.core.Widget, apiviewer.MWidgetRegistry);

      // Include CSS file
      qx.bom.Stylesheet.includeFile("apiviewer/css/apiviewer.css");

      // preload images
      var preloader = new qx.legacy.io.image.PreloaderSystem(apiviewer.TreeUtil.PRELOAD_IMAGES);
      preloader.start();

      // Initialize the viewer
      this.viewer = new apiviewer.Viewer();
      this.controller = new apiviewer.Controller();
      this.viewer.addToDocument();

      // Load data file
      qx.event.Timer.once(this._load, this, 0);
    },

    _load : function()
    {
      // Finally load the data
      this.controller.load("script/apidata.js");
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("viewer", "controller");
  }
});
