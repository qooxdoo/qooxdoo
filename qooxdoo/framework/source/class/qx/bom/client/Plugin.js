/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Contains detection for QuickTime, Windows Media, DivX, Silverlight adn gears.
 * If no version could be detected the version is set to an empty string as
 * default.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Plugin",
{
  statics :
  {
    /**
     * Checkes for the availability of google gears plugin.
     *
     * @internal
     * @return {Boolean} <code>true</code> if gears is available
     */
    getGears : function() {
      return !!(window.google && window.google.gears);
    },


    /**
     * Database of supported features.
     * Filled with additional data at initialization
     */
    __db :
    {
      quicktime :
      {
        plugin : "QuickTime",
        control : "QuickTimeCheckObject.QuickTimeCheck.1"
        // call returns boolean: instance.IsQuickTimeAvailable(0)
      },

      wmv :
      {
        plugin : "Windows Media",
        control : "WMPlayer.OCX.7"
        // version string in: instance.versionInfo
      },

      divx :
      {
        plugin : "DivX Web Player",
        control : "npdivx.DivXBrowserPlugin.1"
      },

      silverlight :
      {
        plugin : "Silverlight",
        control : "AgControl.AgControl"
        // version string in: instance.version (Silverlight 1.0)
        // version string in: instance.settings.version (Silverlight 1.1)
        // version check possible using instance.IsVersionSupported
      }
    },


    /**
     * Fetches the version of the quicktime plugin.
     * @return {String} The version of the plugin, if available,
     *   an empty string otherwise
     * @internal
     */
    getQuicktimeVersion : function() {
      var entry = qx.bom.client.Plugin.__db["quicktime"];
      return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
    },


    /**
     * Fetches the version of the windows media plugin.
     * @return {String} The version of the plugin, if available,
     *   an empty string otherwise
     * @internal
     */
    getWindowsMediaVersion : function() {
      var entry = qx.bom.client.Plugin.__db["wmv"];
      return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
    },


    /**
     * Fetches the version of the divx plugin.
     * @return {String} The version of the plugin, if available,
     *   an empty string otherwise
     * @internal
     */
    getDivXVersion : function() {
      var entry = qx.bom.client.Plugin.__db["divx"];
      return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
    },


    /**
     * Fetches the version of the silverlight plugin.
     * @return {String} The version of the plugin, if available,
     *   an empty string otherwise
     * @internal
     */
    getSilverlightVersion : function() {
      var entry = qx.bom.client.Plugin.__db["silverlight"];
      return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
    },


    /**
     * Checks if the quicktime plugin is available.
     * @return {Boolean} <code>true</code> if the plugin is available
     * @internal
     */
    getQuicktime : function() {
      var entry = qx.bom.client.Plugin.__db["quicktime"];
      return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
    },


    /**
     * Checks if the windows media plugin is available.
     * @return {Boolean} <code>true</code> if the plugin is available
     * @internal
     */
    getWindowsMedia : function() {
      var entry = qx.bom.client.Plugin.__db["wmv"];
      return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
    },


    /**
     * Checks if the divx plugin is available.
     * @return {Boolean} <code>true</code> if the plugin is available
     * @internal
     */
    getDivX : function() {
      var entry = qx.bom.client.Plugin.__db["divx"];
      return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
    },


    /**
     * Checks if the silverlight plugin is available.
     * @return {Boolean} <code>true</code> if the plugin is available
     * @internal
     */
    getSilverlight : function() {
      var entry = qx.bom.client.Plugin.__db["silverlight"];
      return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
    },


    /**
     * Internal helper for getting the version of a given plugin.
     *
     * @param activeXName {String} The name which should be used to generate
     *   the test ActiveX Object.
     * @param pluginName {String} The name with which the pugin is listed in
     *   the navigator.plugins list.
     * @return {String} The version of the plugin as string.
     */
    __getVersion : function(activeXName, pluginName) {
      var available = qx.bom.client.Plugin.__isAvailable(
        activeXName, pluginName
      );
      // don't check if the plugin is not available
      if (!available) {
        return "";
      }

      // IE checks
      if (qx.bom.client.Engine.getName() == "mshtml") {
        var obj = new ActiveXObject(activeXName);

        try {
          var version = obj.versionInfo;
          if (version != undefined) {
            return version;
          }

          version = obj.version;
          if (version != undefined) {
            return version;
          }

          version = obj.settings.version;
          if (version != undefined) {
            return version;
          }
        } catch (ex) {
          return "";
        }

        return "";

      // all other browsers
      } else {
        var plugins = navigator.plugins;

        var verreg = /([0-9]\.[0-9])/g;
        for (var i = 0; i < plugins.length; i++)
        {
          var plugin = plugins[i];
          if (plugin.name.indexOf(pluginName) !== -1)
          {
            if (verreg.test(plugin.name) || verreg.test(plugin.description)) {
              return RegExp.$1;
            } else {
              return "";
            }
            return "";
          }
        }
      }
    },


    /**
     * Internal helper for getting the availability of a given plugin.
     *
     * @param activeXName {String} The name which should be used to generate
     *   the test ActiveX Object.
     * @param pluginName {String} The name with which the pugin is listed in
     *   the navigator.plugins list.
     * @return {Boolean} <code>true</code>, if the plugin available
     */
    __isAvailable : function(activeXName, pluginName) {
      // IE checks
      if (qx.bom.client.Engine.getName() == "mshtml") {

        var control = window.ActiveXObject;
        if (!control) {
          return false;
        }

        try {
          new ActiveXObject(activeXName);
        } catch(ex) {
          return false;
        }

        return true;
      // all other
      } else {

        var plugins = navigator.plugins;
        if (!plugins) {
          return false;
        }

        var name;
        for (var i = 0; i < plugins.length; i++)
        {
          name = plugins[i].name;

          if (name.indexOf(pluginName) !== -1) {
            return true;
          }
        }
        return false;
      }
    }
  }
});
