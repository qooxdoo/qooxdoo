/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Stefan Andersson (sand)

************************************************************************ */

/**
 * The purpose of this class is to contain all checks for WebSocket.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.WebSocket",
{
  statics :
  {
    /**
     * Checks if WebSocket is available.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getSupport : function() {
var isSupported = (("WebSocket" in window && window.WebSocket != undefined) ||
                   ("MozWebSocket" in window));

/* This line exists because my Galaxy Tab 2 would otherwise appear to have support. */
if (isSupported && navigator.userAgent.indexOf("Android") > 0)
  isSupported = false;


      return ("WebSocket" in window || "MozWebSocket" in window);
    },

    /**
     * Checks for the WebSocket method and return the prefixed name.
     * @internal
     * @return {String|null} A string the method name or null, if the method
     *   is not supported.
     */
    getWebSocket : function() {
      var choices = [
        "WebSocket",
//        "msWebSocket", // currently unspecified, so we guess the name!
//        "webkitWebSocket", // currently unspecified, so we guess the name!
        "MozWebSocket"
//        "oWebSocket" // currently unspecified, so we guess the name!
      ];
      for (var i=0; i < choices.length; i++) {
        if (window[choices[i]] != undefined) {
          return choices[i];
        }
      };

      return null;
    }
  },

  defer : function(statics) {
    qx.core.Environment.add("io.websocket", statics.getSupport);
  }
});
