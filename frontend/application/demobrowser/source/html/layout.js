(function ()
{
  if (parent && parent.demobrowser) {
    var demobrowser = parent.demobrowser;
    var logger = parent.qx.core.Init.getInstance().getApplication().viewer.logappender;
    if (logger)
    {
      qx.log.Logger.ROOT_LOGGER.removeAllAppenders();
      qx.log.Logger.ROOT_LOGGER.addAppender(logger);
    } else
    {
      alert("Could not attach parent logger (" + parent.qx.core.Init.getInstance().getApplication().viewer + ")");
    }
  }
  else
  {
    alert("Cannot set demobrowswer's log appender!");
  }
})();

qx.Class.include(qx.core.Init, qx.core.MLegacyInit);
