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

#module(buildtool)
#resource(buildtool.css:css)
#resource(buildtool.image:image)

#embed(qx.icontheme/16/*)
#embed(buildtool.image/*)
#embed(buildtool.css/*)

************************************************************************ */

/**
 * The main application class.
 */
qx.Class.define("buildtool.Application",
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
      qx.io.Alias.getInstance().add("buildtool", qx.core.Setting.get("buildtool.resourceUri"));

      // Include CSS files
      qx.html.StyleSheet.includeFile(qx.io.Alias.getInstance().resolve("buildtool/css/style.css"));

      // Initialize the viewer
      this.viewer = new buildtool.AppFrame;
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
      this.viewer.dataLoader();
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : { "buildtool.resourceUri" : "./resource" },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("viewer");
  }
});
