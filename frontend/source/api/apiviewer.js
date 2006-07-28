qx.dev.log.Logger.ROOT_LOGGER.setMinLevel(qx.dev.log.Logger.LEVEL_ERROR);

qx.core.Init.defineMain(function()
{
  qx.manager.object.ImageManager.defineAlias("images", "images");
  var viewer = new qx.apiviewer.ApiViewer(this.getClientWindow());
  viewer.loadDocTreeFromUrl("api.js");
});
