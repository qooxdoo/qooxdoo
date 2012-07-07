(function()
{
  var jsFileURL;
  var jsSourceURL;

  /*
     This class contains code based on the following work:

     * parseUri
       http://blog.stevenlevithan.com/archives/parseuri
       Version  1.2.1

       Copyright:
         (c) 2007, Steven Levithan <http://stevenlevithan.com>

       License:
         MIT: http://www.opensource.org/licenses/mit-license.php

       Authors:
         * Steven Levithan
  */

  function parseUri (str) {
    var  o   = parseUri.options,
      m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
      uri = {},
      i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
  };

  parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
      name:   "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };

  function getDataFromLocation()
  {
    var uri = parseUri(location.href);
    var theme = uri.queryKey["qx.theme"] || "qx.theme.Indigo";
    theme = theme.split(".").pop().toLowerCase();

    jsFileURL = "script/widgetbrowser." + theme + ".js";
  }

  function loadScript()
  {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = jsFileURL;
    head.appendChild(script);
  }

  getDataFromLocation();
  loadScript();
})();
