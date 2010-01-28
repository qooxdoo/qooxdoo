/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Wrapper class for bit.ly URL shortening service.
 */
qx.Class.define("playground.UrlShorter", 
{
  extend : qx.core.Object,


  /*
   *****************************************************************************
      STATICS
   *****************************************************************************
  */
  statics :
  {
    /**
     * Global handler for the url shortening JSONP call.
     *
     * @param data {Object} The data from the JSONP call.
     */
    handleShortendURl : function(data)
    {
      var error = null;
      var url = null;
      
      if (data.results) {
        var info = data.results[qx.lang.Object.getKeys(data.results)[0]];
        if (info.statusCode == "ERROR") {
          error = info.errorMessage;
        } else {
          url = info.shortUrl;
        }
      } else {
        error = data.errorMessage;
      }
      var context = playground.UrlShorter.__context;
      playground.UrlShorter.__callback.apply(context, [url, error]);
      playground.UrlShorter.__callback = null;
      playground.UrlShorter.__context = null;
    }
  },


  members :
  {
    __callback : null,
    __context : null,
    
    // API-Key for bit.ly
    __bitlyKey: "R_84ed30925212f47f60d700fdfc225e33",
    
    
    /**
     * Method for shortening a url using the bit.ly JSONP service.
     * 
     * @param longurl {String} The url to shorten.
     * @param callback {Function} The function to call on finish.
     * @param context {Object} The context of the callback.
     */
    shorten : function(longurl, callback, context) {
      var encodedLongUrl = encodeURIComponent(longurl);
      if (encodedLongUrl.length > 2048) {
        window.setTimeout(function() {
          callback.apply(context, [null, "The given URL is too long."]);
        }, 0);
        return;
      }
      var url = "http://api.bit.ly/shorten?version=2.0.1" + 
        "&login=qooxdoo" + 
        "&longUrl=" + encodedLongUrl + 
        "&apiKey=" + this.__bitlyKey + 
        "&callback=playground.UrlShorter.handleShortendURl";
      var loader = new qx.io.ScriptLoader();
      loader.load(url);    
      playground.UrlShorter.__callback = callback;
      playground.UrlShorter.__context = context;
    }
  }
});
