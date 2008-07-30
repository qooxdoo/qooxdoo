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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/*)
#asset(qx/icon/Oxygen/*)
#asset(qx/icon/Tango/*)
#asset(demobrowser/image/*)
#asset(demobrowser/css/*)

************************************************************************ */

/**
 * The main application class.
 */

qx.Class.define("demobrowser.Application",
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
     * TODOC
     *
     * @type member
     * @return {void}
     */
    main : function()
    {
      this.base(arguments);

      if (qx.core.Variant.isSet("qx.debug", "on")) 
      {
        qx.log.appender.Native;
        qx.log.appender.Console;        
      }

      // Include CSS files
      qx.bom.Stylesheet.includeFile("demobrowser/css/style.css");
      qx.bom.Stylesheet.includeFile("demobrowser/css/sourceview.css");

      // Initialize the viewer
      this.viewer = new demobrowser.DemoBrowser;
      this.getRoot().add(this.viewer, {edge:0});

      // Load data file
      qx.event.Timer.once(this._load, this, 0);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _load : function() {
      this.viewer.dataLoader("script/demodata.js");
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("viewer");
  }
});
