/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(qxadmin)
#resource(qxadmin.css:css)
#resource(qxadmin.image:image)

#embed(qx.icontheme/16/*)
#embed(qxadmin.image/*)
#embed(qxadmin.css/*)

************************************************************************ */

/**
 * The main application class.
 */
qx.Class.define("qxadmin.Application",
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
      qx.io.Alias.getInstance().add("qxadmin", qx.core.Setting.get("qxadmin.resourceUri"));

      // Include CSS files
      qx.html.StyleSheet.includeFile(qx.io.Alias.getInstance().resolve("qxadmin/css/style.css"));
      qx.html.StyleSheet.includeFile(qx.io.Alias.getInstance().resolve("qxadmin/css/sourceview.css"));

      // Initialize the viewer
      this.viewer = new qxadmin.AppFrame;
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

  settings : { "qxadmin.resourceUri" : "./resource" },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("viewer");
  }
});
