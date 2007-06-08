(function ()
{
  // Update appender to use parent log frame
  if (parent && parent.qx != window.qx)
  {
    var demobrowser = parent.demobrowser;
    var appender = parent.qx.core.Init.getInstance().getApplication().viewer.logappender;

    qx.log.Logger.ROOT_LOGGER.removeAllAppenders();
    qx.log.Logger.ROOT_LOGGER.addAppender(appender);
  }

  // Fix document title
  var url = location.href;
  var pos = url.indexOf("/html/")+6;
  var split = url.substring(pos).split("/");
  var category = split[0];
  category = category.charAt(0).toUpperCase() + category.substring(1);
  var pagename = split[1].replace(".html", "").replace(/_/g, " ");
  pagename = pagename.charAt(0).toUpperCase() + pagename.substring(1);
  var div = String.fromCharCode(187);

  document.title = "qooxdoo " + div + " Demo Browser " + div + " " + category + " " + div + " " + pagename;

  // Enable legacy init process
  qx.Class.include(qx.core.Init, qx.core.MLegacyInit);

  // Include Google Analytics in online version
  if (location.hostname === "qooxdoo.org" || location.hostname === "demo.qooxdoo.org") {
    document.write('<script src="http://www.google-analytics.com/urchin.js" type="text/javascript"></script><script type="text/javascript">_uacct = "UA-415440-1"; urchinTracker();</script>');
  }
})();
