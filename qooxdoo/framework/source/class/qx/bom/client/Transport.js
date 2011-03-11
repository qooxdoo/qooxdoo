/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Carsten Lergenmueller (carstenl)
     * Fabian Jakobs (fbjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Determines browser-dependent information about the transport layer.
 * 
 * This class is used by {@link qx.core.Environment} and should not be used 
 * directly. Please check its class comment for details how to use it.
 * 
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Transport",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Returns the maximum number of parallel requests the current browser
     * supports per host addressed.
     *
     * Note that this assumes one connection can support one request at a time
     * only. Technically, this is not correct when pipelining is enabled (which
     * it currently is only for IE 8 and Opera). In this case, the number
     * returned will be too low, as one connection supports multiple pipelined
     * requests. This is accepted for now because pipelining cannot be
     * detected from JavaScript and because modern browsers have enough
     * parallel connections already - it's unlikely an app will require more
     * than 4 parallel XMLHttpRequests to one server at a time.
     * 
     * @internal
     */
    getMaxConcurrentRequestCount: function()
    {
      var maxConcurrentRequestCount;

      // Parse version numbers.
      var versionParts = qx.bom.client.Engine.getVersion().split(".");
      var versionMain = 0;
      var versionMajor = 0;
      var versionMinor = 0;

      // Main number
      if (versionParts[0]) {
        versionMain = versionParts[0];
      }

      // Major number
      if (versionParts[1]) {
        versionMajor = versionParts[1];
      }

      // Minor number
      if (versionParts[2]) {
        versionMinor = versionParts[2];
      }

      // IE 8 gives the max number of connections in a property
      // see http://msdn.microsoft.com/en-us/library/cc197013(VS.85).aspx
      if (window.maxConnectionsPerServer){
        maxConcurrentRequestCount = window.maxConnectionsPerServer;

      } else if (qx.bom.client.Engine.getName() == "opera") {
        // Opera: 8 total
        // see http://operawiki.info/HttpProtocol
        maxConcurrentRequestCount = 8;

      } else if (qx.bom.client.Engine.getName() == "webkit") {
        // Safari: 4
        // http://www.stevesouders.com/blog/2008/03/20/roundup-on-parallel-connections/

        // TODO: Distinguish Chrome from Safari, Chrome has 6 connections
        //       according to
        //      http://stackoverflow.com/questions/561046/how-many-concurrent-ajax-xmlhttprequest-requests-are-allowed-in-popular-browser

        maxConcurrentRequestCount = 4;

      } else if (qx.bom.client.Engine.getName() == "gecko"
                 && ( (versionMain >1)
                      || ((versionMain == 1) && (versionMajor > 9))
                      || ((versionMain == 1) && (versionMajor == 9) && (versionMinor >= 1)))){
          // FF 3.5 (== Gecko 1.9.1): 6 Connections.
          // see  http://gemal.dk/blog/2008/03/18/firefox_3_beta_5_will_have_improved_connection_parallelism/
          maxConcurrentRequestCount = 6;

      } else {
        // Default is 2, as demanded by RFC 2616
        // see http://blogs.msdn.com/ie/archive/2005/04/11/407189.aspx
        maxConcurrentRequestCount = 2;
      }

      return maxConcurrentRequestCount;
    },


    /**
     * Checks whether the app is loaded with SSL enabled which means via https.
     * 
     * @internal
     * @return {Boolean} <code>true</code>, if the app runs on https
     */
    getSSL : function() {
      return window.location.protocol === "https:";
    },

    /**
     * Checks whether the browser supports the XMLHttpRequest object.
     *
     * @internal
     * @return {Boolean} <code>true</code>, if the browser provides <code>XMLHttpRequest</code>.
     */
    getXmlHttpRequest : function() {
      // Do not use qx.core.Environment to avoid circular references
      var name = qx.bom.client.Engine.getName();
      var version = qx.bom.client.Engine.getVersion();

      var isIE7 = name == "mshtml" && version == "7.0";
      return !!(!isIE7 && window.XMLHttpRequest);
    }
  }
});
