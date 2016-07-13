/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * The purpose of this class is to contain all checks for PhoneGap/Cordova.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.PhoneGap",
{
  statics :
  {
    /**
     * Checks if PhoneGap/Cordova is available.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getPhoneGap : function() {
      return ("cordova" in window || "Cordova" in window || "PhoneGap" in window);
    },


    /**
     * Checks if notifications can be displayed.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getNotification : function() {
      return "notification" in navigator;
    }
  },

  defer : function(statics) {
    qx.core.Environment.add("phonegap", statics.getPhoneGap);
    qx.core.Environment.add("phonegap.notification", statics.getNotification);
  }
});
