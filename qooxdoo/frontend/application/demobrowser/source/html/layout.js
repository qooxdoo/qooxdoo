(function ()
{
  if (parent && parent.qx != window.qx)
  {
    var demobrowser = parent.demobrowser;
    var appender = parent.qx.core.Init.getInstance().getApplication().viewer.logappender;

    qx.log.Logger.ROOT_LOGGER.removeAllAppenders();
    qx.log.Logger.ROOT_LOGGER.addAppender(appender);
  }
  else
  {
    var url = location.href;
    var pos = url.indexOf("/html/")+6;
    var split = url.substring(pos).split("/");
    var category = split[0];
    category = category.charAt(0).toUpperCase() + category.substring(1);
    var pagename = split[1].replace(".html", "").replace(/_/g, " ");
    pagename = pagename.charAt(0).toUpperCase() + pagename.substring(1);
    var div = String.fromCharCode(187);

    document.title = "qooxdoo " + div + " Demo Browser " + div + " Sample " + div + " " + category + " " + div + " " + pagename;
  }
})();

qx.Class.include(qx.core.Init, qx.core.MLegacyInit);
