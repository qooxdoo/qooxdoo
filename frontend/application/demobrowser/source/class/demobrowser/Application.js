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

#module(demobrowser)
#resource(css:css)
#resource(image:image)

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

  members :
  {
    main : function()
    {
      this.base(arguments);

      // Define alias for custom resource path
      //qx.manager.object.AliasManager.getInstance().add("demobrowser", qx.core.Setting.get("demobrowser.resourceUri"));
      qx.io.Alias.getInstance().add("demobrowser", qx.core.Setting.get("demobrowser.resourceUri"));

      // Include CSS file
      qx.html.StyleSheet.includeFile(qx.io.Alias.getInstance().resolve("demobrowser/css/style.css"));

      // Initialize the viewer
      this.viewer = new demobrowser.DemoBrowser;
      this.viewer.addToDocument();
    }
  },

  settings : {
    "demobrowser.resourceUri" : "./resource"
  }
});
