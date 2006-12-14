/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(api)
#resource(apistyles:css)
#resource(apiimages:image)
#embed(apistyles/*)

************************************************************************ */

/**
 * Your custom application
 */
qx.OO.defineClass("apiviewer.Application", qx.component.AbstractApplication,
function () {
  qx.component.AbstractApplication.call(this);
});

qx.Settings.setDefault("resourceUri", "./resource");





/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

qx.Proto.initialize = function(e)
{
  // Define alias for custom resource path
  qx.manager.object.AliasManager.getInstance().add("api", qx.Settings.getValueOfClass("apiviewer.Application", "resourceUri"));

  // Reduce log level
  qx.dev.log.Logger.ROOT_LOGGER.setMinLevel(qx.dev.log.Logger.LEVEL_WARN);

  // Include CSS file
  qx.dom.StyleSheet.includeFile(qx.manager.object.AliasManager.getInstance().resolvePath("api/css/apiviewer.css"));
};

qx.Proto.main = function(e)
{
  // Initialize the viewer
  this.viewer = new apiviewer.Viewer;
  this.viewer.addToDocument();
};

qx.Proto.finalize = function(e)
{
  // Finally load the data
  this.viewer.load("script/apidata.js");
};
