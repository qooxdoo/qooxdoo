/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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
#embed(apiviewer.css/*)

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
      //qx.html.StyleSheet.includeFile(qx.manager.object.AliasManager.getInstance().resolvePath("qxunit/css/qxunit.css"));

      // preload images
      //var preloader = new qx.io.image.PreloaderSystem(apiviewer.TreeUtil.PRELOAD_IMAGES);
      //preloader.start();

      // Initialize the viewer
      this.viewer = new qxunit.runner.TestRunner;
      this.viewer.addToDocument();
    }
  },

  settings : {
    "qxunit.resourceUri" : "./resource"
  }
});
