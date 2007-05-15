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

#module(qxunit)
#resource(css:css)
#resource(image:image)

#embed(qx.icontheme/16/*)
#embed(qxunit.image/*)
#embed(qxunit.css/*)

************************************************************************ */

/**
 * The main application class.
 */
qx.Class.define("qxunit.runner.Application",
{
  extend : qx.application.Gui,

  members :
  {
    main : function()
    {
      this.base(arguments);

      // Define alias for custom resource path
      qx.manager.object.AliasManager.getInstance().add("qxunit", qx.core.Setting.get("qxunit.resourceUri"));

      // Include CSS file
      qx.html.StyleSheet.includeFile(qx.manager.object.AliasManager.getInstance().resolvePath("qxunit/css/qxunit.css"));

      // Initialize the viewer
      this.viewer = new qxunit.runner.TestRunner;
      //this.viewer = new qxunit.runner.BasicRunner;
      this.viewer.addToDocument();
    }
  },

  settings : {
    "qxunit.resourceUri" : "./resource"
  }
});
