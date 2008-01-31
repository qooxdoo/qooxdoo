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

#module(demobrowser)
#resource(demobrowser.css:css)
#resource(demobrowser.image:image)

#embed(qx.icontheme/16/*)
#embed(demobrowser.image/*)
#embed(demobrowser.css/*)

************************************************************************ */

/**
 * The main application class.
 */
qx.Class.define("demobrowser.Application",
{
  extend : qx.application.Gui,




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

      // Define alias for custom resource path
      qx.io.Alias.getInstance().add("demobrowser", qx.core.Setting.get("demobrowser.resourceUri"));

      // Include CSS files
      qx.html.StyleSheet.includeFile(qx.io.Alias.getInstance().resolve("demobrowser/css/style.css"));
      qx.html.StyleSheet.includeFile(qx.io.Alias.getInstance().resolve("demobrowser/css/sourceview.css"));

      // Initialize the viewer
      this.viewer = new demobrowser.DemoBrowser;
      this.viewer.addToDocument();

      // Load data file
      qx.client.Timer.once(this._load, this, 0);
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
     SETTINGS
  *****************************************************************************
  */

  settings : { "demobrowser.resourceUri" : "./resource" },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("viewer");
  }
});
